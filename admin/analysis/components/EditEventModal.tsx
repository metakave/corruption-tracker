
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
    const [formData, setFormData] = useState({
        title: event.title,
        date: event.date,
        killed: event.killed,
        injured: event.injured,
        isPoliticalViolence: event.isPolitical,
        politicalParties: (event.politicalParties || []).join(', '), // Edit as comma-sep string
        summary: event.summary || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Convert comma-sep string back to array
            const partiesArray = formData.politicalParties
                .split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0);

            const res = await fetch(`/api/admin/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    politicalParties: partiesArray
                })
            });

            if (!res.ok) throw new Error('Failed to update');

            onSave(); // Trigger parent refresh
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save changes');
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
                        <div className="flex gap-4">
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
                    </div>

                    {/* Political Checkbox */}
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-teal-600 rounded"
                                checked={formData.isPoliticalViolence}
                                onChange={e => setFormData({ ...formData, isPoliticalViolence: e.target.checked })}
                            />
                            <span className="font-medium text-teal-900">Is Political Violence?</span>
                        </label>
                        <p className="text-xs text-teal-600 mb-3 ml-6">
                            Uncheck this to hide it from "Political Violence" stats immediately.
                        </p>

                        <div className={`${!formData.isPoliticalViolence ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-medium text-teal-800 mb-1">Political Parties (Actors)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-teal-200 rounded-lg focus:ring-teal-500"
                                value={formData.politicalParties}
                                onChange={e => setFormData({ ...formData, politicalParties: e.target.value })}
                                placeholder="AL, BNP, Police (comma separated)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Use specific party names like 'AL', 'BNP', 'Jamaat' to trigger categorization.</p>
                        </div>
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

                </form>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
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
    );
}
