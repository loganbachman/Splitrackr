## API contracts (v0)

### Auth
POST /auth/register  { email, password, displayName } -> { token, userId }
POST /auth/login     { email, password }              -> { token, userId }

### Households
POST /households { name, mode: 'manual'|'calendar', anchorDay?:int, anchorTimeUtc?:'HH:mm' } -> { id }
POST /invites/{code}/accept -> 204
GET  /me/households -> [{ id, name, role, mode, anchorDay, anchorTimeUtc }]
