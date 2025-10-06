# Authentication Configuration

## Environment Variables

Add these to your `.env` file:

```bash
# Authentication Configuration
ENABLE_EMAIL_VERIFY=false
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
BASE_URL=http://localhost:3000

# Rate Limiting (optional, defaults shown)
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=900000

# Password Requirements (optional, defaults shown)
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_LETTER=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_SPECIAL_CHAR=false
```

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "message": "Account created"
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email already registered
- `429` - Too many attempts (rate limited)
- `500` - Internal server error

### POST /api/auth/verify (Optional)

Verify email address with token (requires `ENABLE_EMAIL_VERIFY=true`).

**Request Body:**
```json
{
  "token": "verification-token-string"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

## Integration Notes

### Database Integration Required

The current implementation includes placeholder database functions that need to be connected to your existing database layer:

1. **`UserDatabase.findUserByEmail()`** - Query existing users table by email
2. **`UserDatabase.createUser()`** - Insert new user into existing users table  
3. **`UserDatabase.updateEmailVerified()`** - Update email verification status

### Schema Compatibility

The new auth system is designed to work with your existing `users` table. You may need to add these optional columns:

```sql
-- Optional additions to existing users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN display_name TEXT;
```

### Client Integration

A standalone client helper is provided in `src/services/authClient.ts` for future UI integration:

```typescript
import { registerUser } from './services/authClient';

// In your registration component
const handleRegister = async (formData) => {
  try {
    const result = await registerUser({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName
    });
    console.log('User registered:', result.user);
  } catch (error) {
    console.error('Registration failed:', error.details);
  }
};
```

## Security Features

- **Argon2id password hashing** with secure parameters
- **Rate limiting** (5 attempts per 15 minutes per IP)
- **Input validation** with Zod schemas
- **Email normalization** (trimmed, lowercase)
- **Constant-time responses** to prevent account enumeration
- **Email verification** (optional, feature-flagged)

## Testing

Run the auth tests:

```bash
npm run test:auth
```

## Development

Start server with auth routes:

```bash
npm run dev:server
```

Test registration endpoint:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "displayName": "Test User"
  }'
```