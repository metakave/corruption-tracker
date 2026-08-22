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
    Mail,
    User,
    Building,
    Briefcase,
    Phone,
    CheckCircle2,
    X,
    Sparkles,
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
    { key: 'sectorOrMinistry', label: 'Sector / Ministry' },
    { key: 'amountInvolved', label: 'Amount Involved (BDT)' },
    { key: 'amountFormatted', label: 'Amount Formatted' },
    { key: 'investigatingAgency', label: 'Investigating Agency' },
    { key: 'legalStatus', label: 'Legal Status' },
    { key: 'severityScore', label: 'Severity' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'category', label: 'Category' },
    { key: 'summary', label: 'Summary' },
    { key: 'source', label: 'Source' },
    { key: 'additionalSources', label: 'Additional Sources' },
    { key: 'url', label: 'URL' },
    { key: 'isCorruption', label: 'Is Corruption' },
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
    sectors: string[]
    sources: string[]
    counts: { events: number; raw: number; rawUnprocessed: number }
}

interface Filters {
    from: string
    to: string
    district: string
    category: string
    sector: string
    minSeverity: string
    source: string
    processed: string
    by: 'day' | 'category' | 'district'
}

interface LeadForm {
    name: string
    whatsapp: string
    email: string
    company: string
    designation: string
}

const EMPTY_FILTERS: Filters = {
    from: '', to: '', district: '', category: '', sector: '', minSeverity: '',
    source: '', processed: '', by: 'day',
}

const EMPTY_LEAD: LeadForm = {
    name: '',
    whatsapp: '',
    email: '',
    company: '',
    designation: '',
}

export default function DownloadPage() {
    const { t, language } = useLanguage()
    const [dataset, setDataset] = useState<Dataset>('events')
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [options, setOptions] = useState<Options | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<Format | null>(null)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leadForm, setLeadForm] = useState<LeadForm>(EMPTY_LEAD)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const datasetCols = dataset === 'raw' ? RAW_COLS : dataset === 'audit' ? AUDIT_COLS : EVENT_COLS
    const [selectedCols, setSelectedCols] = useState<string[]>(EVENT_COLS.map((c) => c.key))

    useEffect(() => {
        let active = true
        fetch('/api/download/options')
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('options'))))
            .then((d: Options) => { if (active) setOptions(d) })
            .catch(() => { if (active) setOptions(null) })

        // Load saved user info from localStorage
        try {
            const saved = localStorage.getItem('dl_user_info')
            if (saved) {
                const parsed = JSON.parse(saved)
                setLeadForm(parsed)
            }
        } catch {
            // Ignore parse errors
        }

        return () => { active = false }
    }, [])

    // Reset column selection when the dataset changes.
    useEffect(() => {
        setSelectedCols((dataset === 'raw' ? RAW_COLS : dataset === 'audit' ? AUDIT_COLS : EVENT_COLS).map((c) => c.key))
    }, [dataset])

    const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))

    const toggleCol = (key: string) =>
        setSelectedCols((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

    const buildQueryString = (format: Format): string => {
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
            if (filters.sector) p.set('sector', filters.sector)
            if (filters.minSeverity) p.set('minSeverity', filters.minSeverity)
        }
        if (dataset === 'raw' || dataset === 'audit') {
            if (filters.source) p.set('source', filters.source)
            if (filters.processed) p.set('processed', filters.processed)
        }
        if (dataset !== 'stats' && selectedCols.length > 0 && selectedCols.length < datasetCols.length) {
            p.set('cols', selectedCols.join(','))
        }
        return p.toString()
    }

    const openDownloadModal = (format: Format) => {
        setSelectedFormat(format)
        setSubmitSuccess(false)
        setErrorMessage(null)
        setDirectDownloadUrl(null)
        setIsModalOpen(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFormat) return

        if (!leadForm.name || !leadForm.whatsapp || !leadForm.email || !leadForm.company || !leadForm.designation) {
            setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে সকল ঘর পূরণ করুন।' : 'Please fill in all required fields.')
            return
        }

        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            const queryStr = buildQueryString(selectedFormat)
            const response = await fetch('/api/download/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadForm.name,
                    whatsapp: leadForm.whatsapp,
                    email: leadForm.email,
                    company: leadForm.company,
                    designation: leadForm.designation,
                    dataset,
                    format: selectedFormat,
                    downloadQuery: queryStr,
                    filters: {
                        ...(filters.from && { from: filters.from }),
                        ...(filters.to && { to: filters.to }),
                        ...(filters.district && { district: filters.district }),
                        ...(filters.category && { category: filters.category }),
                        ...(filters.sector && { sector: filters.sector }),
                    },
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit download request')
            }

            // Save user profile in localStorage for next time
            try {
                localStorage.setItem('dl_user_info', JSON.stringify(leadForm))
            } catch {
                // Ignore localStorage errors
            }

            setSubmitSuccess(true)
            setDirectDownloadUrl(data.directUrl || `/api/download?${queryStr}`)
        } catch (err: any) {
            setErrorMessage(err.message || 'Error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const datasetMeta = useMemo(() => ([
        { key: 'events' as Dataset, icon: Database, title: t('dl_ds_events'), desc: t('dl_ds_events_desc'), count: options?.counts?.events },
        { key: 'raw' as Dataset, icon: Newspaper, title: t('dl_ds_raw'), desc: t('dl_ds_raw_desc'), count: options?.counts?.raw },
        { key: 'stats' as Dataset, icon: BarChart3, title: t('dl_ds_stats'), desc: t('dl_ds_stats_desc'), count: undefined },
        { key: 'audit' as Dataset, icon: ScanSearch, title: t('dl_ds_audit'), desc: t('dl_ds_audit_desc'), count: options?.counts?.raw },
    ]), [t, options])

    const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500'
    const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
            <div className="flex items-center gap-3 mb-2">
                <Download className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                    {t('dl_title')}
                </h1>
            </div>
            <p className={`text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-2xl ${language === 'bn' ? 'font-bengali' : ''}`}>
                {t('dl_subtitle')}
            </p>

            {/* Dataset selector */}
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">{t('dl_dataset')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {datasetMeta.map((d) => {
                    const active = dataset === d.key
                    return (
                        <button
                            key={d.key}
                            onClick={() => setDataset(d.key)}
                            className={`text-left p-4 rounded-xl border transition-all ${active
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-sm'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'}`}
                        >
                            <d.icon className={`w-6 h-6 mb-2 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{d.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.desc}</div>
                            {typeof d.count === 'number' && (
                                <div className="text-xs mt-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{d.count.toLocaleString()} {t('dl_records')}</div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t('dl_filters')}</h2>
                <button onClick={() => setFilters(EMPTY_FILTERS)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400">
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
                                {(options?.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_category')}</label>
                            <select value={filters.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {(options?.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_sector')}</label>
                            <select value={filters.sector} onChange={(e) => set({ sector: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {(options?.sectors || []).map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>{t('dl_min_severity')}</label>
                            <input type="number" min={1} max={10} placeholder="1-10" value={filters.minSeverity} onChange={(e) => set({ minSeverity: e.target.value })} className={inputCls} />
                        </div>
                    </>
                )}

                {(dataset === 'raw' || dataset === 'audit') && (
                    <>
                        <div>
                            <label className={labelCls}>{t('dl_source')}</label>
                            <select value={filters.source} onChange={(e) => set({ source: e.target.value })} className={inputCls}>
                                <option value="">{t('dl_all')}</option>
                                {(options?.sources || []).map((s) => <option key={s} value={s}>{s}</option>)}
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
                            <button onClick={() => setSelectedCols(datasetCols.map((c) => c.key))} className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400">{t('dl_select_all')}</button>
                            <button onClick={() => setSelectedCols([])} className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400">{t('dl_clear')}</button>
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
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
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
                            onClick={() => openDownloadModal(fmt)}
                            disabled={disabled}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all hover:scale-105"
                        >
                            <meta.icon className="w-4 h-4" />
                            {meta.label}
                        </button>
                    )
                })}
            </div>

            {/* Lead Capture / Protection Modal */}
            {isModalOpen && selectedFormat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-emerald-950/40 to-teal-950/20 flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3" />
                                    {selectedFormat.toUpperCase()} Export
                                </div>
                                <h3 className={`text-xl font-bold text-zinc-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                                    {t('dl_gate_title')}
                                </h3>
                                <p className={`text-xs text-zinc-500 dark:text-zinc-400 ${language === 'bn' ? 'font-bengali' : ''}`}>
                                    {t('dl_gate_desc')}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {submitSuccess ? (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className={`text-xl font-bold text-zinc-900 dark:text-white ${language === 'bn' ? 'font-bengali' : ''}`}>
                                        {t('dl_form_success_title')}
                                    </h4>
                                    <p className={`text-sm text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed ${language === 'bn' ? 'font-bengali' : ''}`}>
                                        {language === 'bn' 
                                            ? `ডাউনলোড লিঙ্কটি আপনার ইমেইল (${leadForm.email})-এ পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।`
                                            : `The verified download link has been dispatched to ${leadForm.email}. Please check your inbox and spam folder.`}
                                    </p>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                                        {directDownloadUrl && (
                                            <a
                                                href={directDownloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                                {t('dl_form_direct_download')}
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition-colors"
                                        >
                                            {t('dl_form_close')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    {errorMessage && (
                                        <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            {t('dl_form_name')} <span className="text-emerald-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                placeholder={language === 'bn' ? 'উদা: মোঃ সাদিক আলম' : 'e.g. Sadiq Alam'}
                                                value={leadForm.name}
                                                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp & Email grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                                {t('dl_form_whatsapp')} <span className="text-emerald-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="+8801..."
                                                    value={leadForm.whatsapp}
                                                    onChange={(e) => setLeadForm({ ...leadForm, whatsapp: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                                {t('dl_form_email')} <span className="text-emerald-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="you@domain.com"
                                                    value={leadForm.email}
                                                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company & Designation grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                                {t('dl_form_company')} <span className="text-emerald-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={language === 'bn' ? 'উদা: প্রথম আলো / ডেল্টা রিসার্চ' : 'e.g. Media / Research Org'}
                                                    value={leadForm.company}
                                                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                                {t('dl_form_designation')} <span className="text-emerald-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Briefcase className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={language === 'bn' ? 'উদা: অনুসন্ধানী সাংবাদিক / গবেষক' : 'e.g. Journalist / Researcher'}
                                                    value={leadForm.designation}
                                                    onChange={(e) => setLeadForm({ ...leadForm, designation: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-3">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>{t('dl_form_sending')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-4 h-4" />
                                                    <span>{t('dl_form_submit')}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
