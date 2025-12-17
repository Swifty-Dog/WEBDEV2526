import React from 'react';
import { useTranslation } from 'react-i18next';

type PerPageKey = `${number}` | "All";

const INT32_MAX = 2 ** 31 - 1;

const perPageOptions: Record<PerPageKey, number> = {
    5: 5,
    10: 10,
    20: 20,
    50: 50,
    100: 100,
    All: INT32_MAX
};

interface EmployeeControlsProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export const EmployeeControls: React.FC<EmployeeControlsProps> = ({searchTerm, onSearchChange, pageSize, onPageSizeChange}) => {
    const { t: tAdmin } = useTranslation('admin');

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onPageSizeChange(parseInt(e.target.value));
    };

    return (
        <div className="controls-wrapper">
            <input
                className="pagination-controls search-bar"
                type="text"
                placeholder={tAdmin('terminateEmployee.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <div className="pagination-controls">
                <label htmlFor="pageSize">
                    {tAdmin("pagination.perPage")}
                </label>
                <select
                    className="login-input"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                >
                    {Object.entries(perPageOptions).map(([label, value]) => (
                        <option key={value} value={value}>
                            {label === 'All' ? tAdmin('pagination.all') : label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
