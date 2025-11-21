import React from 'react';
import '../styles/_components.css';
import { AdminRoomManagement } from '../components/Room/AdminRoomManagement.tsx';
import { CurrentRoomBookings} from "../components/Room/CurrentRoomBookings.tsx";
import { NewRoomBooking } from '../components/Room/NewRoomBooking.tsx';

interface RoomsProps {
    userRole: 'admin' | 'manager' | 'employee' | string;
}

export const Rooms: React.FC<RoomsProps> = ({ userRole }: RoomsProps) => {
    const canManage: boolean = userRole === 'admin' || userRole === 'manager';

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
