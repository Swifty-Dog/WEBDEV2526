export interface ApiErrorData {
    message?: string;
    arguments?: Record<string, string>;
}

export interface Booking {
    id: number;
    purpose: string;
    roomName: string;
    startTime: string;
    endTime: string;
    bookingDate: string;
}

export interface BookingDetails {
    roomId: number;
    roomName?: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
}

export interface DailyBookingWithRoom {
    id: number;
    roomId: number;
    startTime: string;
    endTime: string;
}

export interface EventApiDto {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    room?: {
        id: number;
        roomName?: string;
    } | null;
    attendees?: [];
    attending?: boolean;
}

export interface CreateEventApiDto {
    title: string;
    description?: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    roomId: number;
}

export interface UpdateEventApiDto extends CreateEventApiDto { }

export interface Room {
    id: number;
    roomName: string;
    capacity: number;
    location: string;
}