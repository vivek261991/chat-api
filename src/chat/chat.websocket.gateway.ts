import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import {ConflictException, ForbiddenException, NotFoundException} from '@nestjs/common';
import {Participant, ChatDto, toMessageDto, RoomData, RoomDto} from "./chat.dto";

@WebSocketGateway({ transports: ['websocket'], cors: true } )
export class ChatWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server;

    private static rooms: Map<string, RoomData> = new Map();
    private static participants: Map<string, string> = new Map(); // sockedId => roomId

    handleConnection(socket: Socket): void {
        const socketId = socket.id;
        console.log(`New connecting... socket id:`, socketId);
        ChatWebsocketGateway.participants.set(socketId, '');
    }

    handleDisconnect(socket: Socket): void {
        const socketId = socket.id;
        console.log(`Disconnection... socket id:`, socketId);
        const roomId = ChatWebsocketGateway.participants.get(socketId);
        const room = ChatWebsocketGateway.rooms.get(roomId);
        if (room) {
            room.participants.get(socketId).connected = false;
            this.server.emit(
                `participants/${roomId}`,
                Array.from(room.participants.values()),
            );
        }
    }

    @SubscribeMessage('participants')
    async onParticipate(socket: Socket, participant: Participant) {
        const socketId = socket.id;
        console.log(
            `Registering new participant... socket id: %s and participant: `,
            socketId,
            participant,
        );

        const roomId = participant.roomId;
        if (!ChatWebsocketGateway.rooms.has(roomId)) {
            console.error('Room with id: %s was not found, disconnecting the participant', roomId);
            socket.disconnect();
            throw new ForbiddenException('The access is forbidden');
        }

        const room = ChatWebsocketGateway.rooms.get(roomId);
        ChatWebsocketGateway.participants.set(socketId, roomId);
        participant.connected = true;
        room.participants.set(socketId, participant);
        // when received new participant we notify the chatter by room
        /* this.server.emit(
            `participants/${roomId}`,
            Array.from(room.participants.values()),
        ); */
        this.server.emit('exchanges', Array.from(room.participants.values()))
    }

    @SubscribeMessage('exchanges')
    async onMessage(socket: Socket, message: ChatDto) {
        const socketId = socket.id;
        message.socketId = socketId;
        console.log(
            'Received new message... socketId: %s, message: ',
            socketId,
            message,
        );
        const roomId = message.roomId;
        const roomData = ChatWebsocketGateway.rooms.get(roomId);

        if (!roomData) {
            return 'Invalid Room ID'
        }

        message.order = roomData.messages.length + 1;
        roomData.messages.push(message);
        ChatWebsocketGateway.rooms.set(roomId, roomData);
        // when received message we notify the chatter by room
        // this.server.emit(roomId, toMessageDto(message));
        // return message
        // socket.broadcast.emit('exchanges', message); => sends back message to all connected clients except to the one who emitted the msg.
        this.server.emit('exchanges', message) // sends back messages to all connected clients including the one who emitted the msg.
    }

    static get(roomId: string): RoomData {
        return this.rooms.get(roomId);
    }

    static getAllRoomInfo() {
        let result = []
        ChatWebsocketGateway.rooms.forEach((value, key) => {
            result.push({key: value})
        });
        return result
    }

    static createRoom(roomDto: RoomDto): void {
        const roomId = roomDto.roomId;
        if (this.rooms.has(roomId)) {
            throw new ConflictException({code: 'room.conflict', message: `Room with '${roomId}' already exists`})
        }
        this.rooms.set(roomId, new RoomData(roomDto.creatorUsername));
    }

    static close(roomId: string) {
        if (!this.rooms.has(roomId)) {
            throw new NotFoundException({code: 'room.not-fond', message: `Room with '${roomId}' not found`})
        }
        this.rooms.delete(roomId);
    }
}
