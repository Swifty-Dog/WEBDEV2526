
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
	const navigate = useNavigate();
	return (
		<button
			type="button"
			className="header-button"
			style={style}
			onClick={() => navigate('/admin/register')}
		>
			Register
		</button>
	);
};
