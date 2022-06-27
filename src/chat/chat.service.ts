import {ConflictException, NotFoundException} from '@nestjs/common';
import {MessageDto, toMessageDto} from "./chat.dto";
import {ChatWebsocketGateway} from "./chat.websocket.gateway";

export class ChatService {

    constructor() {}

    getMessages(roomId: string): MessageDto[] {
        const room = ChatWebsocketGateway.get(roomId)
        if (!room) {
            throw new NotFoundException({code: 'room.not-fond', message: 'Room not found'})
        }
        return room.messages
            .map(toMessageDto);
    }

}

export const chatService = new ChatService();
