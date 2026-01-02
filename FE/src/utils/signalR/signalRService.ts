import * as signalR from "@microsoft/signalr";
import { getValidToken } from "../../config/ApiRequest";

const connections: Record<string, signalR.HubConnection> = {};
const connectionPromises: Record<string, Promise<void> | undefined> = {};
const subscriberCount: Record<string, number> = {};
const stopTimers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};

export async function startConnection(hubUrl: string): Promise<signalR.HubConnection> {
    if (stopTimers[hubUrl]) {
        clearTimeout(stopTimers[hubUrl]);
        delete stopTimers[hubUrl];
    }

    if (connections[hubUrl]?.state === signalR.HubConnectionState.Connected) {
        return connections[hubUrl];
    }

    if (connectionPromises[hubUrl]) {
        await connectionPromises[hubUrl];
        return connections[hubUrl];
    }

    if (!connections[hubUrl]) {
        connections[hubUrl] = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: async () => (await getValidToken()) || ""
            })
            .withAutomaticReconnect()
            .build();
    }

    const connection = connections[hubUrl];

    if (connection.state === signalR.HubConnectionState.Disconnected) {
        connectionPromises[hubUrl] = connection.start();
        try {
            await connectionPromises[hubUrl];
            console.log(`SignalR Connected: ${hubUrl}`);
        } catch (err) {
            console.error("SignalR Connection Failed:", err);
            delete connectionPromises[hubUrl];
            throw err;
        }
    }

    return connection;
}

export function subscribe(
    hubUrl: string,
    eventName: string,
    callback: (...args: any[]) => void
) {
    subscriberCount[hubUrl] = (subscriberCount[hubUrl] || 0) + 1;

    startConnection(hubUrl).catch(console.error);

    const setupListener = () => {
        const conn = connections[hubUrl];
        if (conn) conn.on(eventName, callback);
    };

    if (connections[hubUrl]?.state === signalR.HubConnectionState.Connected) {
        setupListener();
    } else {
        connectionPromises[hubUrl]?.then(setupListener);
    }

    return () => {
        subscriberCount[hubUrl]--;

        if (connections[hubUrl]) {
            connections[hubUrl].off(eventName, callback);
        }

        if (subscriberCount[hubUrl] <= 0) {
            if (stopTimers[hubUrl]) clearTimeout(stopTimers[hubUrl]);

            stopTimers[hubUrl] = setTimeout(() => {
                void stopConnection(hubUrl);
            }, 5000);
        }
    };
}

export async function stopConnection(hubUrl: string) {
    const connection = connections[hubUrl];

    if ((subscriberCount[hubUrl] || 0) > 0) return;
    if (!connection || connection.state === signalR.HubConnectionState.Disconnected) return;

    try {
        await connection.stop();
        delete connectionPromises[hubUrl];
        console.log(`SignalR Disconnected: ${hubUrl}`);
    } catch (err) {
        console.error("SignalR Stop Error:", err);
    }
}
