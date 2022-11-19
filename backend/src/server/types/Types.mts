import {Socket as NetSocket} from "net";
import {WebSocket} from "ws";

type ISocket = NetSocket & { id?: string, data?: any };
type IWSSocket = WebSocket & { id?: string, data?: any, req?: any };

export type {ISocket, IWSSocket};