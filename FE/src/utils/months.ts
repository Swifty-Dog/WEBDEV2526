export const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

export const capitalize = (s: string): string => {
    if ( s.length === 0) {
        return '';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
};
