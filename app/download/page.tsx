'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Download,
    FileSpreadsheet,
    FileJson,
    FileText,
    MapPin,
    Loader2,
    Database,
    Newspaper,
    BarChart3,
    ScanSearch,
    RotateCcw,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

type Dataset = 'events' | 'raw' | 'stats' | 'audit'
type Format = 'csv' | 'xlsx' | 'json' | 'geojson'

interface ColMeta { key: string; label: string }

const EVENT_COLS: ColMeta[] = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'publishedAt', label: 'Published Date' },
    { key: 'dateOfIncident', label: 'Incident Date' },
    { key: 'district', label: 'District' },
    { key: 'locationText', label: 'Location' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'killed', label: 'Killed' },
    { key: 'injured', label: 'Injured' },
    { key: 'severityScore', label: 'Severity' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'category', label: 'Category' },
    { key: 'politicalParties', label: 'Political Parties' },
    { key: 'victimParties', label: 'Victim Parties' },
    { key: 'perpetratorParties', label: 'Perpetrator Parties' },
    { key: 'actors', label: 'Actors' },
    { key: 'summary', label: 'Summary' },
    { key: 'source', label: 'Source' },
    { key: 'additionalSources', label: 'Additional Sources' },
    { key: 'url', label: 'URL' },
    { key: 'isPoliticalViolence', label: 'Is Political Violence' },
    { key: 'aiReasoning', label: 'AI Decision Reasoning' },
    { key: 'createdAt', label: 'Created At' },
]

const RAW_COLS: ColMeta[] = [
    { key: 'id', label: 'ID' },
    { key: 'source', label: 'Source' },
    { key: 'title', label: 'Title' },
    { key: 'publishedAt', label: 'Published Date' },
    { key: 'scrapedAt', label: 'Scraped At' },
    { key: 'isProcessed', label: 'Processed' },
    { key: 'url', label: 'URL' },
    { key: 'content', label: 'Content' },
]

const AUDIT_COLS: ColMeta[] = [
    { key: 'id', label: 'Raw ID' },
    { key: 'decision', label: 'Decision' },
    { key: 'source', label: 'Source' },
    { key: 'title', label: 'Title' },
    { key: 'publishedAt', label: 'Published Date' },
    { key: 'category', label: 'Category' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'severity', label: 'Severity' },
    { key: 'reasoning', label: 'AI Decision Reasoning' },
    { key: 'url', label: 'URL' },
]

const FORMATS: Record<Dataset, Format[]> = {
    events: ['csv', 'xlsx', 'json', 'geojson'],
    raw: ['csv', 'xlsx', 'json'],
    stats: ['csv', 'xlsx', 'json'],
    audit: ['csv', 'xlsx', 'json'],
}

const FORMAT_META: Record<Format, { label: string; icon: typeof FileText }> = {
    csv: { label: 'CSV', icon: FileText },
    xlsx: { label: 'Excel', icon: FileSpreadsheet },
    json: { label: 'JSON', icon: FileJson },
    geojson: { label: 'GeoJSON', icon: MapPin },
}

interface Options {
    districts: string[]
    categories: string[]
    sources: string[]
    parties: string[]
    counts: { events: number; raw: number; rawUnprocessed: number }
}

interface Filters {
    from: string
    to: string
    district: string
    category: string
    minKilled: string
    party: string
    source: string
    processed: string
    by: 'day' | 'category' | 'district'
}

const EMPTY_FILTERS: Filters = {
    from: '', to: '', district: '', category: '', minKilled: '',
    party: '', source: '', processed: '', by: 'day',
}

export default function DownloadPage() {
    const { t } = useLanguage()
    const [dataset, setDataset] = useState<Dataset>('events')
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [options, setOptions] = useState<Options | null>(null)
    const [busy, setBusy] = useState<Format | null>(null)

    const datasetCols = dataset === 'raw' ? RAW_COLS : dataset === 'audit' ? AUDIT_COLS : EVENT_COLS
    const [selectedCols, setSelectedCols] = useState<string[]>(EVENT_COLS.map((c) => c.key))

    useEffect(() => {
        let active = true
        fetch('/api/download/options')
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('options'))))
            .then((d: Options) => { if (active) setOptions(d) })
            .catch(() => { if (active) setOptions(null) })
        return () => { active = false }
    }, [])

    // Reset column selection when the dataset changes.
    useEffect(() => {
        setSelectedCols((dataset === 'raw' ? RAW_COLS : dataset === 'audit' ? AUDIT_COLS : EVENT_COLS).map((c) => c.key))
    }, [dataset])

    const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))

    const toggleCol = (key: string) =>
        setSelectedCols((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

    const buildUrl = (format: Format): string => {
        const p = new URLSearchParams()
        p.set('dataset', dataset)
        p.set('format', format)
        if (filters.from) p.set('from', filters.from)
        if (filters.to) p.set('to', filters.to)
        if (dataset === 'stats') {
            p.set('by', filters.by)
        }
        if (dataset === 'events' || dataset === 'stats') {
            if (filters.district) p.set('district', filters.district)
            if (filters.category) p.set('category', filters.category)
            if (filters.minKilled) p.set('minKilled', filters.minKilled)
            if (filters.party) p.set('party', filters.party)
        }
        if (dataset === 'raw' || dataset === 'audit') {
            if (filters.source) p.set('source', filters.source)
            if (filters.processed) p.set('processed', filters.processed)
        }
        if (dataset !== 'stats' && selectedCols.length > 0 && selectedCols.length < datasetCols.length) {
            p.set('cols', selectedCols.join(','))
        }
        return `/api/download?${p.toString()}`
    }

    const triggerDownload = (format: Format) => {
        setBusy(format)
        const a = document.createElement('a')
        a.href = buildUrl(format)
        document.body.appendChild(a)
        a.click()
        a.remove()
        // The browser handles the stream; clear the spinner shortly after.
        window.setTimeout(() => setBusy(null), 1500)
    }

    const datasetMeta = useMemo(() => ([
        { key: 'events' as Dataset, icon: Database, title: t('dl_ds_events'), desc: t('dl_ds_events_desc'), count: options?.counts.events },
        { key: 'raw' as Dataset, icon: Newspaper, title: t('dl_ds_raw'), desc: t('dl_ds_raw_desc'), count: options?.counts.raw },
        { key: 'stats' as Dataset, icon: BarChart3, title: t('dl_ds_stats'), desc: t('dl_ds_stats_desc'), count: undefined },
        { key: 'audit' as Dataset, icon: ScanSearch, title: t('dl_ds_audit'), desc: t('dl_ds_audit_desc'), count: options?.counts.raw },
    ]), [t, options])

    const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
    const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
                <Download className="w-7 h-7 text-red-600 dark:text-red-500" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('dl_title')}</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-2xl">{t('dl_subtitle')}</p>

            {/* Dataset selector */}
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">{t('dl_dataset')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {datasetMeta.map((d) => {
                    const active = dataset === d.key
                    return (
                        <button
                            key={d.key}
                            onClick={() => setDataset(d.key)}
                            className={`text-left p-4 rounded-xl border transition-all ${active
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/15 ring-1 ring-red-500/30'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'}`}
                        >
                            <d.icon className={`w-6 h-6 mb-2 ${active ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{d.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.desc}</div>
                            {typeof d.count === 'number' && (
                                <div className="text-xs mt-2 font-mono text-gray-400">{d.count.toLocaleString()} {t('dl_records')}</div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t('dl_filters')}</h2>
                <button onClick={() => setFilters(EMPTY_FILTERS)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                    <RotateCcw className="w-3 h-3" /> {t('dl_reset')}
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-2 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                    <label className={labelCls}>{t('dl_from')}</label>
                    <input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>{t('dl_to')}</label>
                    <input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={inputCls} />
                </div>

                {(dataset === 'events' || dataset === 'stats') && (
                    <>
                        <div>
                            <label className={labelCls}>{t('dl_district')}</label>
                            <select value={filters.district} onChange={(e) => set({ district: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {options?.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_category')}</label>
                            <select value={filters.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {options?.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_min_killed')}</label>
                            <input type="number" min={0} value={filters.minKilled} onChange={(e) => set({ minKilled: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_party')}</label>
                            <select value={filters.party} onChange={(e) => set({ party: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {options?.parties.map((pn) => <option key={pn} value={pn}>{pn}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {(dataset === 'raw' || dataset === 'audit') && (
                    <>
                        <div>
                            <label className={labelCls}>{t('dl_source')}</label>
                            <select value={filters.source} onChange={(e) => set({ source: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {options?.sources.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_status')}</label>
                            <select value={filters.processed} onChange={(e) => set({ processed: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                <option value="processed">{t('dl_processed')}</option>
                                <option value="unprocessed">{t('dl_unprocessed')}</option>
                            </select>
                        </div>
                    </>
                )}

                {dataset === 'stats' && (
                    <div>
                        <label className={labelCls}>{t('dl_stats_by')}</label>
                        <select value={filters.by} onChange={(e) => set({ by: e.target.value as Filters['by'] })} className={inputCls}>
                            <option value="day">{t('dl_by_day')}</option>
                            <option value="category">{t('dl_by_category')}</option>
                            <option value="district">{t('dl_by_district')}</option>
                        </select>
                    </div>
                )}
            </div>
            {(dataset === 'raw' || dataset === 'audit') && <p className="text-xs text-amber-600 dark:text-amber-500 mb-8">{t('dl_raw_note')}</p>}
            {dataset !== 'raw' && dataset !== 'audit' && <div className="mb-8" />}

            {/* Column selection (not for stats) */}
            {dataset !== 'stats' && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t('dl_columns')}</h2>
                        <div className="flex gap-3 text-xs">
                            <button onClick={() => setSelectedCols(datasetCols.map((c) => c.key))} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400">{t('dl_select_all')}</button>
                            <button onClick={() => setSelectedCols([])} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400">{t('dl_clear')}</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {datasetCols.map((c) => {
                            const on = selectedCols.includes(c.key)
                            return (
                                <button
                                    key={c.key}
                                    onClick={() => toggleCol(c.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                                >
                                    {c.label}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Download buttons */}
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">{t('dl_download_as')}</h2>
            <div className="flex flex-wrap gap-3">
                {FORMATS[dataset].map((fmt) => {
                    const meta = FORMAT_META[fmt]
                    const disabled = dataset !== 'stats' && selectedCols.length === 0
                    return (
                        <button
                            key={fmt}
                            onClick={() => triggerDownload(fmt)}
                            disabled={disabled || busy !== null}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
                        >
                            {busy === fmt ? <Loader2 className="w-4 h-4 animate-spin" /> : <meta.icon className="w-4 h-4" />}
                            {meta.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
