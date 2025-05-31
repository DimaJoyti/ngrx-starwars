# Star Wars API Server (Go)

A REST API server built with Go that provides Star Wars data compatible with the Angular frontend.

## Features

- 🚀 **Fast Go API** with Gin framework
- 📊 **SQLite Database** with GORM ORM
- 🔄 **CORS Support** for Angular frontend
- 📄 **Pagination** for large datasets
- 🔍 **Search Functionality** for characters
- 🎬 **Complete Star Wars Data** (Characters, Films, Species, Starships)
- 🔗 **SWAPI Compatible** response format

## API Endpoints

### Characters
- `GET /api/people` - Get paginated list of characters
- `GET /api/people?page=2` - Get specific page
- `GET /api/people?search=luke` - Search characters by name
- `GET /api/people/:id` - Get character by ID

### Films
- `GET /api/films` - Get all films

### Species
- `GET /api/species` - Get all species

### Starships
- `GET /api/starships` - Get all starships

### Health Check
- `GET /health` - API health status

## Installation & Setup

### Prerequisites
- Go 1.21 or higher
- Git

### 1. Initialize Go module
```bash
go mod init starwars-api
go mod tidy
```

### 2. Run the server
```bash
go run main.go
```

The server will start on `http://localhost:8080`

### 3. Test the API
```bash
# Get characters
curl http://localhost:8080/api/people

# Search characters
curl "http://localhost:8080/api/people?search=luke"

# Get specific character
curl http://localhost:8080/api/people/1

# Health check
curl http://localhost:8080/health
```

## Integration with Angular Frontend

Update the Angular service to point to the Go API:

```typescript
// In src/app/characters/swapi.service.ts
export class SwapiService {
  private readonly baseUrl = 'http://localhost:8080/api/';
  // ... rest of the service remains the same
}
```

## Quick Start

1. **Create the Go API files** (as provided above)
2. **Initialize Go module**: `go mod init starwars-api && go mod tidy`
3. **Start API server**: `go run main.go`
4. **Update Angular service** to use `http://localhost:8080/api/`
5. **Start Angular app**: `ng serve`

The API will automatically create and seed the SQLite database on first run.
