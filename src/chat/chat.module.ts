import { Module } from '@nestjs/common';
import { ChatWebsocketGateway } from './chat.websocket.gateway';

@Module({
  providers: [ChatWebsocketGateway]
})
export class ChatModule {}
