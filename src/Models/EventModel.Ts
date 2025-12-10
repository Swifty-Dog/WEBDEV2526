export interface EventModel {
    id: number;                     // C# long → TS number
    title: string;                  // C# string
    description?: string | null;    // C# string? → TS string | null
    eventDate: string;              // C# DateTime → TS string (ISO)
    createdById: number;            // C# long → TS number
    roomId?: number | null;         // C# long? → TS number | null
    attendees?: string[];           // mapping van EventParticipations (optioneel)
}
