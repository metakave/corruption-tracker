export interface AnalysisEvent {
    id: string;
    date: string;
    title: string;
    summary: string;
    district: string;
    killed?: number;
    injured?: number;
    amountInvolved?: number;
    amountFormatted?: string;
    sectorOrMinistry?: string;
    isPolitical?: boolean;
    isCorruption?: boolean;
    politicalParties?: string[];
    victimParties?: string[];
    perpetratorParties?: string[];
    url: string;
    category?: string;
    tags?: string;
    source?: string;
    additionalSources?: string;
    latitude?: number;
    longitude?: number;
}
