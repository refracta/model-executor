import WSServer from "../WSServer";
import ServerSender from "./ServerSender";
import SocketServer from "../SocketServer";

export default abstract class SocketSender extends ServerSender<SocketServer<any, SocketSender>> {
}