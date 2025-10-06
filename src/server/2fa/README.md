# Two-Factor Authentication (2FA) System

## Overview

This directory contains a comprehensive two-factor authentication system implementing industry best practices for account security. The system is designed to be additive-only, requiring no changes to existing UI components.

## Architecture

### Core Components

1. **Security Infrastructure** (`../security/`)
   - Password hashing with Argon2id + server pepper
   - Field-level encryption with XChaCha20-Poly1305
   - Rate limiting with progressive lockouts
   - CSRF protection and security headers

2. **TOTP Authentication** (`totp.controller.ts`)
   - Time-based One-Time Passwords using RFC 6238
   - QR code generation for authenticator apps
   - Encrypted secret storage
   - Backup verification during enrollment

3. **Backup Codes** (`backup.controller.ts`)
   - Single-use recovery codes
   - Bcrypt hashed with unique salts
   - Automatic invalidation after use
   - Secure generation with crypto.randomBytes

4. **WebAuthn Support** (`webauthn.controller.ts`)
   - FIDO2/WebAuthn security keys
   - Biometric authentication support
   - Feature-flagged implementation
   - Cross-platform authenticator support

### Database Integration

The system is designed to integrate with the existing Drizzle ORM schema. All database operations are currently marked as TODO and should be replaced with actual implementations using the existing database layer.

Required database extensions:
- Users table modifications for 2FA fields
- TOTP secrets table
- Backup codes table
- WebAuthn credentials table
- Challenge storage (or Redis for temporary data)

## API Endpoints

### TOTP Authentication

```
POST   /api/2fa/totp/enroll     - Start TOTP enrollment
POST   /api/2fa/totp/verify     - Verify TOTP code (enrollment or login)
DELETE /api/2fa/totp/disable    - Disable TOTP
GET    /api/2fa/totp/status     - Get TOTP status
```

### Backup Codes

```
POST /api/2fa/backup/generate   - Generate new backup codes
POST /api/2fa/backup/verify     - Verify backup code
GET  /api/2fa/backup/status     - Get backup codes status
```

### WebAuthn (Feature-Flagged)

```
POST   /api/2fa/webauthn/register/options   - Get registration options
POST   /api/2fa/webauthn/register/verify    - Verify registration
POST   /api/2fa/webauthn/login/options      - Get authentication options
POST   /api/2fa/webauthn/login/verify       - Verify authentication
GET    /api/2fa/webauthn/credentials        - List user credentials
DELETE /api/2fa/webauthn/credentials/:id    - Remove credential
```

### System Status

```
GET  /api/2fa/status              - Comprehensive 2FA status
POST /api/2fa/emergency-disable   - Emergency 2FA disable (not implemented)
```

## Security Features

### Rate Limiting
- Graduated rate limiting on all sensitive endpoints
- Account lockouts for repeated failures
- Progressive delays for brute force protection

### Encryption
- TOTP secrets encrypted at rest using XChaCha20-Poly1305
- Server-side pepper for additional password security
- Unique nonces for each encrypted field

### Input Validation
- Comprehensive Zod schemas for all inputs
- Sanitization of user-provided data
- Type-safe validation with detailed error messages

### Audit Logging
- Structured logging with Pino
- Security event tracking
- Failed attempt monitoring

## Configuration

### Environment Variables

```bash
# Core Security
SERVER_PEPPER=your-server-pepper-key-here
CSRF_SECRET=your-csrf-secret-here

# 2FA Configuration
TOTP_ISSUER="Anima Insights"
BACKUP_CODE_LENGTH=8
BACKUP_CODE_COUNT=10

# WebAuthn (Optional)
ENABLE_WEBAUTHN=true
WEBAUTHN_RP_ID=localhost
BASE_URL=http://localhost:3000

# Rate Limiting
ENABLE_RATE_LIMITING=true
REDIS_URL=redis://localhost:6379  # For distributed rate limiting

# Logging
LOG_LEVEL=info
```

### Feature Flags

- `ENABLE_WEBAUTHN`: Enable/disable WebAuthn support
- `ENABLE_RATE_LIMITING`: Enable/disable rate limiting
- Individual feature toggles in security configuration

## Implementation Status

### ✅ Completed
- Core security infrastructure (argon, crypto, rate limiting)
- TOTP enrollment and verification system
- Backup codes generation and verification
- WebAuthn controller with full FIDO2 support
- Input validation schemas
- Rate limiting configuration
- Security headers and CSRF protection

### 🔄 In Progress
- Database integration (replacing TODO implementations)
- Authentication middleware integration
- Session management enhancements

### 📋 Planned
- Email verification for 2FA changes
- Emergency disable with additional verification
- Admin dashboard for security monitoring
- Comprehensive test suite
- API documentation with OpenAPI spec

## Security Considerations

### Threat Model
- **Brute Force**: Rate limiting with progressive lockouts
- **Credential Stuffing**: Account lockouts and monitoring
- **Session Hijacking**: Secure session management (planned)
- **Social Engineering**: Email verification for changes
- **Device Compromise**: Multiple 2FA methods available

### Best Practices Implemented
- Secrets never logged or exposed
- Timing-safe comparisons for sensitive operations
- Secure random generation for all cryptographic material
- Encrypted storage of sensitive data
- Progressive rate limiting
- Comprehensive input validation

### Compliance Considerations
- GDPR: User can disable 2FA and delete credentials
- SOC 2: Audit logging and access controls
- NIST 800-63B: Multi-factor authentication guidelines
- OWASP: Security headers and input validation

## Integration Guide

### Adding to Existing Server

1. **Install Dependencies** (already done)
```bash
npm install argon2 otplib qrcode libsodium-wrappers @simplewebauthn/server
npm install -D @types/qrcode @types/libsodium-wrappers
```

2. **Environment Setup**
```bash
# Add to .env
SERVER_PEPPER=$(openssl rand -hex 32)
CSRF_SECRET=$(openssl rand -hex 32)
```

3. **Database Migration**
```sql
-- Add 2FA fields to users table
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN backup_codes_generated BOOLEAN DEFAULT FALSE;

-- Create dedicated tables (see db schema TODO)
```

4. **Router Integration**
```typescript
import twoFactorRouter from './src/server/2fa/router.js';
app.use('/api/2fa', twoFactorRouter);
```

### Frontend Integration (No Changes Required)

The 2FA system is designed to work with the existing authentication UI. All endpoints return standard JSON responses that can be consumed by the current frontend without modifications.

For enhanced UX, consider adding:
- QR code display for TOTP enrollment
- Backup codes download/display
- 2FA status indicators
- WebAuthn registration flows

## Testing

### Unit Tests (Planned)
- Crypto functions validation
- TOTP generation and verification
- Backup code hashing and verification
- Rate limiting behavior
- Input validation schemas

### Integration Tests (Planned)
- Full enrollment flows
- Authentication scenarios
- Error handling
- Rate limiting integration
- Database operations

### Security Tests (Planned)
- Timing attack resistance
- Rate limiting bypass attempts
- Invalid input handling
- Encryption/decryption cycles
- Session security

## Monitoring

### Key Metrics
- 2FA enrollment rates
- Authentication attempt success/failure ratios
- Rate limiting trigger frequency
- WebAuthn usage statistics
- Security event frequencies

### Alerts
- Multiple failed 2FA attempts
- Rate limiting activations
- Emergency disable requests
- Unusual authentication patterns
- System error rates

## Troubleshooting

### Common Issues
1. **TOTP time drift**: Ensure server time synchronization
2. **Rate limiting false positives**: Adjust rate limiting parameters
3. **WebAuthn failures**: Check HTTPS and origin configuration
4. **Backup code issues**: Verify bcrypt configuration

### Debug Mode
Set `LOG_LEVEL=debug` for detailed operation logging.

### Health Checks
All controllers include comprehensive error handling and logging for debugging purposes.

## Contributing

### Code Style
- TypeScript strict mode
- ESLint configuration compliance
- Comprehensive error handling
- Structured logging with context

### Security Review Process
All changes to this security-critical code should undergo:
1. Code review by security-aware developers
2. Testing of all security boundaries
3. Verification of encryption/hashing implementations
4. Rate limiting and input validation checks

### Documentation
Keep this README updated with any architectural changes or new features.