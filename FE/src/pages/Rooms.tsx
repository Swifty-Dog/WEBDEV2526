import React, {useEffect} from 'react';
import '../styles/_components.css';
import { AdminRoomManagement } from '../components/Room/AdminRoomManagement';
import { CurrentRoomBookings} from "../components/Room/CurrentRoomBookings";
import { NewRoomBooking } from '../components/Room/NewRoomBooking';
import {useTranslation} from "react-i18next";

interface RoomsProps {
    userRole: 'admin' | 'manager' | 'employee' | string;
}

export const Rooms: React.FC<RoomsProps> = ({ userRole }: RoomsProps) => {
    const canManage: boolean = userRole === 'admin' || userRole === 'manager';
    const { t } = useTranslation('common');

    useEffect(() => {
        document.title = t('menu.rooms') + " | " + import.meta.env.VITE_APP_NAME;
    }, [t]);

    return (
        <div className="rooms-container">
            {canManage && (
                <div className="panel-fancy-borders">
                    <AdminRoomManagement />
                </div>
            )}

            <div className="room-actions-grid">
                <div className="panel-fancy-borders" id="current-bookings">
                    <CurrentRoomBookings />
                </div>

                <div className="panel-fancy-borders" id="new-booking">
                    <NewRoomBooking />
                </div>
            </div>
        </div>
    );
};
