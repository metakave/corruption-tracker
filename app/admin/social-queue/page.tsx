'use client'

import { useState, useEffect } from 'react';
import { Check, X, Edit, Eye, Clock, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SocialPost {
    id: string;
    photocardUrl: string;
    caption: string;
    theme: string;
    status: string;
    createdAt: string;
    event: {
        title: string;
        district: string | null;
        dateOfIncident: Date | null;
        killed: number | null;
        injured: number | null;
    };
}

export default function SocialQueuePage() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchPendingPosts();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchPendingPosts(true); // true = silent update
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchPendingPosts = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await fetch('/api/social/generate');
            const data = await response.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleApprove = async (postId: string) => {
        try {
            const response = await fetch('/api/social/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId })
            });

            if (response.ok) {
                await fetchPendingPosts();
            }
        } catch (error) {
            console.error('Error approving post:', error);
        }
    };

    const handleReject = async (postId: string) => {
        try {
            const response = await fetch('/api/social/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId })
            });

            if (response.ok) {
                await fetchPendingPosts();
            }
        } catch (error) {
            console.error('Error rejecting post:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-red-600" size={24} />
                    <span className="text-lg font-medium text-slate-700">Loading posts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Social Media Queue</h1>
                    <p className="text-slate-600 mt-2">Review and approve posts before publishing to Facebook</p>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                            <span className="text-sm font-bold text-yellow-800">
                                {posts.length} Pending Posts
                            </span>
                        </div>
                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-700">Live Updates On</span>
                        </div>
                        <button
                            onClick={() => fetchPendingPosts(false)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <p className="text-slate-500 text-lg">No pending posts to review</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Photocard Preview */}
                                <div className="relative aspect-square bg-slate-100">
                                    <img
                                        src={post.photocardUrl}
                                        alt={post.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2">
                                        {post.event.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <Clock size={12} />
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        {post.event.killed !== null && post.event.killed > 0 && (
                                            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">
                                                {post.event.killed} নিহত
                                            </span>
                                        )}
                                        {post.event.injured !== null && post.event.injured > 0 && (
                                            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded">
                                                {post.event.injured} আহত
                                            </span>
                                        )}
                                    </div>

                                    {/* Caption Preview */}
                                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-slate-600 line-clamp-3">{post.caption}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPost(post);
                                                setShowPreview(true);
                                            }}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors"
                                        >
                                            <Eye size={14} />
                                            <span>Preview</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprove(post.id)}
                                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors"
                                        >
                                            <Check size={14} />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(post.id)}
                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors"
                                        >
                                            <X size={14} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview Modal */}
                {showPreview && selectedPost && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Post Preview</h2>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Photocard */}
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-700 mb-2">Photocard</h3>
                                        <img
                                            src={selectedPost.photocardUrl}
                                            alt={selectedPost.event.title}
                                            className="w-full rounded-lg border border-slate-200"
                                        />
                                    </div>

                                    {/* Caption and Details */}
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-700 mb-2">Facebook Caption</h3>
                                        <div className="bg-slate-50 rounded-lg p-4 mb-4 whitespace-pre-line">
                                            <p className="text-sm text-slate-800">{selectedPost.caption}</p>
                                        </div>

                                        <h3 className="font-bold text-sm text-slate-700 mb-2">Event Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Theme:</span>
                                                <span className="font-medium capitalize">{selectedPost.theme}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">District:</span>
                                                <span className="font-medium">{selectedPost.event.district || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Generated:</span>
                                                <span className="font-medium">{formatDate(selectedPost.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    handleApprove(selectedPost.id);
                                                    setShowPreview(false);
                                                }}
                                                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} />
                                                Approve & Post
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleReject(selectedPost.id);
                                                    setShowPreview(false);
                                                }}
                                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
