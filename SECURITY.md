# Security Guidelines

## Environment Variables

This project uses environment variables to manage sensitive configuration. **Never commit actual `.env` files to git.**

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in the `.env` file

3. Generate secure keys for authentication:
   ```bash
   # Generate private key
   openssl genrsa -out numinos-service/test-keys/host_private.pem 2048
   
   # Generate public key
   openssl rsa -in numinos-service/test-keys/host_private.pem -pubout -out numinos-service/test-keys/host_public.pem
   ```

## Sensitive Files to Keep Private

The following files/directories are automatically ignored by git:

- `.env*` files (except `.env.example`)
- `**/test-keys/` directories
- `**/*_private.pem` and `**/*_public.pem` files
- Database data directories (`pgdata/`)
- Any `secrets/` or `api-keys/` directories

## Production Considerations

1. **Environment Variables**: Use your hosting platform's environment variable management
2. **Database Passwords**: Use strong, randomly generated passwords
3. **JWT Secrets**: Use cryptographically secure random strings (min 32 characters)
4. **API Keys**: Store in secure environment variable services
5. **SSL/TLS**: Use HTTPS in production
6. **Key Management**: Use proper key management services for production keys

## Development vs Production

- **Development**: Default credentials are acceptable for local development
- **Production**: All default credentials MUST be changed
- **Staging**: Use production-like security with different credentials

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the maintainers.