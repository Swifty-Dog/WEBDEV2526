export const WEEKDAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const WEEKDAY_NAMES_NL = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

export const WEEKDAY_ABBREVIATIONS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_ABBREVIATIONS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

export function getWeekdayNames(language: string): string[] {
    switch (language) {
        case 'nl':
            return WEEKDAY_NAMES_NL;
        case 'en':
        default:
            return WEEKDAY_NAMES_EN;
    }
}

export function getWeekdayAbbreviations(language: string): string[] {
    switch (language) {
        case 'nl':
            return WEEKDAY_ABBREVIATIONS_NL;
        case 'en':
        default:
            return WEEKDAY_ABBREVIATIONS_EN;
    }
}
