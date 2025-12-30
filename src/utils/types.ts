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

export interface Event {
    id: number;
    title: string;
    description?: string;
    eventDate: Date;
    eventStartTime: Date;
    eventEndTime: Date;
    room?: Room;
    attendeesCount: number;
};

export interface EventApiDto {
    id: number;
    title: string;
    description?: string;
    eventDate: Date;
    StartTime: Date;
    EndTime: Date;
    room?: {
        id: number;
        roomName?: string;
    };
    attendees: [string];
    attending: boolean;
}

export interface CreateEventApiDto {
    title: string;
    description?: string;
    eventDate: Date;
    startTime: Date;
    endTime: Date;
    roomId: number;
}

export interface UpdateEventApiDto extends CreateEventApiDto { }



export interface Room {
    id: number | null;
    roomName: string;
    capacity: number;
    location: string;
}
