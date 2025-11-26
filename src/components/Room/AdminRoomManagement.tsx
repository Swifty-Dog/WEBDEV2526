import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomActions } from './RoomActions.tsx';
import { RoomListModal } from './RoomListModal.tsx';
import { RoomFormModal } from './RoomFormModal.tsx';
import { useRooms } from '../../hooks/Room/useRooms.ts';

export const AdminRoomManagement: React.FC = () => {
    const { t } = useTranslation('rooms');
    const { rooms, saveRoom, deleteRoom } = useRooms();
    const [showRoomList, setShowRoomList] = useState<{ open: boolean; mode: 'manage' | 'delete' }>({ open: false, mode: 'manage' });
    const [showRoomForm, setShowRoomForm] = useState(false);

    return (
        <div className="section-card">
            <h1 className="titling">{t('adminRoomManagement.title')}</h1>

            <RoomActions
                onAdd={() => setShowRoomForm(true)}
                onManage={() => setShowRoomList({ open: true, mode: 'manage' })}
                onDelete={() => setShowRoomList({ open: true, mode: 'delete' })}
            />

            {showRoomList.open && (
                <RoomListModal
                    rooms={rooms}
                    mode={showRoomList.mode}
                    onClose={() => setShowRoomList({ open: false, mode: 'manage' })}
                    onSaveRoom={saveRoom}
                    onDeleteRoom={deleteRoom}
                />
            )}

            {showRoomForm && (
                <RoomFormModal
                    onClose={() => setShowRoomForm(false)}
                    onSave={(room) => { saveRoom(room); setShowRoomForm(false); }}
                />
            )}
        </div>
    );
};
