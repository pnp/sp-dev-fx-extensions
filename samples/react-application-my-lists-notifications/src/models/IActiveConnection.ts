import { Socket } from 'socket.io-client';
export interface IActiveConnection {
  socket: Socket;
  listId: string | number;
}
