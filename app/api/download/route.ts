import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CorruptionEvent } from '@prisma/client'
import {
    Dataset,
    Format,
    StatsBy,
    ColumnDef,
    AuditRow,
    EVENT_COLUMNS,
    RAW_COLUMNS,
    AUDIT_COLUMNS,
    MAX_INMEMORY_ROWS,
    STREAM_BATCH,
    selectColumns,
    buildEventWhere,
    buildRawWhere,
    classifyDecision,
    csvHeaderLine,
    csvRowLine,
    buildSpreadsheetML,
    rowToObject,
    stamp,
} from '@/lib/download'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const encoder = new TextEncoder()

function fileHeaders(format: Format, base: string): Record<string, string> {
    const map: Record<Format, { ext: string; mime: string }> = {
        csv: { ext: 'csv', mime: 'text/csv; charset=utf-8' },
        xlsx: { ext: 'xls', mime: 'application/vnd.ms-excel; charset=utf-8' },
        json: { ext: 'json', mime: 'application/json; charset=utf-8' },
        geojson: { ext: 'geojson', mime: 'application/geo+json; charset=utf-8' },
    }
    const { ext, mime } = map[format]
    return {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${base}_${stamp()}.${ext}"`,
        'Cache-Control': 'no-store',
    }
}

function inMemoryResponse<T>(
    cols: ColumnDef<T>[],
    rows: T[],
    format: Format,
    base: string,
    sheetName: string,
): NextResponse {
    if (format === 'xlsx') {
        return new NextResponse(buildSpreadsheetML(cols, rows, sheetName), { headers: fileHeaders('xlsx', base) })
    }
    if (format === 'json') {
        const body = JSON.stringify(rows.map((r) => rowToObject(cols, r)))
        return new NextResponse(body, { headers: fileHeaders('json', base) })
    }
    // csv
    const lines = [csvHeaderLine(cols), ...rows.map((r) => csvRowLine(cols, r))]
    return new NextResponse('﻿' + lines.join('\r\n'), { headers: fileHeaders('csv', base) })
}

// --- Events: small dataset (~1.8k), build everything in memory ---------------
async function handleEvents(sp: URLSearchParams, format: Format): Promise<NextResponse> {
    const where = buildEventWhere(sp)
    const cols = selectColumns(EVENT_COLUMNS, sp.get('cols'))
    const events = await prisma.corruptionEvent.findMany({ where, orderBy: { publishedAt: 'desc' } })

    if (format === 'geojson') {
        const features = events
            .filter((e: CorruptionEvent) => e.latitude != null && e.longitude != null)
            .map((e: CorruptionEvent) => ({
                type: 'Feature' as const,
                geometry: { type: 'Point' as const, coordinates: [e.longitude, e.latitude] },
                properties: rowToObject(cols, e),
            }))
        const fc = { type: 'FeatureCollection' as const, features }
        return new NextResponse(JSON.stringify(fc), { headers: fileHeaders('geojson', 'corruption_events') })
    }

    return inMemoryResponse(cols, events, format, 'corruption_events', 'Events')
}

// --- Raw corpus: up to 132k+ rows, stream CSV/JSON, cap XLSX -----------------
async function handleRaw(sp: URLSearchParams, format: Format): Promise<NextResponse> {
    const where = buildRawWhere(sp)
    const cols = selectColumns(RAW_COLUMNS, sp.get('cols'))

    if (format === 'xlsx') {
        const rows = await prisma.rawNewsArticle.findMany({
            where,
            orderBy: { id: 'asc' },
            take: MAX_INMEMORY_ROWS,
        })
        const res = new NextResponse(buildSpreadsheetML(cols, rows, 'Raw Articles'), {
            headers: fileHeaders('xlsx', 'raw_articles'),
        })
        if (rows.length >= MAX_INMEMORY_ROWS) res.headers.set('X-Row-Cap', String(MAX_INMEMORY_ROWS))
        return res
    }

    // Streamed CSV / JSON via id cursor — constant memory regardless of size.
    const isJson = format === 'json'
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                if (isJson) controller.enqueue(encoder.encode('['))
                else controller.enqueue(encoder.encode('﻿' + csvHeaderLine(cols) + '\r\n'))

                let cursor: number | null = null
                let first = true
                for (;;) {
                    const batch: any[] = await prisma.rawNewsArticle.findMany({
                        where,
                        orderBy: { id: 'asc' },
                        take: STREAM_BATCH,
                        ...(cursor !== null ? { skip: 1, cursor: { id: cursor } } : {}),
                    })
                    if (batch.length === 0) break
                    for (const row of batch) {
                        if (isJson) {
                            controller.enqueue(encoder.encode((first ? '' : ',') + JSON.stringify(rowToObject(cols, row))))
                            first = false
                        } else {
                            controller.enqueue(encoder.encode(csvRowLine(cols, row) + '\r\n'))
                        }
                    }
                    cursor = batch[batch.length - 1].id
                    if (batch.length < STREAM_BATCH) break
                }
                if (isJson) controller.enqueue(encoder.encode(']'))
                controller.close()
            } catch (err) {
                controller.error(err)
            }
        },
    })
    return new NextResponse(stream, { headers: fileHeaders(format, 'raw_articles') })
}

// --- Aggregated stats: derive in JS from filtered events --------------------
async function handleStats(sp: URLSearchParams, format: Format): Promise<NextResponse> {
    const where = buildEventWhere(sp)
    const by = (sp.get('by') || 'day') as StatsBy
    const events = await prisma.corruptionEvent.findMany({ where, orderBy: { publishedAt: 'desc' } })

    const buckets = new Map<string, { events: number; loss: number }>()
    for (const e of events) {
        let key: string
        if (by === 'category') key = e.category || '(uncategorized)'
        else if (by === 'district') key = e.district || '(unknown)'
        else key = e.publishedAt.toISOString().split('T')[0]
        const b = buckets.get(key) || { events: 0, loss: 0 }
        b.events += 1
        b.loss += e.amountInvolved ?? 0
        buckets.set(key, b)
    }

    const dimHeader = by === 'category' ? 'Category' : by === 'district' ? 'District' : 'Date'
    type StatRow = { dim: string; events: number; loss: number }
    const rows: StatRow[] = Array.from(buckets.entries())
        .map(([dim, v]) => ({ dim, ...v }))
        .sort((a, b) => (by === 'day' ? (a.dim < b.dim ? 1 : -1) : b.events - a.events))

    const cols: ColumnDef<StatRow>[] = [
        { key: 'dim', header: dimHeader, type: 'string', get: (r) => r.dim },
        { key: 'events', header: 'Events', type: 'number', get: (r) => r.events },
        { key: 'loss', header: 'Loss Amount (BDT)', type: 'number', get: (r) => r.loss },
    ]
    const base = `corruption_stats_by_${by}`
    if (format === 'geojson') return NextResponse.json({ error: 'geojson not supported for stats' }, { status: 400 })
    return inMemoryResponse(cols, rows, format, base, dimHeader)
}

// --- Accept/Reject decision audit: every raw article + the pipeline's verdict ---
async function handleAudit(sp: URLSearchParams, format: Format): Promise<NextResponse> {
    if (format === 'geojson') {
        return NextResponse.json({ error: 'geojson not supported for audit' }, { status: 400 })
    }
    const where = buildRawWhere(sp)
    const cols = selectColumns(AUDIT_COLUMNS, sp.get('cols'))

    // Index of accepted (published) events by URL
    const events = await prisma.corruptionEvent.findMany()
    const accepted = new Map<string, CorruptionEvent>()
    for (const e of events) accepted.set(e.url, e)

    if (format === 'xlsx') {
        const raws = await prisma.rawNewsArticle.findMany({ where, orderBy: { id: 'asc' }, take: MAX_INMEMORY_ROWS })
        const rows: AuditRow[] = raws.map((r) => classifyDecision(r, accepted))
        const res = new NextResponse(buildSpreadsheetML(cols, rows, 'Decision Audit'), {
            headers: fileHeaders('xlsx', 'decision_audit'),
        })
        if (raws.length >= MAX_INMEMORY_ROWS) res.headers.set('X-Row-Cap', String(MAX_INMEMORY_ROWS))
        return res
    }

    const isJson = format === 'json'
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                if (isJson) controller.enqueue(encoder.encode('['))
                else controller.enqueue(encoder.encode('﻿' + csvHeaderLine(cols) + '\r\n'))
                let cursor: number | null = null
                let first = true
                for (;;) {
                    const batch: any[] = await prisma.rawNewsArticle.findMany({
                        where,
                        orderBy: { id: 'asc' },
                        take: STREAM_BATCH,
                        ...(cursor !== null ? { skip: 1, cursor: { id: cursor } } : {}),
                    })
                    if (batch.length === 0) break
                    for (const raw of batch) {
                        const row = classifyDecision(raw, accepted)
                        if (isJson) {
                            controller.enqueue(encoder.encode((first ? '' : ',') + JSON.stringify(rowToObject(cols, row))))
                            first = false
                        } else {
                            controller.enqueue(encoder.encode(csvRowLine(cols, row) + '\r\n'))
                        }
                    }
                    cursor = batch[batch.length - 1].id
                    if (batch.length < STREAM_BATCH) break
                }
                if (isJson) controller.enqueue(encoder.encode(']'))
                controller.close()
            } catch (err) {
                controller.error(err)
            }
        },
    })
    return new NextResponse(stream, { headers: fileHeaders(format, 'decision_audit') })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const sp = req.nextUrl.searchParams
    const dataset = (sp.get('dataset') || 'events') as Dataset
    const format = (sp.get('format') || 'csv') as Format
    const validFormats: Format[] = ['csv', 'xlsx', 'json', 'geojson']
    if (!validFormats.includes(format)) {
        return NextResponse.json({ error: 'invalid format' }, { status: 400 })
    }
    try {
        if (dataset === 'events') return await handleEvents(sp, format)
        if (dataset === 'raw') return await handleRaw(sp, format)
        if (dataset === 'stats') return await handleStats(sp, format)
        if (dataset === 'audit') return await handleAudit(sp, format)
        return NextResponse.json({ error: 'invalid dataset' }, { status: 400 })
    } catch (err) {
        console.error('[download] export failed:', err)
        return NextResponse.json({ error: 'export failed' }, { status: 500 })
    }
}
