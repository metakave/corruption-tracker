
import React, { useState } from 'react';
import { X, ExternalLink, AlertTriangle, Edit2 } from 'lucide-react';
import { AnalysisEvent } from '../page';
import EditEventModal from './EditEventModal'; // Import the new modal

interface DrillDownModalProps {
    metric: string;
    events: AnalysisEvent[];
    onClose: () => void;
    onUpdate?: () => void; // Callback to refresh parent data
}

export default function DrillDownModal({ metric, events, onClose, onUpdate }: DrillDownModalProps) {
    const [editingEvent, setEditingEvent] = useState<AnalysisEvent | null>(null);

    // Filter events based on metric
    const filteredEvents = React.useMemo(() => {
        switch (metric) {
            case 'killed': return events.filter(e => e.killed > 0).sort((a, b) => b.killed - a.killed);
            case 'injured': return events.filter(e => e.injured > 0).sort((a, b) => b.injured - a.injured);
            case 'political':
                return events.filter(e => {
                    // Replicate the filtering logic here or pass it down.
                    // For now, replicating the "Ignored Actors" logic for consistency
                    if (!e.politicalParties || e.politicalParties.length === 0) return false;
                    const IGNORED = [
                        'unknown', 'locals', 'robbers', 'miscreants', 'criminals', 'students', 'fishermen',
                        'villagers', 'teachers', 'victim', 'family', 'truck driver', 'truck', 'police', 'ansar',
                        'accused', 'son', 'daughter', 'husband', 'wife', 'child', 'relative',
                        'daughter-in-law', 'mother-in-law', 'father-in-law', 'brother-in-law', 'sister-in-law',
                        'begum', 'khatun'
                    ];
                    return e.politicalParties.some(p => !IGNORED.some(i => p.toLowerCase().includes(i)));
                });
            case 'mob':
                return events.filter(e => {
                    const text = (e.title + ' ' + e.summary).toLowerCase();
                    return ['mob', 'ganopituni', 'mass beating', 'গণপিটুনি', 'পিটিয়ে', 'এলাকাবাসী'].some(k => text.includes(k));
                });
            case 'gender':
                return events.filter(e => {
                    const text = (e.title + ' ' + e.summary).toLowerCase();
                    return ['rape', 'assault', 'dowry', 'ধর্ষণ', 'নির্যাতন', 'যৌন'].some(k => text.includes(k));
                });
            default: return events;
        }
    }, [metric, events]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                            {metric === 'political' ? 'Political Violence' : metric.replace(/([A-Z])/g, ' $1').trim()}
                            <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded ml-2">
                                {filteredEvents.length} Events
                            </span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Table Content */}
                <div className="overflow-auto flex-1 p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Title & Summary</th>
                                <th className="px-6 py-3">District</th>
                                <th className="px-6 py-3 text-center">Killed</th>
                                <th className="px-6 py-3 text-center">Injured</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEvents.map(event => (
                                <tr key={event.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{event.date}</td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className="font-medium text-gray-900 line-clamp-2" title={event.title}>{event.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.summary || 'No summary available'}</div>
                                        {/* Show parties tag if present */}
                                        {event.politicalParties && event.politicalParties.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {event.politicalParties.map((p, i) => (
                                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">{p}</span>
                                                ))}
                                            </div>
                                        )}
                                        {!event.isPolitical && <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-500 px-1 rounded">Hidden from Political Stats</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{event.district}</td>
                                    <td className={`px-6 py-4 text-center font-bold ${event.killed > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                                        {event.killed}
                                    </td>
                                    <td className={`px-6 py-4 text-center font-bold ${event.injured > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                                        {event.injured}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingEvent(event)}
                                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition"
                                                title="Edit Event"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <a
                                                href={event.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="View Source"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Edit Event Modal */}
            {editingEvent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <EditEventModal
                        event={editingEvent}
                        onClose={() => setEditingEvent(null)}
                        onSave={() => {
                            setEditingEvent(null);
                            if (onUpdate) onUpdate();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
