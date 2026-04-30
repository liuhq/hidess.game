# Hidess Server

## Development

### Env

- `BETTER_AUTH_SECRET`: Arbitrary key, used for encrypting auth database during
  local development.
- `BETTER_AUTH_URL`: Same as server, default: `http://localhost:5876`
- `BETTER_AUTH_API_KEY`: `better-auth` dashboard api key

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
GameInfo (gid)
├── players: { Side: uid }
├── status: 'playing' | 'finished'
└── result: GameResult

User (uid)
└── currentGid?: gid
```

### RESTAPI

#### user

| Method | Route        | Description             | Body                               | Return     |
| ------ | ------------ | ----------------------- | ---------------------------------- | ---------- |
| GET    | `/user/:uid` | Get user information    |                                    | `UserInfo` |
| POST   | `/user`      | Create a new user       | `{ uid }`                          |            |
| PATCH  | `/user/:uid` | Update user information | `{ status, current_gid, history }` | `UserInfo` |
| DELETE | `/user/:uid` | Delete user             |                                    |            |

#### game

| Method | Route                | Description             | Body                | Return       |
| ------ | -------------------- | ----------------------- | ------------------- | ------------ |
| GET    | `/game/:gid`         | Get game information    |                     | `GameInfo`   |
| GET    | `/game?uid={UserId}` | Get user's game history |                     | `[GameInfo]` |
| POST   | `/game`              | Create a new game       | `{ players }`       | `gid`        |
| PATCH  | `/game/:gid`         | Update game status      | `{ status, steps }` |              |

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

**game**

| Type           | When              | Payload                 |
| -------------- | ----------------- | ----------------------- |
| `game:created` | New game created  | `{ gid, players }`      |
| `game:start`   | Game start        | `{ gid, initialState }` |
| `game:state`   | Update game state | `{ gid, state }`        |
| `game:end`     | Game end          | `{ gid, GameResult }`   |

#### Client to Server

| Type          | When                 | Payload                         |
| ------------- | -------------------- | ------------------------------- |
| `game:action` | User does the action | `{ gid, players.Side, action }` |
