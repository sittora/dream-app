# Authentication System - Login & Logout

## Overview

This document describes the additive login and logout functionality implemented for the dream app. All new authentication endpoints work alongside existing registration and email verification without modifying any existing code.

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "rememberMe": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "profileImage": null,
      "points": 100,
      "level": 2,
      "rank": "Dreamer Initiate",
      "mfaEnabled": false
    },
    "expiresIn": "7d"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials",
  "message": "The email or password you entered is incorrect"
}
```

#### POST `/api/auth/logout`
Logout from current session.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "loggedOut": true,
    "timestamp": "2025-10-05T12:00:00.000Z"
  }
}
```

#### POST `/api/auth/logout-all`
Logout from all devices (requires authentication).

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "data": {
    "loggedOutFromAllDevices": true,
    "timestamp": "2025-10-05T12:00:00.000Z"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### Status & Profile Endpoints

#### GET `/api/auth/status`
Get authentication status (works with or without token).

**Request Headers (Optional):**
```
Authorization: Bearer <access_token>
```

**Response (Authenticated):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "profileImage": null,
      "bio": null,
      "points": 100,
      "level": 2,
      "rank": "Dreamer Initiate",
      "mfaEnabled": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "dreamStats": {
        "totalDreams": 0,
        "publicDreams": 0,
        "privateDreams": 0,
        "totalLikes": 0,
        "totalComments": 0,
        "totalSaves": 0
      }
    }
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": true,
  "data": {
    "authenticated": false,
    "user": null
  }
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    }
  }
}
```

#### GET `/api/auth/health`
Health check for authentication service.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "authentication",
    "status": "healthy",
    "timestamp": "2025-10-05T12:00:00.000Z",
    "endpoints": {
      "login": "/api/auth/login",
      "logout": "/api/auth/logout",
      "register": "/api/auth/register",
      "refresh": "/api/auth/refresh",
      "status": "/api/auth/status",
      "profile": "/api/auth/me"
    },
    "features": {
      "jwt": true,
      "refreshTokens": true,
      "tokenBlacklist": true,
      "mfa": false
    }
  }
}
```

## Security Features

### JWT Tokens
- **Access Tokens**: Short-lived (15 minutes by default)
- **Refresh Tokens**: Long-lived (30 days by default)
- **Remember Me**: Extends access token lifetime to 30 days
- **Secure Headers**: Tokens must be sent in `Authorization: Bearer <token>` header

### Token Blacklisting
- Logout immediately invalidates tokens
- In-memory blacklist for development
- Automatic cleanup of expired tokens
- Ready for Redis/database implementation

### Security Middleware
- **`authenticateToken`**: Requires valid token
- **`optionalAuth`**: Sets user if valid token provided, continues without user otherwise
- **`requireAdmin`**: Requires admin role (future enhancement)

### Input Validation
- Comprehensive Zod schemas
- Email format validation
- Password requirements
- Safe error messages (no information leakage)

## Integration with Existing System

### Frontend Integration
The new authentication system is designed to work seamlessly with the existing frontend:

**AuthContext Updates (suggested):**
```typescript
// The existing login function can be updated to use the new endpoint
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);
    }
  } catch (error) {
    // Handle error
  }
};

const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch (error) {
    // Handle error
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }
};
```

### Database Integration
The system uses the existing database structure:
- Uses `dbService.getUserByEmail()` and `dbService.getUserById()`
- Compatible with existing `users` table schema
- Supports MFA flag for future 2FA integration

### Backward Compatibility
- All existing routes continue to work unchanged
- Existing registration and email verification unmodified
- Can be deployed alongside existing authentication
- Gradual migration path available

## Environment Configuration

Add these environment variables to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Optional: Logging level
LOG_LEVEL=info
```

## File Structure

```
src/server/auth/
├── login.ts              # Login and token refresh handlers
├── logout.ts             # Logout and token blacklist management
├── middleware.ts         # Authentication middleware
└── status.ts             # Status and health check endpoints

src/server/
└── routes.auth.ts        # Updated router with new endpoints
```

## Error Handling

### Common Error Codes
- **400**: Bad Request (validation failed)
- **401**: Unauthorized (invalid/expired token, wrong credentials)
- **403**: Forbidden (insufficient permissions)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": ["Additional validation errors if applicable"]
}
```

## Testing

### Manual Testing
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get status
curl -X GET http://localhost:3001/api/auth/status \
  -H "Authorization: Bearer <your-token>"

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <your-token>"
```

### Frontend Testing
1. Use existing login form with updated API calls
2. Test token persistence in localStorage
3. Verify automatic logout on token expiration
4. Test refresh token functionality

## Future Enhancements

### Planned Features
1. **2FA Integration**: Connect with existing 2FA system
2. **Session Management**: Database-backed session storage
3. **Device Management**: Track and manage user devices
4. **OAuth Integration**: Social login options
5. **Rate Limiting**: Prevent brute force attacks

### Production Considerations
1. **Token Storage**: Move blacklist to Redis/database
2. **Monitoring**: Add metrics and alerts
3. **Scaling**: Stateless design ready for horizontal scaling
4. **Security**: Regular security audits and updates

## Troubleshooting

### Common Issues
1. **Token Expired**: Use refresh token endpoint
2. **Invalid Credentials**: Check email/password combination
3. **Missing Authorization Header**: Include `Bearer <token>` in requests
4. **CORS Issues**: Ensure proper CORS configuration for frontend

### Debug Mode
Set `LOG_LEVEL=debug` in environment variables for detailed logging.

### Health Check
Use `GET /api/auth/health` to verify service status and available features.