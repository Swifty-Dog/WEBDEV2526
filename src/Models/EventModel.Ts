import type { Room } from '../utils/types';

export interface EventModel {
    id: number;                     // C# long → TS number
    title: string;                  // C# string
    description?: string | null;    // C# string? → TS string | null
    eventDate: string;              // C# DateTime → TS string (ISO)
    createdById?: number;            // C# long → TS number
    room?: Room;         // C# long? → TS number | null
    attendees?: string[];           // mapping van EventParticipations (optioneel)
}
