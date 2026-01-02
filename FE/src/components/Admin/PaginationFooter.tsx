import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationFooterProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({page, totalPages, onPageChange}) => {
    const { t: tAdmin } = useTranslation('admin');

    const handlePrev = () => {
        if (page > 1) onPageChange(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) onPageChange(page + 1);
    };

    return (
        <div className="pagination-controls mid-aligned extra-spacing">
            <button
                className="button-secondary"
                onClick={handlePrev}
                disabled={page === 1}
            >
                ❮
            </button>

            <span>
                {tAdmin('pagination.pageInfo', { page, totalPages })}
            </span>

            <button
                className="button-secondary"
                onClick={handleNext}
                disabled={page >= totalPages}
            >
                ❯
            </button>
        </div>
    );
};
