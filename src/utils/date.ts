import {getCurrentTime} from "./time.ts";

export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const formatTimeUntil = (bookingDate: string, startTime: string) => {
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
    const diffMs = bookingDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Nu';
    const diffMinutes = Math.ceil(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays} dag${diffDays > 1 ? 'en' : ''}`;

    if (diffHours > 0) {
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes === 0) return `in ${diffHours} uur`;
        return `in ${diffHours} uur en ${remainingMinutes} ${remainingMinutes !== 1 ? 'minuten' : 'minuut'}`;
    }

    return `in ${diffMinutes} ${diffMinutes > 1 ? 'minuten' : 'minuut'}`;
};

export const getTodayDate = (): string => new Date().toISOString().split('T')[0];

export const getNextDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

export const getInitialBookingDate = (): string => {
    const currentTime = getCurrentTime();
    return currentTime >= '18:00' ? getNextDate() : getTodayDate();
};

export const isBookingInPast = (bookingDate: string, startTime: string): boolean => {
    try {
        const bookingStartDateTime = new Date(`${bookingDate}T${startTime}`);
        return bookingStartDateTime < new Date();

    } catch {
        return true;
    }
};
