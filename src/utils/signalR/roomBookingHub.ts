import { API_BASE_HUB } from "../../config/api";
import { startConnection, subscribe, stopConnection } from "./signalRService";

const ROOM_BOOKINGS_HUB_URL = `${API_BASE_HUB}/roomBookings`;

export function startRoomBookings() {
    return startConnection(ROOM_BOOKINGS_HUB_URL);
}

export function onBookingChanged(callback: () => void) {
    return subscribe(ROOM_BOOKINGS_HUB_URL, "BookingChanged", callback);
}

export function stopRoomBookings() {
    return stopConnection(ROOM_BOOKINGS_HUB_URL);
}
