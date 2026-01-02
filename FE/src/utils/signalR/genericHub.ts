import { API_BASE_HUB } from "../../config/api";
import { startConnection, subscribe } from "./signalRService";

const GENERIC_HUB_URL = `${API_BASE_HUB}/genericHub`;

export function startGenericHub() {
    return startConnection(GENERIC_HUB_URL);
}

export function onEvent(eventName: string, callback: (...args: string[]) => void) {
    return subscribe(GENERIC_HUB_URL, eventName, callback);
}
