
import { AnalysisEvent } from './types';

export type CategoryBucket = 'political' | 'mob' | 'communal' | 'gender' | 'criminal' | 'terrorism';

export const CATEGORY_COLORS: Record<CategoryBucket, string> = {
    political: 'rgb(59, 130, 246)', // Blue
    mob: 'rgb(245, 158, 11)',      // Amber
    communal: 'rgb(79, 70, 229)',  // Indigo
    gender: 'rgb(236, 72, 153)',   // Pink
    criminal: 'rgb(100, 116, 139)',// Slate
    terrorism: 'rgb(39, 39, 42)',  // Zinc/Black
};

export const CATEGORY_LABELS: Record<CategoryBucket, string> = {
    political: 'Political',
    mob: 'Mob Justice',
    communal: 'Communal',
    gender: 'Gender Based',
    criminal: 'Criminal',
    terrorism: 'Terrorism',
};

/**
 * Parses the raw category field (JSON or string) into an array of strings.
 */
export function parseCategories(e: AnalysisEvent): string[] {
    if (!e.category) return [];
    try {
        const parsed = JSON.parse(e.category);
        return Array.isArray(parsed) ? parsed : [e.category];
    } catch {
        return [e.category];
    }
}

/**
 * Maps an event to a set of unique standardized buckets.
 * If an event matches multiple buckets, it returns all of them.
 * If an event matches NONE, it returns ['criminal'].
 */
export function getEventBuckets(e: AnalysisEvent): CategoryBucket[] {
    const categories = parseCategories(e);
    const buckets = new Set<CategoryBucket>();

    if (categories.length === 0) {
        return ['criminal'];
    }

    categories.forEach(cat => {
        const normalized = cat.toLowerCase().trim();
        let matched = false;

        if (normalized.includes('political')) { buckets.add('political'); matched = true; }
        if (normalized.includes('mob') || normalized.includes('lynch')) { buckets.add('mob'); matched = true; }
        if (normalized.includes('communal') || normalized.includes('religious')) { buckets.add('communal'); matched = true; }
        if (normalized.includes('gender')) { buckets.add('gender'); matched = true; }
        if (normalized.includes('terrorism') || normalized.includes('extremist')) { buckets.add('terrorism'); matched = true; }
        if (normalized.includes('criminal')) { buckets.add('criminal'); matched = true; }
    });

    if (buckets.size === 0) {
        return ['criminal'];
    }

    return Array.from(buckets);
}

/**
 * Formats a YYYY-MM-DD date string to DD MMM YYYY for UI display.
 * @param dateStr YYYY-MM-DD
 */
import { format, parseISO } from 'date-fns';

export function formatDateUI(dateStr: string): string {
    if (!dateStr) return '';
    try {
        return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch (e) {
        console.error("Invalid date format", dateStr);
        return dateStr;
    }
}
