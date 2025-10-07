# dream-app (Anima Insights)

[![CI](https://github.com/sittora/dream-app/actions/workflows/ci.yml/badge.svg)](https://github.com/sittora/dream-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sittora/dream-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/sittora/dream-app/actions/workflows/codeql.yml)
[![Dependabot status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://docs.github.com/code-security/dependabot)
[![Gitleaks Weekly Scan](https://github.com/sittora/dream-app/actions/workflows/gitleaks-weekly.yml/badge.svg)](https://github.com/sittora/dream-app/actions/workflows/gitleaks-weekly.yml)

Minimal, type-safe dream journaling & analysis platform with AI-assisted interpretation and authentication features.

## Screenshots

> NOTE: Images are placeholders until real captures are added.

| Home | Record Dream | Analysis |
|------|--------------|----------|
| ![Home](docs/images/home.png "Home - TODO real image") | ![Record Dream](docs/images/record-dream.png "Record Dream - TODO real image") | ![Analysis](docs/images/analysis.png "Analysis - TODO real image") |

If images are missing locally, ensure the `docs/images/` directory exists and populate with real PNG exports.

## Features

Core:
- Dream journaling & tagging
- AI-assisted (OpenAI) interpretation flows
- Authentication (register/login/refresh/logout/profile)
- Theme toggle (night/day)
- Basic analytics & ranks

Technical:
- React + Vite + TypeScript
- Express API (health, search, auth)
- Drizzle ORM migrations
- Sidecar service (`numinos-service`) for host auth & persistence
- Pino structured logging
- ESLint + Prettier + Husky + lint-staged
- Security scanning (Gitleaks, CodeQL, Dependabot)

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React, Framer Motion, Tailwind (utilities) |
| Build | Vite, TypeScript |
| API | Express (server.ts) |
| Auth | JWT (extended/simple routers) |
| DB | Drizzle ORM (Postgres / SQLite dev) |
| AI | OpenAI SDK |
| Tooling | ESLint, Prettier, Vitest, Husky |

## Quick Start

### Prerequisites
```bash
node >= 20
npm >= 9
```

### Installation
1. Clone and install:
```bash
git clone https://github.com/sittora/dream-app.git
cd dream-app
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Initialize database:
```bash
npm run db:migrate   # (if migrations configured)
npm run db:seed      # Optional
```

4. Start development:
```bash
npm run dev
```

## Environment Variables

All real secrets stay local or in deployment infra. Copy `.env.example` -> `.env` and fill values.

| Name | Purpose |
|------|---------|
| VITE_OPENAI_API_KEY | OpenAI requests |
| VITE_JWT_SECRET | Client-side token checks (mirror server secret) |
| VITE_API_URL | Base API URL |
| VITE_APP_NAME / VITE_APP_VERSION | Display metadata |
| VITE_ENV | Environment tag |
| VITE_MFA_ENABLED | Feature toggle |
| VITE_ANALYTICS_ENABLED | Feature toggle |
| JWT_SECRET | Server JWT signing |
| DATABASE_URL / POSTGRES_* | Database connectivity |
| REDIS_URL | Redis cache/ratelimit |
| HOST_PRIVATE_KEY_PATH / HOST_PUBLIC_KEY_PATH | Host auth key paths |

Additional placeholders documented in `.env.example`.

## Scripts

| Script | Purpose |
|--------|---------|
| dev | Run Vite dev server |
| dev:server | Run Express server (ts-node) |
| build | Type-check + bundle client |
| start | Start built server (if applicable) |
| lint | ESLint checks |
| type-check | TS compile no emit |
| test | Vitest unit tests |
| validate | lint + type-check + test |
| db:migrate | Run DB migrations |
| db:seed | Seed data (optional) |

## Secret Scanning

Automated protection against accidental secret commits:

Local commands:
- Staged diff scan (pre-push equivalent): `npm run secrets:scan:staged`
- Workspace (no VCS history) scan: `npm run secrets:scan`
- Full repository scan (with git history): `npm run secrets:scan:full`

CI:
- Push/PR: `gitleaks-ci` job runs `detect -v --redact`.
- Weekly scheduled job (Mon 03:00 UTC) runs full scan.

Allowlist: `.gitleaks.toml` (kept intentionally tiny; rotate real secrets instead of broad allowlisting).

Pre-push hook blocks any staged leaks before they leave your machine.

## Architecture
See `docs/architecture.md` for the full diagram and folder responsibilities.

High-level flow:
1. React (Vite) client issues requests to the Express API (`/api/*`).
2. Middleware assigns a `requestId` (nanoid) used in structured pino logs for traceability.
3. Auth + feature routes execute handlers (and optionally sidecar service logic) hitting DB / external APIs.
4. Shadow validation (Zod) logs warnings for schema issues; strict mode (env toggled) enforces 400 on requests or configurable status on response schema failures.
5. Responses return JSON; OpenAPI spec is partially generated from Zod for auth routes.

Key environment toggles: `ENABLE_API_VALIDATION`, `ENABLE_RESPONSE_VALIDATION`, `VALIDATION_STRICT_ROUTES`, `RESPONSE_VALIDATION_STATUS`.

## API
OpenAPI spec: `docs/openapi.yaml` (incremental; expand as endpoints grow). Run `npm run openapi:lint` for ruleset checks.

Generated Portions:
- Auth routes (`/api/auth/login|register|refresh`) are generated from Zod schemas via `@asteasolutions/zod-to-openapi` using `npm run openapi:gen`.
- System/search paths remain manually curated.

Workflow:
```bash
npm run openapi:gen && npm run openapi:lint
```
CI runs generation before lint/tests.

### Shadow Validation (Non-Breaking)
Request bodies on new auth endpoints are validated with Zod in "shadow" mode by default:

Behavior matrix:

| ENABLE_API_VALIDATION | Valid Payload | Invalid Payload |
|-----------------------|---------------|-----------------|
| unset / false         | 200 (normal handler flow) + warning log | 200 (still flows) + warning log (issues serialized) |
| true                  | 200 (normal handler flow) | 400 with `{ error: 'Validation failed', details: [...] }` |

Enable strict mode only after confidence:
```bash
export ENABLE_API_VALIDATION=true
# Or per-route:
export VALIDATION_STRICT_ROUTES=/api/auth/login,/api/auth/register
# Enable (optional) response validation strictness:
export ENABLE_RESPONSE_VALIDATION=true
# Optional: customize status code returned on strict response validation failure (default 500)
export RESPONSE_VALIDATION_STATUS=422
```

Schemas live in `src/api/schemas/*.ts`; middleware in `src/api/validate.ts` attaches parsed data as `req.validatedBody` on success.

Low-risk next step: gradually switch critical routes to strict mode or gate per-route env flag.

## CI & Security

Integrated tooling:
- CI workflow: install, validate, build
- Gitleaks scan (push/PR + history)
- CodeQL static analysis
- Dependabot weekly updates

## Observability

- Request logging via pino + pino-http middleware (JSON structured; severity based on status codes)
- Endpoint: `GET /version` returns `{ service, gitSha, env }` for release traceability (CI injects `GIT_SHA`)

Redaction & Correlation:
- Each request receives a `requestId` (nanoid, 10 chars) included in log lines for trace stitching.
- Sensitive fields are removed from logs: `authorization` header, `password`, `token`, `user.password`, `config.secrets`, and cookies.
- `/version` now returns a short 7-character git SHA (logs still record full SHA once at startup for audit).
 - Pre-push hook runs a lightweight Gitleaks diff scan and repo validate to prevent accidental secret leaks.

Example `/version` response:
```json
{
	"service": "dream-app",
	"gitSha": "<short or full commit sha>",
	"env": "development"
}
```

Pre-commit: Husky + lint-staged format & lint + secret scanning script.

## 🛠️ Development

### Available Scripts

#### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Drizzle Studio

#### Code Quality
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Verify TypeScript types
- `npm run validate` - Run all checks

#### Security
- `npm run security:audit` - Check dependencies
- `npm run update:check` - Check for updates
- `npm run update:apply` - Update dependencies

#### Host authentication for sidecar
- The NuminOS sidecar supports stronger host authentication using signed assertions (RS256). See `numinos-service/docs/host-auth.md` for details and `numinos-service/scripts/host-request-token.js` for an example host script that signs an assertion and requests a token from `/token`.

### Project Structure
```
anima-insights/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Route components
│   ├── services/     # Business logic & API
│   ├── hooks/        # Custom React hooks
│   ├── db/           # Database schema & config
│   ├── types/        # TypeScript definitions
│   └── utils/        # Helper functions
├── public/           # Static assets
├── scripts/          # Build & maintenance
└── drizzle/          # Database migrations
```

## Security (Summary)

### Authentication
- JWT with refresh token rotation
- TOTP-based 2FA
- Secure session management
- Rate limiting & lockouts

### Data Protection
- Bcrypt password hashing
- Environment variable security
- SQL injection prevention
- Input validation with Zod

### Best Practices
- Security headers
- CORS configuration
- XSS prevention
- CSRF tokens

## Design System (Snapshot)

### Colors
- Primary: `#800020` (Burgundy)
- Background: `#0C1B33` (Midnight)
- Text: `#F5E6D3` (Parchment)
- Accents: Gold & Silver

### Typography
- Headers: UnifrakturMaguntia
- Body: Cinzel
- Content: Cormorant Garamond

### Components
- Animated cards & transitions
- Responsive layouts
- Custom form elements
- Gothic-inspired UI

## Reward System (Snapshot)

### Points
- Dream sharing: 10 points
- Quality interpretation: 15 points
- Received likes: 2 points
- Streak bonus: 5 points
- Achievement unlock: 25 points

### Ranks
1. Dreamer Initiate (0-99)
2. Shadow Walker (100-499)
3. Mystic Voyager (500-999)
4. Dream Weaver (1000-2499)
5. Archetype Oracle (2500-4999)
6. Anima Sage (5000-9999)
7. Collective Guardian (10000+)

### Multipliers
- Consecutive days: 1.5x
- Quality content: 2.0x
- Community favorite: 1.25x

## Roadmap / TODO

- [ ] Add integration tests for auth + search endpoints
- [ ] E2E smoke tests (Playwright / Cypress)
- [ ] Centralize zod schemas -> OpenAPI generation

### Q1 2024
- [ ] Mobile applications
- [ ] Advanced pattern analysis
- [ ] Sleep tracking integration

### Q2 2024
- [ ] Enhanced social features
- [ ] Expanded resource library
- [ ] Multi-language support

### Q3 2024
- [ ] AI improvements
- [ ] Community features
- [ ] Premium features

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Carl Gustav Jung's analytical psychology
- Marie-Louise von Franz's dream interpretation
- OpenAI for GPT-4 integration
- Unsplash for imagery

## Screenshots / Media (Placeholders)

| Preview | Description |
|---------|-------------|
| (screenshot-1.png) | Dashboard overview |
| (screenshot-2.png) | Dream detail view |
| (screencast.gif) | Interaction demo |

## Support / Contact

For questions or support:
- 📧 Email: support@anima-insights.com
- 💬 Discord: [Join our community](https://discord.gg/anima-insights)
- 🐦 Twitter: [@AnimaInsights](https://twitter.com/AnimaInsights)

---

<p align="center">Maintained with care — contributions welcome.</p>
