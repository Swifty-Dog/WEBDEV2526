export const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const allTimes: string[] = [];
for (let hour = 8; hour <= 18; hour++) {
    allTimes.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour !== 18) allTimes.push(`${String(hour).padStart(2, '0')}:30`);
}

export const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};


export function formatEventDateTime(date: Date, start: Date | undefined, end: Date | undefined) {
    const startStr = start ? `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}` : '--:--';
    const endStr = end ? `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}` : '--:--';
    return `${date} ${startStr} - ${endStr}`;
}





export const getInitialStartTime = (): string => {
    const current = getCurrentTime();
    return allTimes.find(time => time > current) || allTimes[0];
};

export const getInitialEndTime = (startTime: string): string => {
    const nextIndex = allTimes.indexOf(startTime) + 1;
    return allTimes[nextIndex] || allTimes[allTimes.length - 1];
};
