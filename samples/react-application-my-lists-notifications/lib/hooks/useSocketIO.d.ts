import { Socket } from "socket.io-client";
export declare const useSocketIO: (handleNotifications?: any) => {
    connectToSocketListServer: (notificationUrl: string) => Socket<import("socket.io-client/build/typed-events").DefaultEventsMap, import("socket.io-client/build/typed-events").DefaultEventsMap>;
    checkIfListHasActiveConnection: (listId: string) => boolean;
    closeActiveConnection: (listId: string) => boolean;
    closeActiveConnections: () => Promise<void>;
};
//# sourceMappingURL=useSocketIO.d.ts.map