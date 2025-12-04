import React, { useState } from 'react';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface Props {
    onClose: () => void;
}

export const PromoteDemoteModal: React.FC<Props> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [foundEmployees, setFoundEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState<boolean>(false);

    const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        
        if (!searchQuery.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);
        setFoundEmployees([]);
        setSearched(true);

        try {
            const response = await fetch(`http://localhost:5222/api/Employee/search?query=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Employee not found');
            }

            const result = await response.json();
            
            // Backend returns an object with employees list
            if (result.employees && result.employees.length > 0) {
                setFoundEmployees(result.employees);
            } else {
                throw new Error('Employee not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search employee');
            setFoundEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const handlePromoteDemote = async (employee: Employee) => {
        setLoading(true);
        setError(null);

        try {
            // Controller exposes a GET endpoint for promote-demote
            const response = await fetch(`http://localhost:5222/api/Employee/promote-demote/${employee.id}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message ?? 'Failed to update employee role');
            }

            // Refresh the employee data by re-running the search so we get the updated role
            const refresh = await fetch(`http://localhost:5222/api/Employee/search?query=${encodeURIComponent(searchQuery)}`, { method: 'GET' });
            if (!refresh.ok) {
                // Role updated on server, but refresh failed
                setError('Role updated, but failed to refresh employee data');
                return;
            }

            const refreshed = await refresh.json();
            if (refreshed.employees && refreshed.employees.length > 0) {
                setFoundEmployees(refreshed.employees);
            } else {
                setFoundEmployees([]);
                setError('Role updated but employee not found after refresh');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '90vw', width: '100%', minHeight: '60vh', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Promote / Demote Employee</h3>

                <div className="form-row" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: '600' }}>Search for Employee</label>
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter employee name, email, or ID"
                            style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
                        />
                        <button
                            type="button"
                            className="btn-sm"
                            onClick={e => handleSearch(e)}
                            disabled={loading}
                            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            type="button"
                            className="btn-sm"
                            onClick={onClose}
                            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#d32f2f', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', fontSize: '0.95rem' }}>
                        {error}
                    </div>
                )}

                {foundEmployees.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(calc(25% - 0.56rem), 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {foundEmployees.map((emp) => (
                            <div key={emp.id} style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: '1rem', 
                                backgroundColor: '#f9f9f9',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>{emp.firstName} {emp.lastName}</h4>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', wordBreak: 'break-word' }}>
                                    <strong>Email:</strong> {emp.email}
                                </div>
                                <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                    <strong>Role:</strong> <span style={{ color: 'var(--color-brand-accent)', fontWeight: '600' }}>{emp.role}</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handlePromoteDemote(emp)}
                                    disabled={loading}
                                    style={{ 
                                        background: 'var(--color-brand-accent)', 
                                        color: 'white', 
                                        padding: '0.5rem 1rem', 
                                        fontSize: '0.9rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.6 : 1,
                                        marginTop: 'auto'
                                    }}>
                                    {loading ? 'Updating...' :
                                        emp.role.toLowerCase() === 'employee' ? 'Promote to Manager' : 'Demote to Employee'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!foundEmployees.length && searchQuery && !error && !loading && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '2rem', fontSize: '1rem' }}>
                        {searched ? 'Employee not found' : 'Click "Search" to find an employee'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoteDemoteModal;

// return (
//         <div className="modal-overlay">
//             <div className="modal" style={{ maxWidth: '500px' }}>
//                 <h3 style={{ marginTop: 0 }}>Promote / Demote Employee</h3>

//                 <div className="form-row">
//                     <label>Search for Employee</label>
//                     <div style={{ display: 'flex', gap: '0.5rem' }}>
//                         <input
//                             type="text"
//                             value={searchQuery}
//                             onChange={e => setSearchQuery(e.target.value)}
//                             onKeyPress={handleKeyPress}
//                             placeholder="Enter employee name, email, or ID"
//                             style={{ flex: 1 }}
//                         />
//                         <button
//                             type="button"
//                             className="btn-sm"
//                             onClick={e => handleSearch(e)}
//                             disabled={loading}
//                         >
//                             {loading ? 'Searching...' : 'Search'}
//                         </button>
//                     </div>
//                 </div>