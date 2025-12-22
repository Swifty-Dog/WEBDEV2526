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

export const getInitialStartTime = (): string => {
    const current = getCurrentTime();
    return allTimes.find(time => time > current) || allTimes[0];
};

export const getInitialEndTime = (startTime: string): string => {
    const nextIndex = allTimes.indexOf(startTime) + 1;
    return allTimes[nextIndex] || allTimes[allTimes.length - 1];
};
