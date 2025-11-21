export const SiteThemeOption = ['Light', 'Dark'] as const;
export type SiteThemeOption = typeof SiteThemeOption[number];

export const UserThemeOption = ['Blue', 'Purple', 'Orange', 'Yellow'] as const;
export type UserThemeOption = typeof UserThemeOption[number];

export const FontSizeOption = [14, 16, 18, 20] as const;
export type FontSizeOption = typeof FontSizeOption[number];

export const DefaultCalendarViewOption = ['Week', 'Month'] as const;
export type DefaultCalendarViewOption = typeof DefaultCalendarViewOption[number];

export const LanguageOption = ['English', 'Dutch'] as const;
export type LanguageOption = typeof LanguageOption[number];
