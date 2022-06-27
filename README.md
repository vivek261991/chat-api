## Nest JS based Chat server with API and websocket gateway

![home](img/home.jpg)

Chat server using WebSockets with [Nest](https://github.com/nestjs/nest) framework.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev
```

## Required packages

```shell
npm i --save @nestjs/websockets @nestjs/platform-socket.io ngx-socket-io
npm i --save-dev @types/socket.io
```

## Web Socket Gateway

- ### Init:
  We add `@WebSocketServer() server;` inside of our [ChatWebsocketGateway](/src/chat/chat.websocket.gateway.ts) to 
  attaches a native Web Socket Server to our property `server` which is
  **real-time**, **bidirectional** and **event-based communication** between the client and the server

- ### Handlers:
  To handle the connection and disconnection at our websocket server we need implement interfaces
  `OnGatewayConnection` and `OnGatewayDisconnect`.

- ### Subscribers:
  We use decorator `@SubscribeMessage('exchanges')` on the method that handles our messagin  rules on `exchanges` events,

## APIs

[RoomsController](/src/chat/rooms.controller.ts)

- ### Create room:

  #### Resource:
        /api/v1/rooms

  #### Body:
        roomId: the room id (room name)
        creatorUsername: the username with creats the room

  #### Example:
    ```shell
    curl -X POST 'http://localhost:3000/api/v1/rooms' \
    --data-raw '{
        "roomId": "3XX",
        "creatorUsername": "Dhoni"
    }'
    ```
  #### Error cases:

    - Invalid body:
    ````json
    {
      "statusCode": 400,
      "message": [
        "roomId should not be empty",
        "creatorUsername should not be empty"
      ],
      "error": "Bad Request"
    }
    ````

    - Existing room id:
    ````json
    {
      "code": "room.conflict",
      "message": "Room with 'exmple-room' already exists"
    }
    ````

- ### Get room messages:

  #### Resource:
        /api/v1/rooms/{roomId}/messages

  #### Params:
        roomId: the room id

  #### Example:
    ```shell
    curl -X GET 'http://localhost:3000/api/v1/rooms/123/messages'
    ```

  #### Error cases:

    - Invalid room id (ex: not found or closed):
    ````json
    {
      "code": "access-forbidden",
      "message": "The access is forbidden"
    }
    ````

- ### Close room (Delete room):

  ### Resource:
        /api/v1/rooms/{roomId}

  ### Params:
        roomId: the room id

  ### Example:

    ```shell
    curl -X DELETE http://localhost:3000/api/v1/rooms/123
    ```

  #### Error cases:
    - Invalid room id (ex: not found or closed):
    ````json
    {
      "code": "room.not-found",
      "message": "Room with '3XX' not found"
    }
    ````
