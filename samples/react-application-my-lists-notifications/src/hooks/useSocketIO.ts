import { io, Socket } from "socket.io-client";
import { GlobalStateContext } from "../components/GlobalStateProvider";
import { useCallback, useContext } from "react";
import find from "lodash/find";
import { IActiveConnection } from "../models/IActiveConnection";

export const useSocketIO = (handleNotifications?: any) => {
  const { state } = useContext(GlobalStateContext);

  const connectToSocketListServer = useCallback( (notificationUrl: string): Socket => {
    const split = notificationUrl.split("/callback?");
    const socket = io(split[0], { query: split[1] as any, transports: ["websocket"] });
    socket.on("connect", () => {
      console.log("Connected!", notificationUrl);
    });
    socket.on("notification", handleNotifications);
    socket.on("disconnect", (reason) => {
      console.log("disconnect", reason);
    });
    socket.on("connect_error", (reason) => {
      console.log("error", reason);
    });
    return socket;
  },[]);



  const closeActiveConnections = useCallback( async () => {
    const { activeConnections } = state;
    for (const activeConnection of activeConnections) {
      const { socket, listId } = activeConnection;
      socket.disconnect();
      socket.offAny();
      socket.close();
      console.log("connection close for listId", listId);
    }
  },[state]);

  return {
    connectToSocketListServer,
    closeActiveConnections,
  };
};
