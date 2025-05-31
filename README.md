# 🌟 Star Wars Character Explorer

> A modern Angular application for exploring characters from a galaxy far, far away...

[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![NgRx](https://img.shields.io/badge/NgRx-19-purple.svg)](https://ngrx.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Material Design](https://img.shields.io/badge/Material-19-orange.svg)](https://material.angular.io/)
[![Go](https://img.shields.io/badge/Go-1.21-blue.svg)](https://golang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Star Wars Character Explorer](https://via.placeholder.com/800x400/0A0E1A/FFE81F?text=Star+Wars+Character+Explorer)

*Experience the Star Wars universe with a modern, responsive web application featuring authentic theming and smooth animations.*

## 🎬 Demo

🔗 **Live Demo**: [https://starwars-explorer.vercel.app](https://starwars-explorer.vercel.app) *(Coming Soon)*

### 📸 Screenshots

<details>
<summary>🏠 Hero Section & Character Grid</summary>

![Hero Section](https://via.placeholder.com/800x500/0A0E1A/FFE81F?text=Hero+Section+with+Animated+Death+Star)

*Immersive hero section with animated Death Star and character statistics*

![Character Grid](https://via.placeholder.com/800x500/1B263B/FFE81F?text=Character+Cards+Grid+Layout)

*Modern character cards with hover effects and detailed information*

</details>

<details>
<summary>📱 Mobile Experience</summary>

![Mobile View](https://via.placeholder.com/400x800/0A0E1A/FFE81F?text=Mobile+Responsive+Design)

*Fully responsive design optimized for mobile devices*

</details>

<details>
<summary>🎨 Star Wars Theming</summary>

![Dark Theme](https://via.placeholder.com/800x500/0A0E1A/FFE81F?text=Authentic+Star+Wars+Dark+Theme)

*Authentic Star Wars color scheme with glowing effects*

</details>

## ✨ Features

### 🎨 Frontend Features
- 🚀 **Angular 19** - Latest Angular with standalone components
- 🔄 **NgRx State Management** - Predictable state container
- 🎨 **Modern Star Wars UI** - Dark theme with authentic Star Wars styling
- 📱 **Responsive Design** - Works on all devices
- 🧭 **Interactive Navigation** - Sidebar menu with category browsing
- ⚡ **Fast Performance** - Optimized loading and caching
- 🎭 **Smooth Animations** - Engaging user experience
- ♿ **Accessibility** - WCAG compliant

### 🌌 Data Categories
- 👥 **30+ Characters** - Heroes, villains from all Star Wars eras
- 🌍 **10+ Planets** - Detailed worlds from Tatooine to Coruscant
- 🏛️ **5+ Organizations** - Jedi Order, Sith, Empire, Rebels, First Order
- ⚔️ **5+ Weapons** - Lightsabers, Death Star, and more
- 🚀 **10+ Starships** - X-wings, Star Destroyers, Millennium Falcon
- 🎬 **9 Films** - Complete main saga from Episodes I-IX
- 👽 **10+ Species** - Humans, Wookiees, Droids, and more

### 🔧 Backend Features
- 🐹 **Go API Server** - High-performance REST API with Gin framework
- 🗄️ **SQLite Database** - Lightweight data persistence with GORM
- 🔗 **SWAPI Compatible** - Familiar API format for easy integration
- 🌐 **CORS Support** - Cross-origin resource sharing enabled
- 📊 **Rich Data Model** - Enhanced relationships between entities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Go 1.21+ (for API server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DimaJoyti/ngrx-starwars.git
   cd ngrx-starwars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Go API server**
   ```bash
   go run main.go
   ```

4. **Start the Angular development server**
   ```bash
   ng serve
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Architecture

### 🎯 Tech Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Angular 19 + NgRx | Reactive UI with state management |
| **Styling** | SCSS + CSS Variables | Star Wars themed design system |
| **Backend** | Go + Gin Framework | High-performance REST API |
| **Database** | SQLite + GORM | Lightweight data persistence |
| **Build** | Angular CLI + Vite | Fast development and production builds |

### 🎨 Frontend Architecture
```
┌─ App Component (Root)
├─ Character List Component
│  ├─ Hero Section (Animated)
│  ├─ Character Cards Grid
│  ├─ Pagination Controls
│  └─ Loading States (Lightsaber)
├─ Character Details Component
│  ├─ Character Info Panel
│  ├─ Species Details
│  ├─ Films List
│  └─ Starships List
└─ Shared Components
   ├─ Loading Animations
   ├─ Error Handlers
   └─ Navigation
```

### ⚡ Backend Architecture
```
┌─ Go API Server (Port 8080)
├─ RESTful Endpoints (/api/*)
├─ Middleware Layer
│  ├─ CORS Handler
│  ├─ Rate Limiting (100/min)
│  ├─ Request Logging
│  └─ Error Recovery
├─ Business Logic
│  ├─ Character Service
│  ├─ Film Service
│  └─ Species Service
└─ Data Layer
   ├─ SQLite Database
   ├─ GORM ORM
   └─ Auto-Migration
```

## 📁 Project Structure

```
src/
├── app/
│   ├── characters/           # Character feature module
│   │   ├── character-list/   # Character list component
│   │   ├── character-details/# Character details component
│   │   ├── shared/          # Shared services and models
│   │   └── store/           # NgRx store (actions, reducers, effects)
│   ├── shared/              # Shared application components
│   └── styles.scss          # Global styles
├── assets/                  # Static assets
└── environments/            # Environment configurations
```

## 🎨 Design System

### 🌈 Color Palette

| Color | Hex | Usage | Preview |
|-------|-----|-------|---------|
| **Star Wars Yellow** | `#FFE81F` | Primary actions, highlights | ![#FFE81F](https://via.placeholder.com/20x20/FFE81F/FFE81F) |
| **Deep Space** | `#0A0E1A` | Main background | ![#0A0E1A](https://via.placeholder.com/20x20/0A0E1A/0A0E1A) |
| **Card Surface** | `#1B263B` | Component backgrounds | ![#1B263B](https://via.placeholder.com/20x20/1B263B/1B263B) |
| **Light Surface** | `#2D3748` | Hover states | ![#2D3748](https://via.placeholder.com/20x20/2D3748/2D3748) |
| **Primary Text** | `#FFFFFF` | Main text content | ![#FFFFFF](https://via.placeholder.com/20x20/FFFFFF/FFFFFF) |
| **Secondary Text** | `#A0AEC0` | Subtitles, descriptions | ![#A0AEC0](https://via.placeholder.com/20x20/A0AEC0/A0AEC0) |
| **Accent Blue** | `#00D4FF` | Links, special highlights | ![#00D4FF](https://via.placeholder.com/20x20/00D4FF/00D4FF) |

### 🔤 Typography System

```scss
// Primary Headers (Star Wars Style)
font-family: 'Orbitron', monospace;
font-weight: 900;
color: var(--sw-primary);
text-shadow: 0 0 10px rgba(255, 232, 31, 0.5);

// Body Text (Modern & Readable)
font-family: 'Exo 2', sans-serif;
font-weight: 400;
color: var(--sw-text-primary);
```

### ✨ Animation Library

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| **Fade In** | 0.5s | ease-in | Page transitions |
| **Slide In** | 0.5s | ease-out | Component entry |
| **Glow In** | 0.8s | ease-out | Special elements |
| **Float** | 3s | ease-in-out infinite | Death Star animation |
| **Lightsaber Glow** | 1.5s | ease-in-out infinite alternate | Loading states |

### 🎯 Component Patterns

#### Character Cards
```scss
.sw-character-card {
  background: var(--sw-gradient-card);
  border: 1px solid rgba(255, 232, 31, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--sw-shadow-lg);
    border-color: rgba(255, 232, 31, 0.4);
  }
}
```

## 🔧 Development

### 📋 Available Scripts

| Command | Description | Environment |
|---------|-------------|-------------|
| `npm start` | Start development server | Frontend (Port 4200) |
| `npm run build` | Build for production | Frontend |
| `npm run test` | Run unit tests | Frontend |
| `npm run test:watch` | Run tests in watch mode | Frontend |
| `npm run lint` | Lint TypeScript/SCSS | Frontend |
| `npm run e2e` | Run end-to-end tests | Frontend |
| `go run main.go` | Start API server | Backend (Port 8080) |
| `go test ./...` | Run Go tests | Backend |
| `go mod tidy` | Update dependencies | Backend |

### 🌍 Environment Configuration

#### Frontend Environment Files

**`src/environments/environment.ts`** (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableDebug: true,
  version: '2.0.0'
};
```

**`src/environments/environment.prod.ts`** (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  enableDebug: false,
  version: '2.0.0'
};
```

#### Backend Environment Variables

Create `.env` file in the root directory:
```env
# API Configuration
PORT=8080
API_BASE_URL=/api
CORS_ORIGINS=http://localhost:4200,https://your-domain.com

# Database
DB_PATH=./starwars.db
DB_DEBUG=false

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60s

# Application
APP_ENV=development
LOG_LEVEL=info
```

### 🛠️ Development Workflow

#### 1. Setup Development Environment
```bash
# Clone and setup
git clone https://github.com/DimaJoyti/ngrx-starwars.git
cd ngrx-starwars

# Install frontend dependencies
npm install

# Install Go dependencies
go mod download

# Start development servers (in separate terminals)
go run main.go        # Terminal 1: API server
npm start            # Terminal 2: Angular dev server
```

#### 2. Code Quality Tools
```bash
# Frontend linting and formatting
npm run lint                    # ESLint + Angular linting
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Prettier formatting

# Backend linting
go fmt ./...                   # Format Go code
go vet ./...                   # Vet Go code
golangci-lint run             # Advanced linting (if installed)
```

#### 3. Testing Strategy
```bash
# Frontend testing
npm run test                   # Unit tests (Jest)
npm run test:coverage         # Coverage report
npm run e2e                   # End-to-end tests (Cypress)

# Backend testing
go test ./...                 # Unit tests
go test -race ./...           # Race condition detection
go test -bench=.              # Benchmark tests
```

## 📚 API Documentation

The application uses a custom Go API server that provides enhanced SWAPI-compatible endpoints:

### 🔗 Available Endpoints

#### Characters
- `GET /api/people` - Get paginated characters
- `GET /api/people/:id` - Get character by ID

#### Films
- `GET /api/films` - Get all films (Episodes I-IX)

#### Planets
- `GET /api/planets` - Get all planets
- `GET /api/planets/:id` - Get planet by ID

#### Organizations
- `GET /api/organizations` - Get all organizations (Jedi, Sith, Empire, etc.)

#### Weapons
- `GET /api/weapons` - Get all weapons (lightsabers, superweapons)

#### Starships
- `GET /api/starships` - Get all starships

#### Species
- `GET /api/species` - Get all species

### Example Response

```json
{
  "count": 82,
  "next": "http://localhost:8080/api/people?page=2",
  "previous": null,
  "results": [
    {
      "name": "Luke Skywalker",
      "height": "172",
      "mass": "77",
      "birth_year": "19BBY",
      "gender": "male",
      "films": ["https://swapi.dev/api/films/1/"],
      "species": [],
      "url": "https://swapi.dev/api/people/1/"
    }
  ]
}
```

## 🚀 Deployment

### Frontend Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - Firebase: `firebase deploy`

### Backend Deployment

1. **Build the Go binary**
   ```bash
   go build -o starwars-api main.go
   ```

2. **Deploy to your preferred platform**
   - Docker: Use provided `Dockerfile`
   - Heroku: Use `Procfile`
   - Cloud platforms: Follow platform-specific guides

## 💡 Usage Examples

### Frontend Integration

#### Using the Character Service
```typescript
import { CharacterService } from './characters/shared/character.service';

@Component({...})
export class MyComponent {
  characters$ = this.characterService.characters$;

  constructor(private characterService: CharacterService) {}

  loadCharacters() {
    this.characterService.loadCharacters(1); // Load page 1
  }

  searchCharacters(query: string) {
    this.characterService.searchCharacters(query);
  }
}
```

#### Custom Character Card Component
```typescript
@Component({
  selector: 'app-character-card',
  template: `
    <mat-card class="sw-character-card" (click)="onSelect()">
      <mat-card-header>
        <div mat-card-avatar class="sw-character-avatar">
          <mat-icon>{{ getCharacterIcon() }}</mat-icon>
        </div>
        <mat-card-title>{{ character.name }}</mat-card-title>
        <mat-card-subtitle>{{ character.gender }}</mat-card-subtitle>
      </mat-card-header>
    </mat-card>
  `
})
export class CharacterCardComponent {
  @Input() character!: Character;
  @Output() selected = new EventEmitter<Character>();

  onSelect() {
    this.selected.emit(this.character);
  }
}
```

### Backend API Usage

#### Fetch Characters with Pagination
```bash
# Get first page of characters
curl "http://localhost:8080/api/people?page=1&limit=10"

# Search for specific character
curl "http://localhost:8080/api/people?search=luke"

# Get character details
curl "http://localhost:8080/api/people/1"
```

#### JavaScript/TypeScript Client
```typescript
class StarWarsAPI {
  private baseUrl = 'http://localhost:8080/api';

  async getCharacters(page = 1, limit = 10) {
    const response = await fetch(`${this.baseUrl}/people?page=${page}&limit=${limit}`);
    return response.json();
  }

  async getCharacter(id: number) {
    const response = await fetch(`${this.baseUrl}/people/${id}`);
    return response.json();
  }

  async searchCharacters(query: string) {
    const response = await fetch(`${this.baseUrl}/people?search=${encodeURIComponent(query)}`);
    return response.json();
  }
}
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🚀 Quick Start for Contributors

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/ngrx-starwars.git
   cd ngrx-starwars
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   go mod download
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Changes & Test**
   ```bash
   npm run test
   npm run lint
   go test ./...
   ```

5. **Commit & Push**
   ```bash
   git commit -m 'feat: add amazing feature'
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**

### 📋 Contribution Guidelines

- Follow the [Contributing Guide](docs/CONTRIBUTING.md)
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

### 🎯 Areas for Contribution

- 🐛 **Bug Fixes** - Help us squash bugs
- ✨ **New Features** - Add exciting functionality
- 📚 **Documentation** - Improve guides and examples
- 🎨 **UI/UX** - Enhance the user experience
- ⚡ **Performance** - Optimize speed and efficiency
- 🧪 **Testing** - Increase test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | Detailed system architecture |
| [API Documentation](docs/API.md) | Complete API reference |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Contributing Guide](docs/CONTRIBUTING.md) | How to contribute to the project |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Changelog](CHANGELOG.md) | Version history and changes |

## 🔗 Useful Links

### 🌟 Project Resources
- **🏠 Homepage**: [GitHub Repository](https://github.com/DimaJoyti/ngrx-starwars)
- **🐛 Issues**: [Report Bugs](https://github.com/DimaJoyti/ngrx-starwars/issues)
- **💡 Discussions**: [Community Discussions](https://github.com/DimaJoyti/ngrx-starwars/discussions)
- **📋 Project Board**: [Development Progress](https://github.com/DimaJoyti/ngrx-starwars/projects)

### 🛠️ Technology Resources
- **Angular**: [Official Documentation](https://angular.io/docs)
- **NgRx**: [State Management Guide](https://ngrx.io/guide/store)
- **Angular Material**: [Component Library](https://material.angular.io/)
- **Go**: [Programming Language](https://golang.org/doc/)
- **SWAPI**: [Star Wars API](https://swapi.dev/)

## 🏆 Project Stats

![GitHub stars](https://img.shields.io/github/stars/DimaJoyti/ngrx-starwars?style=social)
![GitHub forks](https://img.shields.io/github/forks/DimaJoyti/ngrx-starwars?style=social)
![GitHub issues](https://img.shields.io/github/issues/DimaJoyti/ngrx-starwars)
![GitHub pull requests](https://img.shields.io/github/issues-pr/DimaJoyti/ngrx-starwars)
![GitHub last commit](https://img.shields.io/github/last-commit/DimaJoyti/ngrx-starwars)

## 🙏 Acknowledgments

### 🌟 Special Thanks
- **[SWAPI](https://swapi.dev/)** - For providing the comprehensive Star Wars data
- **[Angular Team](https://angular.io/)** - For the incredible framework and tools
- **[NgRx Team](https://ngrx.io/)** - For the powerful state management solution
- **[Material Design](https://material.io/)** - For the beautiful design system
- **[Go Community](https://golang.org/)** - For the efficient backend language

### 🎨 Design Inspiration
- **Star Wars Universe** - For the iconic visual design language
- **Modern Web Design** - For contemporary UI/UX patterns
- **Space Exploration** - For the cosmic theme and animations

### 🤝 Contributors

Thanks to all the amazing people who have contributed to this project:

<!-- Contributors will be automatically added here -->
<a href="https://github.com/DimaJoyti/ngrx-starwars/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DimaJoyti/ngrx-starwars" />
</a>

## 📞 Support & Community

### 🆘 Getting Help

1. **📖 Documentation First**
   - Check the [documentation](./docs/) for detailed guides
   - Review the [troubleshooting guide](docs/TROUBLESHOOTING.md)

2. **🔍 Search Existing Issues**
   - Browse [existing issues](https://github.com/DimaJoyti/ngrx-starwars/issues)
   - Check [closed issues](https://github.com/DimaJoyti/ngrx-starwars/issues?q=is%3Aissue+is%3Aclosed) for solutions

3. **💬 Community Discussion**
   - Join [GitHub Discussions](https://github.com/DimaJoyti/ngrx-starwars/discussions)
   - Ask questions in the community

4. **🐛 Report Issues**
   - Create a [new issue](https://github.com/DimaJoyti/ngrx-starwars/issues/new)
   - Use the provided templates
   - Include detailed information

### 📧 Contact

- **Project Maintainer**: [DimaJoyti](https://github.com/DimaJoyti)
- **Email**: aws.inspiration@gmail.com
- **GitHub**: [@DimaJoyti](https://github.com/DimaJoyti)

### 🌐 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and experiences
- Follow the [Code of Conduct](docs/CONTRIBUTING.md#code-of-conduct)

## 📈 Roadmap

### 🚀 Upcoming Features

- [ ] **Advanced Search & Filtering**
  - Multi-criteria search
  - Filter by species, films, homeworld
  - Search history and suggestions

- [ ] **Character Comparison**
  - Side-by-side character comparison
  - Statistical analysis
  - Visual comparison charts

- [ ] **Favorites System**
  - Save favorite characters
  - Personal character collections
  - Export/import favorites

- [ ] **Enhanced Details**
  - Character relationships
  - Timeline integration
  - Interactive character maps

- [ ] **Progressive Web App**
  - Offline functionality
  - Push notifications
  - App-like experience

### 🔮 Future Enhancements

- Real-time updates with WebSockets
- GraphQL API integration
- Advanced analytics dashboard
- Multi-language support
- Dark/Light theme toggle
- Character quiz and games

---

<div align="center">

### 🌟 Star Wars Character Explorer

**Built with ❤️ by the community**

*Explore the galaxy, one character at a time*

**May the Force be with you!** ⭐

---

[![Made with Angular](https://img.shields.io/badge/Made%20with-Angular-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![Powered by Go](https://img.shields.io/badge/Powered%20by-Go-blue?style=for-the-badge&logo=go)](https://golang.org/)
[![Star Wars API](https://img.shields.io/badge/Data%20from-SWAPI-yellow?style=for-the-badge)](https://swapi.dev/)

</div>
