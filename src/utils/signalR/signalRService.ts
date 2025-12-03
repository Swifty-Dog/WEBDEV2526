import * as signalR from "@microsoft/signalr";

const connections: Record<string, signalR.HubConnection> = {};

export function startConnection(hubUrl: string): signalR.HubConnection {
    const existing = connections[hubUrl];
    if (existing && existing.state === signalR.HubConnectionState.Connected) {
        return existing;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        throw new Error("Authentication token not found for SignalR connection.");
    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

    connection.start().catch(err => console.error("SignalR start error:", err));

    connections[hubUrl] = connection;
    return connection;
}

export function subscribe(
    hubUrl: string,
    eventName: string,
    callback: (...args: any[]) => void
) {
    const connection = startConnection(hubUrl);

    connection.on(eventName, callback);

    return () => {
        connection.off(eventName, callback);
    };
}

export function stopConnection(hubUrl: string) {
    const connection = connections[hubUrl];
    if (connection) {
        connection.stop().catch(err => console.error("SignalR stop error:", err));
        delete connections[hubUrl];
    }
}
