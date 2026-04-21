# Hidess Server

## Local API Document

Follow the steps, then open: http://localhost:5876/doc

```sh
pnpm serve:dev

# or
pnpm -F server dev

# or
cd ./server
pnpm dev
```

## Design (Draft)

### Resources

```
RoomInfo (rid)
├── users: Set<uid>
└── games: Map<gid, GameInfo>

GameInfo (gid)
├── players: { Side: uid }
├── status: 'playing' | 'finished'
└── result: GameResult

User (uid)
├── currentRid?: rid
└── currentGid?: gid
```

### RESTAPI

#### room

| Method | Route         | Description          | Body | Return     |
| ------ | ------------- | -------------------- | ---- | ---------- |
| POST   | `/rooms`      | Create a new room    |      | `rid`      |
| GET    | `/rooms/:rid` | Get room information |      | `RoomInfo` |
| DELETE | `/rooms/:rid` | Delete room          |      |            |

#### room <-> user

| Method | Route                    | Description      | Body      | Return           |
| ------ | ------------------------ | ---------------- | --------- | ---------------- |
| GET    | `/rooms/:rid/users`      | Get users list   |           | `RoomInfo.users` |
| POST   | `/rooms/:rid/users`      | User joins room  | `{ uid }` |                  |
| DELETE | `/rooms/:rid/users/:uid` | User leaves room |           |                  |

#### room <-> game

| Method | Route                    | Description              | Body          | Return           |
| ------ | ------------------------ | ------------------------ | ------------- | ---------------- |
| GET    | `/rooms/:rid/games`      | Get games list in room   |               | `RoomInfo.games` |
| GET    | `/rooms/:rid/games/:gid` | Get game information     |               | `GameInfo`       |
| POST   | `/rooms/:rid/games`      | Create a new game        | `{ players }` | `gid`            |
| PATCH  | `/rooms/:rid/games/:gid` | Update the gaming status | `{ status }`  |                  |
|        |                          |                          |               |                  |

### WebSocket

| Method | Route              | Description                                             |
| ------ | ------------------ | ------------------------------------------------------- |
| GET    | `/ws?uid={UserId}` | Upgrade a global WebSocket connection when user logined |

WebSocket message protocol:

```ts
interface WsMessage {
  type: string
  payload: Record<string, unknown>
}
```

#### Server to Client

**room**

| Type                 | When             | Payload                    |
| -------------------- | ---------------- | -------------------------- |
| `room:user_joined`   | User joined room | `{ rid, uid }`             |
| `room:user_left`     | User left room   | `{ rid, uid }`             |
| `room:game_created`  | New game created | `{ rid, gid, players }`    |
| `room:game_finished` | Game finished    | `{ rid, gid, GameResult }` |

**game**

| Type         | When              | Payload                          |
| ------------ | ----------------- | -------------------------------- |
| `game:start` | Game start        | `{ gid, players, initialState }` |
| `game:state` | Update game state | `{ gid, state }`                 |
| `game:end`   | Game end          | `{ gid, GameResult }`            |

#### Client to Server

| Type          | When                 | Payload                         |
| ------------- | -------------------- | ------------------------------- |
| `game:action` | User does the action | `{ gid, players.Side, action }` |
