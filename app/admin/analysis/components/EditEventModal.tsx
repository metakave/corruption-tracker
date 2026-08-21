
'use client';

import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { AnalysisEvent } from '../../page';

interface EditEventModalProps {
    event: AnalysisEvent;
    onClose: () => void;
    onSave: () => void; // Trigger refresh
}

export default function EditEventModal({ event, onClose, onSave }: EditEventModalProps) {
    // Parse additional sources from JSON if they exist
    const parseAdditionalSources = (sources: string | undefined): string[] => {
        if (!sources) return [];
        try {
            const parsed = JSON.parse(sources);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    // Parse categories from JSON string to array
    const parseCategories = (category: string | undefined): string[] => {
        if (!category) return [];
        try {
            const parsed = JSON.parse(category);
            return Array.isArray(parsed) ? parsed : [category]; // Support both formats
        } catch {
            return category ? [category] : []; // Single string category
        }
    };

    const DISTRICTS = [
        "Bagherhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga",
        "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur",
        "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur",
        "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail",
        "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur",
        "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail",
        "Thakurgaon"
    ];

    const [formData, setFormData] = useState({
        title: event.title,
        date: event.date,
        district: event.district || '', // Add district to form
        killed: event.killed,
        injured: event.injured,
        categories: parseCategories(event.category),
        tags: event.tags || '',
        isPoliticalViolence: event.isPolitical,
        politicalParties: (event.politicalParties || []).join(', '),
        summary: event.summary || '',
        url: event.url || '',
        source: event.source || '',
        additionalSources: parseAdditionalSources(event.additionalSources)
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const partiesArray = formData.politicalParties
                .split(',')
                .map((p: string) => p.trim())
                .filter((p: string) => p.length > 0);

            const res = await fetch(`/api/admin/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    politicalParties: partiesArray,
                    additionalSources: JSON.stringify(formData.additionalSources.filter((s: string) => s.trim().length > 0)),
                    category: JSON.stringify(formData.categories),
                    isPoliticalViolence: formData.categories.includes('political')
                })
            });

            if (!res.ok) throw new Error('Failed to update');

            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `⚠️ DELETE PERMANENTLY?\n\nEvent: "${event.title}"\nDate: ${event.date}\n\nThis action CANNOT be undone. The event will be permanently removed from the database.\n\nAre you sure you want to delete this event?`
        );

        if (!confirmDelete) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/events/${event.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            alert('✅ Event deleted successfully');
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to delete event');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-gray-800">Edit Event Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                            >
                                <option value="">Select District</option>
                                {DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Killed</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full p-2 border rounded-lg"
                                value={formData.killed}
                                onChange={e => setFormData({ ...formData, killed: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Injured</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full p-2 border rounded-lg"
                                value={formData.injured}
                                onChange={e => setFormData({ ...formData, injured: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Violence Categories (Multi-Select) */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <label className="block text-sm font-bold text-purple-900 mb-3">Violence Categories (Select All That Apply)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'political', label: 'Political Violence', desc: 'Election attacks, party clashes, assassinations' },
                                { value: 'mob_justice', label: 'Mob Justice / Lynchings', desc: 'Vigilante killings, public beatings' },
                                { value: 'communal', label: 'Communal / Religious', desc: 'Religious riots, attacks on places of worship' },
                                { value: 'gender_based', label: 'Gender-Based Violence', desc: 'Domestic violence, sexual assault, VAW' },
                                { value: 'criminal', label: 'Criminal Violence', desc: 'Robberies, gang fights, contract killings' },
                                { value: 'terrorism', label: 'Terrorism / Extremist', desc: 'Bombings, extremist attacks' },
                                { value: 'other', label: 'Other / Ambiguous', desc: 'Unknown motive, needs review' }
                            ].map(cat => (
                                <label key={cat.value} className="flex items-start gap-2 p-2 bg-white/80 rounded border border-purple-100 hover:bg-purple-100/50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 text-purple-600 rounded"
                                        checked={formData.categories.includes(cat.value)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, categories: [...formData.categories, cat.value] });
                                            } else {
                                                setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat.value) });
                                            }
                                        }}
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-sm text-gray-800">{cat.label}</span>
                                        <p className="text-xs text-gray-600 mt-0.5">{cat.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {formData.categories.length === 0 && (
                            <p className="text-xs text-red-600 mt-2">⚠️ Please select at least one category</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg text-sm"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="political_involvement, gender_based_violence, needs_review"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated secondary classifications</p>
                    </div>

                    {/* Political Parties (show for all, but emphasize for political) */}
                    <div className={formData.categories.includes('political') ? 'bg-teal-50 p-3 rounded-lg border border-teal-100' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Political Parties (Actors) {formData.categories.includes('political') && <span className="text-teal-600">*</span>}
                        </label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            value={formData.politicalParties}
                            onChange={e => setFormData({ ...formData, politicalParties: e.target.value })}
                            placeholder="AL, BNP, Police (comma separated)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.categories.includes('political')
                                ? 'Use specific party names like "AL", "BNP", "Jamaat" for categorization'
                                : 'List any political actors if relevant to this incident'}
                        </p>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                        <textarea
                            rows={4}
                            className="w-full p-2 border rounded-lg text-sm"
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    {/* Source Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg text-sm"
                            value={formData.source}
                            onChange={e => setFormData({ ...formData, source: e.target.value })}
                            placeholder="Prothom Alo, Jamuna News, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">The news outlet name</p>
                    </div>

                    {/* Primary Source URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Source Link (URL)</label>
                        <input
                            type="url"
                            className="w-full p-2 border rounded-lg text-sm"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://example.com/article"
                        />
                        <p className="text-xs text-gray-500 mt-1">The main news article URL</p>
                    </div>

                    {/* Additional Sources */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Sources</label>
                        <div className="space-y-2">
                            {formData.additionalSources.map((source: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="url"
                                        className="flex-1 p-2 border rounded-lg text-sm"
                                        value={source}
                                        onChange={e => {
                                            const updated = [...formData.additionalSources];
                                            updated[index] = e.target.value;
                                            setFormData({ ...formData, additionalSources: updated });
                                        }}
                                        placeholder="https://another-source.com/article"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = formData.additionalSources.filter((_: string, i: number) => i !== index);
                                            setFormData({ ...formData, additionalSources: updated });
                                        }}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, additionalSources: [...formData.additionalSources, ''] })}
                                className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium"
                            >
                                + Add Source
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Add URLs from other news outlets covering the same incident</p>
                    </div>

                </form>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        🗑️ Delete Event
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
