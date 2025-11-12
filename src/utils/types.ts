export interface Room {
    id: number;
    roomName: string;
    capacity: number;
    location: string;
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
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
}

export interface DailyBookingWithRoom {
    roomId: number;
    startTime: string;
    endTime: string;
}

export interface ErrorResponse {
    message?: string;
    [key: string]: unknown;
}
