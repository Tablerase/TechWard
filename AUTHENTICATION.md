# Authentication System

This project uses a hybrid JWT authentication system with:

- **Access Tokens**: Short-lived (15 minutes), stored in `localStorage`, sent via `Authorization` header
- **Refresh Tokens**: Long-lived (7 days), stored in httpOnly cookies, automatically sent with requests

## Architecture

### Backend

The authentication system consists of:

1. **User Entity** (`backend/src/entity/user.ts`)

   - User model with unique ID, funny caregiver name, and creation timestamp

2. **Auth Service** (`backend/src/services/auth/auth.service.ts`)

   - Token generation and validation
   - User creation with unique IDs (timestamp + random string)
   - Automatic assignment of funny caregiver names
   - In-memory user store (replace with database in production)

3. **Auth Controller** (`backend/src/controllers/auth.controller.ts`)

   - `/auth/login` - Login or create new user
   - `/auth/refresh` - Refresh access token
   - `/auth/logout` - Invalidate refresh token
   - `/auth/verify` - Verify access token
   - `/auth/me` - Get current user from refresh token

4. **Auth Routes** (`backend/src/routes/auth.routes.ts`)
   - Express routes for authentication endpoints

### Frontend

1. **API Service** (`frontend/src/services/api.ts`)

   - Axios instance with interceptors
   - Automatic token refresh on 401 errors
   - Request queuing during token refresh
   - Automatic logout on refresh failure

2. **Auth Context** (`frontend/src/context/AuthContext.tsx`)
   - React context for authentication state
   - Auto-login on app mount
   - Login/logout methods
   - User information management

## Setup

### Backend

1. Install dependencies (already done):

   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your settings:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   ```

### Frontend

1. Configure environment variables:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Update `.env` with your backend URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Usage

### Login Flow

1. User calls `login()` from `AuthContext`
2. Frontend checks for existing `userId` in localStorage
3. Backend either:
   - Returns tokens for existing user, OR
   - Creates new user with funny name and returns tokens
4. Frontend stores:
   - `accessToken` in localStorage
   - `userId` in localStorage (for re-login)
   - Refresh token automatically stored in httpOnly cookie by browser

### Automatic Token Refresh

1. On any API request, if the server returns 401:
2. Axios interceptor automatically calls `/auth/refresh`
3. New access token is stored in localStorage
4. Original request is retried with new token
5. If refresh fails, user is logged out

### Logout Flow

1. User calls `logout()` from `AuthContext`
2. `/auth/logout` endpoint invalidates refresh token
3. Browser clears httpOnly cookie
4. Frontend clears access token from localStorage
5. User state is reset

### Auto-Login on App Mount

1. On app start, `AuthContext` calls `/auth/me`
2. If valid refresh token exists in cookie:
   - Backend returns new access token and user info
   - User is automatically logged in
3. If no valid session, user sees login UI

## API Endpoints

### POST `/auth/login`

**Body:**

```json
{
  "userId": "optional-existing-user-id"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "unique-user-id",
    "firstName": "Phil",
    "lastName": "Medisinn"
  }
}
```

### POST `/auth/refresh`

**Requires:** Refresh token in httpOnly cookie

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "unique-user-id",
    "firstName": "Phil",
    "lastName": "Medisinn"
  }
}
```

### POST `/auth/logout`

**Requires:** Refresh token in httpOnly cookie

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### GET `/auth/verify`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**

```json
{
  "user": {
    "id": "unique-user-id",
    "firstName": "Phil",
    "lastName": "Medisinn"
  }
}
```

### GET `/auth/me`

**Requires:** Refresh token in httpOnly cookie

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "unique-user-id",
    "firstName": "Phil",
    "lastName": "Medisinn"
  }
}
```

## Security Considerations

### Current Implementation (Development)

- **In-memory storage**: Users and tokens stored in memory (lost on restart)
- **HTTP allowed**: Cookies work over HTTP in development
- **Secret in code**: Default JWT secret provided (override with env var)

### Production Recommendations

1. **Database Storage**: Replace in-memory maps with proper database
2. **HTTPS Only**: Set `secure: true` on cookies
3. **Strong Secret**: Use cryptographically secure random JWT_SECRET (32+ chars)
4. **Environment Variables**: Never commit secrets to version control
5. **Token Rotation**: Implement refresh token rotation
6. **Rate Limiting**: Add rate limiting to auth endpoints
7. **CSRF Protection**: Consider CSRF tokens for additional security
8. **Session Management**: Track active sessions in database
9. **Audit Logging**: Log authentication events

## Example Frontend Usage

```tsx
import { useAuthContext } from "./hooks/useAuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>
        Welcome, {user?.firstName} {user?.lastName}!
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Making Authenticated API Calls

```tsx
import api from "./services/api";

// The API instance automatically:
// - Adds Authorization header with access token
// - Refreshes token on 401 errors
// - Retries failed requests after refresh

const fetchData = async () => {
  try {
    const response = await api.get("/patients");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};
```

## Troubleshooting

### "No valid session found" on auto-login

- This is normal on first visit or after cookies expire
- User needs to click login button

### Token refresh loop

- Check that CORS credentials are enabled
- Verify `withCredentials: true` in axios config
- Ensure cookies are being sent by browser

### CORS errors

- Add frontend URL to `ALLOWED_ORIGINS` in backend .env
- Verify `credentials: true` in CORS config

### Tokens not working after server restart

- In-memory storage is cleared on restart
- Users need to login again
- Implement database storage for production
