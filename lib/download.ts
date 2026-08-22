import type { CorruptionEvent, RawNewsArticle, Prisma } from '@prisma/client'

export type Dataset = 'events' | 'raw' | 'stats' | 'audit'
export type Format = 'csv' | 'xlsx' | 'json' | 'geojson'
export type StatsBy = 'day' | 'category' | 'district'

export type CellType = 'string' | 'number' | 'date'
export type CellValue = string | number | null

export interface ColumnDef<T> {
    key: string
    header: string
    type: CellType
    get: (row: T) => CellValue
}

// Cap for in-memory builds (XLSX / GeoJSON) to protect the small live box.
export const MAX_INMEMORY_ROWS = 50000
// Batch size for cursor-streamed exports (CSV / JSON).
export const STREAM_BATCH = 1000

const dateOnly = (d: Date | null | undefined): string =>
    d ? d.toISOString().split('T')[0] : ''
const dateTime = (d: Date | null | undefined): string =>
    d ? d.toISOString().replace('T', ' ').slice(0, 19) : ''

// Party / actor fields are stored either as a plain string or a JSON-encoded array.
export function parseList(v: string | null): string {
    if (!v) return ''
    try {
        const parsed: unknown = JSON.parse(v)
        return Array.isArray(parsed) ? parsed.join('; ') : v
    } catch {
        return v
    }
}

// Human-readable explanation of WHY an article was accepted as an event,
// synthesized entirely from data already stored on the record (no live AI call).
export function buildAcceptReasoning(e: CorruptionEvent): string {
    const meta: string[] = []
    if (e.confidence != null) meta.push(`${Math.round(e.confidence * 100)}% confidence`)
    if (e.severityScore != null) meta.push(`severity ${e.severityScore}/10`)
    if (e.amountFormatted) meta.push(`loss: ${e.amountFormatted}`)
    if (e.sectorOrMinistry) meta.push(`sector: ${e.sectorOrMinistry}`)

    let s = `ACCEPTED — classified as ${e.category || 'corruption'}`
    if (meta.length) s += ` (${meta.join(', ')})`
    if (e.summary) s += `. Basis: ${e.summary}`
    return s
}

// ---------------------------------------------------------------------------
// Column registries
// ---------------------------------------------------------------------------

export const EVENT_COLUMNS: ColumnDef<CorruptionEvent>[] = [
    { key: 'id', header: 'ID', type: 'string', get: (e) => e.id },
    { key: 'title', header: 'Title', type: 'string', get: (e) => e.title },
    { key: 'publishedAt', header: 'Published Date', type: 'date', get: (e) => dateOnly(e.publishedAt) },
    { key: 'dateOfIncident', header: 'Incident Date', type: 'date', get: (e) => dateOnly(e.dateOfIncident) },
    { key: 'district', header: 'District', type: 'string', get: (e) => e.district },
    { key: 'locationText', header: 'Location', type: 'string', get: (e) => e.locationText },
    { key: 'latitude', header: 'Latitude', type: 'number', get: (e) => e.latitude },
    { key: 'longitude', header: 'Longitude', type: 'number', get: (e) => e.longitude },
    { key: 'sectorOrMinistry', header: 'Sector / Ministry', type: 'string', get: (e) => e.sectorOrMinistry },
    { key: 'amountInvolved', header: 'Amount Involved (BDT)', type: 'number', get: (e) => e.amountInvolved },
    { key: 'amountFormatted', header: 'Amount Formatted', type: 'string', get: (e) => e.amountFormatted },
    { key: 'investigatingAgency', header: 'Investigating Agency', type: 'string', get: (e) => e.investigatingAgency },
    { key: 'legalStatus', header: 'Legal Status', type: 'string', get: (e) => e.legalStatus },
    { key: 'severityScore', header: 'Severity', type: 'number', get: (e) => e.severityScore },
    { key: 'confidence', header: 'Confidence', type: 'number', get: (e) => e.confidence },
    { key: 'category', header: 'Category', type: 'string', get: (e) => e.category },
    { key: 'summary', header: 'Summary', type: 'string', get: (e) => e.summary },
    { key: 'source', header: 'Source', type: 'string', get: (e) => e.source },
    { key: 'additionalSources', header: 'Additional Sources', type: 'string', get: (e) => e.additionalSources },
    { key: 'url', header: 'URL', type: 'string', get: (e) => e.url },
    { key: 'isCorruption', header: 'Is Corruption', type: 'string', get: (e) => (e.isCorruption ? 'yes' : 'no') },
    { key: 'aiReasoning', header: 'AI Decision Reasoning', type: 'string', get: (e) => buildAcceptReasoning(e) },
    { key: 'createdAt', header: 'Created At', type: 'date', get: (e) => dateTime(e.createdAt) },
]

export const RAW_COLUMNS: ColumnDef<RawNewsArticle>[] = [
    { key: 'id', header: 'ID', type: 'number', get: (r) => r.id },
    { key: 'source', header: 'Source', type: 'string', get: (r) => r.source },
    { key: 'title', header: 'Title', type: 'string', get: (r) => r.title },
    { key: 'publishedAt', header: 'Published Date', type: 'date', get: (r) => dateOnly(r.publishedAt) },
    { key: 'scrapedAt', header: 'Scraped At', type: 'date', get: (r) => dateTime(r.scrapedAt) },
    { key: 'isProcessed', header: 'Processed', type: 'string', get: (r) => (r.isProcessed ? 'yes' : 'no') },
    { key: 'url', header: 'URL', type: 'string', get: (r) => r.url },
    { key: 'content', header: 'Content', type: 'string', get: (r) => r.content },
]

// --- Accept/Reject decision audit -------------------------------------------
// Joins each raw article to its published event (if any) and explains the
// pipeline's decision, grounded only in stored data.
export type Decision = 'Published' | 'Processed — not published' | 'Pending'

export interface AuditRow {
    raw: RawNewsArticle
    decision: Decision
    event: CorruptionEvent | null
}

export function classifyDecision(raw: RawNewsArticle, accepted: Map<string, CorruptionEvent>): AuditRow {
    const event = accepted.get(raw.url) ?? null
    let decision: Decision
    if (event) decision = 'Published'
    else if (raw.isProcessed) decision = 'Processed — not published'
    else decision = 'Pending'
    return { raw, decision, event }
}

export function buildAuditReasoning(row: AuditRow): string {
    if (row.decision === 'Pending') {
        return 'PENDING — in the backlog, not yet analyzed by the AI pipeline.'
    }
    if (row.decision === 'Published' && row.event) {
        return buildAcceptReasoning(row.event)
    }
    return 'NOT PUBLISHED — processed by the AI but produced no standalone event: either filtered out as non-qualifying (not corruption, off-topic, or outside the recency window) or merged into an existing incident as a duplicate source.'
}

export const AUDIT_COLUMNS: ColumnDef<AuditRow>[] = [
    { key: 'id', header: 'Raw ID', type: 'number', get: (r) => r.raw.id },
    { key: 'decision', header: 'Decision', type: 'string', get: (r) => r.decision },
    { key: 'source', header: 'Source', type: 'string', get: (r) => r.raw.source },
    { key: 'title', header: 'Title', type: 'string', get: (r) => r.raw.title },
    { key: 'publishedAt', header: 'Published Date', type: 'date', get: (r) => dateOnly(r.raw.publishedAt) },
    { key: 'category', header: 'Category', type: 'string', get: (r) => r.event?.category ?? '' },
    { key: 'confidence', header: 'Confidence', type: 'number', get: (r) => r.event?.confidence ?? null },
    { key: 'severity', header: 'Severity', type: 'number', get: (r) => r.event?.severityScore ?? null },
    { key: 'reasoning', header: 'AI Decision Reasoning', type: 'string', get: (r) => buildAuditReasoning(r) },
    { key: 'url', header: 'URL', type: 'string', get: (r) => r.raw.url },
]

export function selectColumns<T>(all: ColumnDef<T>[], cols: string | null): ColumnDef<T>[] {
    if (!cols) return all
    const wanted = cols.split(',').map((c) => c.trim()).filter(Boolean)
    if (wanted.length === 0) return all
    const picked = all.filter((c) => wanted.includes(c.key))
    return picked.length > 0 ? picked : all
}

// ---------------------------------------------------------------------------
// Filter (where) builders
// ---------------------------------------------------------------------------

function dateRange(from: string | null, to: string | null): { gte?: Date; lte?: Date } | undefined {
    const range: { gte?: Date; lte?: Date } = {}
    if (from) {
        const d = new Date(from)
        if (!isNaN(d.getTime())) range.gte = d
    }
    if (to) {
        const d = new Date(to)
        if (!isNaN(d.getTime())) {
            d.setHours(23, 59, 59, 999)
            range.lte = d
        }
    }
    return range.gte || range.lte ? range : undefined
}

function intParam(v: string | null): number | undefined {
    if (!v) return undefined
    const n = parseInt(v, 10)
    return isNaN(n) ? undefined : n
}

export function buildEventWhere(sp: URLSearchParams): Prisma.CorruptionEventWhereInput {
    const where: Prisma.CorruptionEventWhereInput = {}
    const dr = dateRange(sp.get('from'), sp.get('to'))
    if (dr) where.publishedAt = dr

    const district = sp.get('district')
    if (district) where.district = district

    const category = sp.get('category')
    if (category) where.category = { contains: category }

    const minSeverity = intParam(sp.get('minSeverity'))
    if (minSeverity !== undefined) where.severityScore = { gte: minSeverity }

    const sector = sp.get('sector')
    if (sector) where.sectorOrMinistry = { contains: sector }

    return where
}

export function buildRawWhere(sp: URLSearchParams): Prisma.RawNewsArticleWhereInput {
    const where: Prisma.RawNewsArticleWhereInput = {}
    const dr = dateRange(sp.get('from'), sp.get('to'))
    if (dr) where.publishedAt = dr

    const source = sp.get('source')
    if (source) where.source = source

    const processed = sp.get('processed')
    if (processed === 'processed') where.isProcessed = true
    else if (processed === 'unprocessed') where.isProcessed = false

    return where
}

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

export function csvCell(v: CellValue): string {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function csvHeaderLine<T>(cols: ColumnDef<T>[]): string {
    return cols.map((c) => csvCell(c.header)).join(',')
}

export function csvRowLine<T>(cols: ColumnDef<T>[], row: T): string {
    return cols.map((c) => csvCell(c.get(row))).join(',')
}

function xmlEscape(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        // strip control chars invalid in XML
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
}

// Excel 2003 SpreadsheetML — a single XML file Excel & LibreOffice open natively,
// no external dependency required.
export function buildSpreadsheetML<T>(cols: ColumnDef<T>[], rows: T[], sheetName = 'Data'): string {
    const head = cols
        .map((c) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${xmlEscape(c.header)}</Data></Cell>`)
        .join('')

    const body = rows
        .map((row) => {
            const cells = cols
                .map((c) => {
                    const v = c.get(row)
                    if (v === null || v === undefined || v === '') return '<Cell></Cell>'
                    if (c.type === 'number' && typeof v === 'number' && !isNaN(v)) {
                        return `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
                    }
                    return `<Cell><Data ss:Type="String">${xmlEscape(String(v))}</Data></Cell>`
                })
                .join('')
            return `<Row>${cells}</Row>`
        })
        .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>
 </Styles>
 <Worksheet ss:Name="${xmlEscape(sheetName)}">
  <Table>
   <Row>${head}</Row>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`
}

export function rowToObject<T>(cols: ColumnDef<T>[], row: T): Record<string, CellValue> {
    const obj: Record<string, CellValue> = {}
    for (const c of cols) obj[c.key] = c.get(row)
    return obj
}

export function stamp(): string {
    return new Date().toISOString().split('T')[0]
}
