import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

export interface CustomServer extends NetServer {
  io?: SocketIOServer;
}

export interface SocketWithIO {
  server: CustomServer;
} 