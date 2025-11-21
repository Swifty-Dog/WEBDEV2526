import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PromoteDemoteButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
	const navigate = useNavigate();
	return (
		<button
			type="button"
			className="header-button"
			style={style}
			onClick={() => navigate('/admin/promote-demote')}
		>
			Promte/Demote
		</button>
	);
};