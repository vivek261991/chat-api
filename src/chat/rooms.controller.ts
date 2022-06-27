import {
    BadRequestException,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Query,
    HttpCode, Post, ForbiddenException, Body
} from "@nestjs/common";

import {chatService} from "./chat.service";
import {ChatWebsocketGateway} from "./chat.websocket.gateway";
import {RoomDto} from "./chat.dto";

export interface MessageDto {
    username: string;
    content: string;
    createdAt: Date;
}

@Controller('/api/v1/rooms')
export class RoomsController {

    @Post()
    @HttpCode(201)
    createRoom(@Body() roomDto: RoomDto): void {
        console.log("Creating chat room...", roomDto);
        try {
            return ChatWebsocketGateway.createRoom(roomDto);
        } catch (e) {
            console.error('Failed to initiate room', e);
            throw e;
        }
    }

    @Get('/:roomId/messages')
    getRoomMessages(@Param('roomId') roomId: string): MessageDto[] {
        console.log("Retrieving room messages with roomId: %s and indexes from: %s to %s", roomId);
        try {
            return chatService.getMessages(roomId);
        } catch (e) {
            console.error('Failed to get room messages', e);
            throw new ForbiddenException({code: 'access-forbidden', message: 'The access is forbidden'});
        }
    }

    @Delete('/:roomId')
    @HttpCode(204)
    closeRoom(@Param('roomId') roomId: string): void {
        console.log("Deleting room with roomId:", roomId);
        try {
            ChatWebsocketGateway.close(roomId);
        } catch (e) {
            console.error('Failed to close room', e);
            throw e;
        }
    }

    @Get('/room-info')
    getRoomInfo() {
        return ChatWebsocketGateway.getAllRoomInfo()
    }

    private throwBadRequestException(code: string, message: string) {
        throw new BadRequestException({code, message});
    }
}
