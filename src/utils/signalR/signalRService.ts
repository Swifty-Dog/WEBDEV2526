import * as signalR from "@microsoft/signalr";
import { getValidToken} from "../../config/ApiRequest";

const connections: Record<string, signalR.HubConnection> = {};
const connectionPromises: Record<string, Promise<void> | undefined> = {};

export async function startConnection(hubUrl: string): Promise<signalR.HubConnection> {
    let connection = connections[hubUrl];
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        return connection;
    }

    if (connectionPromises[hubUrl]) {
        await connectionPromises[hubUrl];
        return connections[hubUrl];
    }

    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: async () => {
                    try {
                        return await getValidToken();
                    } catch (e) {
                        console.error("SignalR token error", e);
                        return "";
                    }
                }
            })
            .withAutomaticReconnect()
            .build();

        connections[hubUrl] = connection;
    }

    try {
        connectionPromises[hubUrl] = connection.start();
        await connectionPromises[hubUrl];
        console.log(`SignalR Connected: ${hubUrl}`);
    } catch (err) {
        console.error("SignalR Connection Failed:", err);
        throw err;
    } finally {
        delete connectionPromises[hubUrl];
    }

    return connection;
}

export function subscribe(
    hubUrl: string,
    eventName: string,
    callback: (...args: string[]) => void
) {
    startConnection(hubUrl).catch(err => console.error(err));

    const connection = connections[hubUrl];

    if (connection) {
        connection.on(eventName, callback);
    }

    return () => {
        if (connections[hubUrl]) {
            connections[hubUrl].off(eventName, callback);
        }
    };
}

export async function stopConnection(hubUrl: string) {
    const connection = connections[hubUrl];

    if (connectionPromises[hubUrl]) {
        try { await connectionPromises[hubUrl]; } catch { /* ignore */ }
    }

    if (connection) {
        try {
            await connection.stop();
            console.log(`SignalR Disconnected: ${hubUrl}`);
        } catch (err) {
            console.error("SignalR Stop Error:", err);
        } finally {
            delete connections[hubUrl];
        }
    }
}
