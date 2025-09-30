# 🌙 Anima Insights - Dream Journal & Analysis Platform

[Anima Insights]

A sophisticated dream journaling and interpretation platform powered by AI and inspired by Jungian psychology. Explore your unconscious mind through advanced dream analysis, connect with fellow dreamers, and unlock deep psychological insights.

## ✨ Features

### Core Functionality
- 📝 **Dream Journal**: Record and organize your dreams with rich detail and mood tracking
- 🤖 **AI Analysis**: GPT-4 powered dream interpretation with Jungian psychology integration
- 🧠 **The Oracle**: Interactive AI dream interpreter trained in archetypal symbolism
- 🌐 **Dream Web**: Social platform for anonymous dream sharing and interpretation
- 📊 **Dream Analytics**: Track patterns, symbols, and psychological themes
- 🏆 **Reward System**: Earn points and ranks for meaningful contributions
- 📱 **Responsive Design**: Neo-Gothic elegance optimized for all devices

### Technical Features
- 🔒 **Advanced Security**:
  - JWT-based authentication with refresh tokens
  - Multi-factor authentication (TOTP)
  - Rate limiting and brute force protection
  - Secure password hashing with bcrypt
  - CSRF and XSS protection

- 💾 **Data Management**:
  - SQLite database with Drizzle ORM
  - Efficient data relationships
  - Type-safe database operations
  - Automated migrations

- 🎨 **Modern UI/UX**:
  - Framer Motion animations
  - Responsive layouts
  - Dark/Light theme support
  - Custom Gothic-inspired components

- 🤝 **Social Features**:
  - Private messaging system
  - Friend connections
  - Public/private dream sharing
  - Engagement tracking

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation
1. Clone and install:
```bash
git clone https://github.com/yourusername/anima-insights.git
cd anima-insights
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Initialize database:
```bash
npm run db:migrate
npm run db:seed  # Optional: Add sample data
```

4. Start development:
```bash
npm run dev
```

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

## 🔒 Security Features

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

## 🎨 Design System

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

## 📊 Reward System

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

## 🔮 Roadmap

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

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Carl Gustav Jung's analytical psychology
- Marie-Louise von Franz's dream interpretation
- OpenAI for GPT-4 integration
- Unsplash for imagery

## 📧 Support

For questions or support:
- 📧 Email: support@anima-insights.com
- 💬 Discord: [Join our community](https://discord.gg/anima-insights)
- 🐦 Twitter: [@AnimaInsights](https://twitter.com/AnimaInsights)

---

<p align="center">Made with ❤️ for dream explorers everywhere</p>
