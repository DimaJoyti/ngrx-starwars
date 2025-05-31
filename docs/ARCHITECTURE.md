# 🏗️ Architecture Documentation

## Overview

The Star Wars Character Explorer is built using a modern, scalable architecture that separates concerns between the frontend (Angular) and backend (Go API).

## Frontend Architecture

### Component Structure

```
App Component (Root)
├── Character List Component
│   ├── Hero Section
│   ├── Character Cards Grid
│   ├── Pagination Controls
│   └── Loading States
├── Character Details Component
│   ├── Character Info
│   ├── Species Details
│   ├── Films List
│   └── Starships List
└── Character Search Component (Future)
    ├── Filters
    ├── Search Input
    └── Advanced Options
```

### State Management (NgRx)

#### Store Structure
```typescript
AppState {
  characters: CharacterState {
    data: Character[],
    isLoading: boolean,
    error: string | null,
    page: number,
    hasNext: boolean,
    hasPrevious: boolean
  },
  films: FilmState {
    data: Film[],
    isLoading: boolean,
    error: string | null
  }
}
```

#### Actions
- `fetchCharacters` - Load characters from API
- `fetchCharactersSuccess` - Characters loaded successfully
- `fetchCharactersError` - Error loading characters
- `changePage` - Navigate to different page
- `selectCharacter` - Select character for details

#### Effects
- `CharactersEffects` - Handle character-related side effects
- `FilmsEffects` - Handle film-related side effects

### Services

#### CharacterService
- Manages HTTP requests to the API
- Provides caching for better performance
- Handles error states and retries

#### NotifyService
- Displays user notifications
- Manages snackbar messages
- Handles different notification types

#### ErrorHandlerService
- Global error handling
- Logs errors for debugging
- Provides user-friendly error messages

### Routing

```typescript
Routes = [
  { path: '', component: CharacterListComponent },
  { path: 'characters/:id', component: CharacterDetailsComponent },
  { path: '**', redirectTo: '' }
]
```

## Backend Architecture

### API Structure

```
main.go
├── Database Layer (GORM + SQLite)
├── Models (Character, Film, Species, Starship)
├── Handlers (HTTP request handlers)
├── Middleware (CORS, Rate Limiting, Logging)
└── Routes (API endpoints)
```

### Database Schema

#### Characters Table
```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  height TEXT,
  mass TEXT,
  birth_year TEXT,
  gender TEXT,
  eye_color TEXT,
  hair_color TEXT,
  skin_color TEXT,
  homeworld TEXT,
  url TEXT UNIQUE,
  created_at DATETIME,
  updated_at DATETIME
);
```

#### Films Table
```sql
CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  episode_id INTEGER,
  opening_crawl TEXT,
  director TEXT,
  producer TEXT,
  release_date TEXT,
  url TEXT UNIQUE,
  created_at DATETIME,
  updated_at DATETIME
);
```

### API Endpoints

#### Characters
- `GET /api/people` - Paginated character list
- `GET /api/people/:id` - Single character
- `GET /api/people?search=name` - Search characters

#### Films
- `GET /api/films` - All films
- `GET /api/films/:id` - Single film

#### Species
- `GET /api/species` - All species
- `GET /api/species/:id` - Single species

#### Starships
- `GET /api/starships` - All starships
- `GET /api/starships/:id` - Single starship

### Middleware

#### CORS Middleware
```go
func SetupCORS() gin.HandlerFunc {
  return gin.HandlerFunc(func(c *gin.Context) {
    c.Header("Access-Control-Allow-Origin", "*")
    c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Content-Type")
    
    if c.Request.Method == "OPTIONS" {
      c.AbortWithStatus(204)
      return
    }
    
    c.Next()
  })
}
```

#### Rate Limiting
- 100 requests per minute per IP
- Prevents API abuse
- Returns 429 status when exceeded

#### Logging
- Request/response logging
- Error tracking
- Performance monitoring

## Data Flow

### Character List Loading
1. User navigates to home page
2. `CharacterListComponent` dispatches `fetchCharacters` action
3. `CharactersEffects` intercepts action and calls API
4. API returns paginated character data
5. Effect dispatches `fetchCharactersSuccess` with data
6. Reducer updates state with new characters
7. Component receives updated state via selector
8. UI renders character cards

### Character Details Loading
1. User clicks on character card
2. Router navigates to `/characters/:id`
3. `CharacterDetailsComponent` extracts ID from route
4. Component calls `CharacterService.getCharacter(id)`
5. Service finds character in cached data
6. Component loads related data (species, films, starships)
7. UI renders character details

## Performance Optimizations

### Frontend
- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Change Detection**: Reduces unnecessary checks
- **TrackBy Functions**: Optimizes list rendering
- **Caching**: HTTP responses cached in memory
- **Bundle Splitting**: Separate chunks for better loading

### Backend
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Reduced payload size
- **Caching Headers**: Browser caching enabled

## Security Considerations

### Frontend
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Angular built-in protection
- **Content Security Policy**: Restricted resource loading

### Backend
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitized inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: No sensitive data in errors

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component and service testing
- **Integration Tests**: Feature testing
- **E2E Tests**: User journey testing

### Backend Testing
- **Unit Tests**: Handler and model testing
- **Integration Tests**: API endpoint testing
- **Load Tests**: Performance testing

## Deployment Architecture

### Development
```
Developer Machine
├── Angular Dev Server (localhost:4200)
└── Go API Server (localhost:8080)
```

### Production
```
CDN (Frontend Assets)
├── Load Balancer
├── Web Servers (Multiple instances)
└── Database (SQLite/PostgreSQL)
```

## Monitoring and Logging

### Frontend
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics
- **Performance**: Web Vitals monitoring

### Backend
- **Application Logs**: Structured logging
- **Access Logs**: Request tracking
- **Error Logs**: Error monitoring
- **Metrics**: Performance metrics

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Advanced Search**: Full-text search
- **User Accounts**: Authentication system
- **Favorites**: Save favorite characters
- **Offline Support**: PWA capabilities

### Technical Improvements
- **Microservices**: Split into smaller services
- **GraphQL**: More efficient data fetching
- **Docker**: Containerized deployment
- **CI/CD**: Automated deployment pipeline
