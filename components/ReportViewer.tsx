'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { useLanguage } from '@/context/LanguageContext';

interface QuickLink {
    key: string;
    enHash: string;
    bnHash: string;
}

interface ReportViewerProps {
    englishContent: string;
    banglaContent: string;
    quickLinks?: QuickLink[];
}

export default function ReportViewer({ englishContent, banglaContent, quickLinks }: ReportViewerProps) {
    const { t, language } = useLanguage();
    const content = language === 'en' ? englishContent : banglaContent;

    return (
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto py-10 px-4">
            {quickLinks && (
                <div className="mb-10 not-prose p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                        {t('click_to_see_categories')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {quickLinks.map((link) => (
                            <a
                                key={link.key}
                                href={language === 'en' ? link.enHash : link.bnHash}
                                className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                                bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 shadow-sm hover:shadow"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-50 to-transparent dark:from-red-900/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200"></span>
                                <span className="relative">{t(link.key)}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                    // Customize links to open in new tab if external
                    a: ({ href, children }) => (
                        <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                    // Responsive images
                    img: ({ src, alt }) => (
                        <img src={src} alt={alt} className="w-full h-auto rounded-lg shadow-md my-4" />
                    ),
                    // Table styling overflow
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="w-full text-left border-collapse min-w-full">
                                {children}
                            </table>
                        </div>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
