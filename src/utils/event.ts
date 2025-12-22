export interface EventApiItem {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    roomName?: string;
    location?: string;
    attendees: string[];
    attending?: boolean;
}

export interface UseEventsResult {
    eventsByDate: Record<string, string[]>;
    loading: boolean;
    error: string | null;
}