# 🚀 API Documentation

The Star Wars Character Explorer uses a custom Go API server that provides SWAPI-compatible endpoints for accessing Star Wars data.

## 🌐 Base URL

- **Development**: `http://localhost:8080`
- **Production**: `https://your-api-domain.com`

## 📋 API Overview

### Response Format

All API responses follow a consistent format:

```json
{
  "count": 82,
  "next": "http://localhost:8080/api/people?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Handling

Error responses include detailed information:

```json
{
  "error": "Resource not found",
  "message": "Character with ID 999 does not exist",
  "code": 404,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## 👥 Characters Endpoints

### Get All Characters

Retrieve a paginated list of Star Wars characters.

**Endpoint**: `GET /api/people`

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by character name

**Example Request**:
```bash
curl "http://localhost:8080/api/people?page=1&limit=5"
```

**Example Response**:
```json
{
  "count": 82,
  "next": "http://localhost:8080/api/people?page=2&limit=5",
  "previous": null,
  "results": [
    {
      "name": "Luke Skywalker",
      "height": "172",
      "mass": "77",
      "hair_color": "blond",
      "skin_color": "fair",
      "eye_color": "blue",
      "birth_year": "19BBY",
      "gender": "male",
      "homeworld": "https://swapi.dev/api/planets/1/",
      "films": [
        "https://swapi.dev/api/films/1/",
        "https://swapi.dev/api/films/2/",
        "https://swapi.dev/api/films/3/",
        "https://swapi.dev/api/films/6/"
      ],
      "species": [],
      "vehicles": [
        "https://swapi.dev/api/vehicles/14/",
        "https://swapi.dev/api/vehicles/30/"
      ],
      "starships": [
        "https://swapi.dev/api/starships/12/",
        "https://swapi.dev/api/starships/22/"
      ],
      "created": "2014-12-09T13:50:51.644000Z",
      "edited": "2014-12-20T21:17:56.891000Z",
      "url": "https://swapi.dev/api/people/1/"
    }
  ]
}
```

### Get Character by ID

Retrieve a specific character by their ID.

**Endpoint**: `GET /api/people/{id}`

**Parameters**:
- `id` (required): Character ID (1-82)

**Example Request**:
```bash
curl "http://localhost:8080/api/people/1"
```

**Example Response**:
```json
{
  "name": "Luke Skywalker",
  "height": "172",
  "mass": "77",
  "hair_color": "blond",
  "skin_color": "fair",
  "eye_color": "blue",
  "birth_year": "19BBY",
  "gender": "male",
  "homeworld": "https://swapi.dev/api/planets/1/",
  "films": [
    "https://swapi.dev/api/films/1/",
    "https://swapi.dev/api/films/2/",
    "https://swapi.dev/api/films/3/",
    "https://swapi.dev/api/films/6/"
  ],
  "species": [],
  "vehicles": [
    "https://swapi.dev/api/vehicles/14/",
    "https://swapi.dev/api/vehicles/30/"
  ],
  "starships": [
    "https://swapi.dev/api/starships/12/",
    "https://swapi.dev/api/starships/22/"
  ],
  "created": "2014-12-09T13:50:51.644000Z",
  "edited": "2014-12-20T21:17:56.891000Z",
  "url": "https://swapi.dev/api/people/1/"
}
```

### Search Characters

Search for characters by name.

**Endpoint**: `GET /api/people?search={query}`

**Example Request**:
```bash
curl "http://localhost:8080/api/people?search=luke"
```

## 🎬 Films Endpoints

### Get All Films

Retrieve all Star Wars films.

**Endpoint**: `GET /api/films`

**Example Request**:
```bash
curl "http://localhost:8080/api/films"
```

**Example Response**:
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "title": "A New Hope",
      "episode_id": 4,
      "opening_crawl": "It is a period of civil war...",
      "director": "George Lucas",
      "producer": "Gary Kurtz, Rick McCallum",
      "release_date": "1977-05-25",
      "characters": [
        "https://swapi.dev/api/people/1/",
        "https://swapi.dev/api/people/2/"
      ],
      "planets": [
        "https://swapi.dev/api/planets/1/"
      ],
      "starships": [
        "https://swapi.dev/api/starships/2/"
      ],
      "vehicles": [
        "https://swapi.dev/api/vehicles/4/"
      ],
      "species": [
        "https://swapi.dev/api/species/1/"
      ],
      "created": "2014-12-10T14:23:31.880000Z",
      "edited": "2014-12-20T19:49:45.256000Z",
      "url": "https://swapi.dev/api/films/1/"
    }
  ]
}
```

## 🧬 Species Endpoints

### Get All Species

Retrieve all Star Wars species.

**Endpoint**: `GET /api/species`

**Example Request**:
```bash
curl "http://localhost:8080/api/species"
```

**Example Response**:
```json
{
  "count": 37,
  "next": null,
  "previous": null,
  "results": [
    {
      "name": "Human",
      "classification": "mammal",
      "designation": "sentient",
      "average_height": "180",
      "skin_colors": "caucasian, black, asian, hispanic",
      "hair_colors": "blonde, brown, black, red",
      "eye_colors": "brown, blue, green, hazel, grey, amber",
      "average_lifespan": "120",
      "homeworld": "https://swapi.dev/api/planets/9/",
      "language": "Galactic Basic",
      "people": [
        "https://swapi.dev/api/people/66/",
        "https://swapi.dev/api/people/67/"
      ],
      "films": [
        "https://swapi.dev/api/films/1/"
      ],
      "created": "2014-12-10T13:52:11.567000Z",
      "edited": "2014-12-20T21:36:42.136000Z",
      "url": "https://swapi.dev/api/species/1/"
    }
  ]
}
```

## 🚀 Starships Endpoints

### Get All Starships

Retrieve all Star Wars starships.

**Endpoint**: `GET /api/starships`

**Example Request**:
```bash
curl "http://localhost:8080/api/starships"
```

**Example Response**:
```json
{
  "count": 36,
  "next": null,
  "previous": null,
  "results": [
    {
      "name": "CR90 corvette",
      "model": "CR90 corvette",
      "manufacturer": "Corellian Engineering Corporation",
      "cost_in_credits": "3500000",
      "length": "150",
      "max_atmosphering_speed": "950",
      "crew": "30-165",
      "passengers": "600",
      "cargo_capacity": "3000000",
      "consumables": "1 year",
      "hyperdrive_rating": "2.0",
      "MGLT": "60",
      "starship_class": "corvette",
      "pilots": [],
      "films": [
        "https://swapi.dev/api/films/1/"
      ],
      "created": "2014-12-10T14:20:33.369000Z",
      "edited": "2014-12-20T21:23:49.867000Z",
      "url": "https://swapi.dev/api/starships/2/"
    }
  ]
}
```

## 🏥 Health Check

### Health Status

Check API server health and status.

**Endpoint**: `GET /health`

**Example Request**:
```bash
curl "http://localhost:8080/health"
```

**Example Response**:
```json
{
  "status": "ok",
  "message": "Star Wars API is running",
  "version": "1.0.0",
  "timestamp": "2024-12-19T10:30:00Z",
  "uptime": "2h30m15s",
  "database": {
    "status": "connected",
    "characters_count": 82,
    "films_count": 6,
    "species_count": 37,
    "starships_count": 36
  }
}
```

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per minute per IP address
- **Headers**: Rate limit information is included in response headers

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Rate Limit Exceeded Response**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "code": 429,
  "retry_after": 60
}
```

## 🔧 Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 📝 Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
async function getCharacters(page = 1) {
  try {
    const response = await fetch(`http://localhost:8080/api/people?page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

// Using Angular HttpClient
@Injectable()
export class CharacterService {
  constructor(private http: HttpClient) {}
  
  getCharacters(page = 1): Observable<CharactersResponse> {
    return this.http.get<CharactersResponse>(`${this.apiUrl}/people?page=${page}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
}
```

### Python

```python
import requests

def get_characters(page=1):
    """Fetch Star Wars characters from API"""
    url = f"http://localhost:8080/api/people?page={page}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching characters: {e}")
        return None

# Usage
characters_data = get_characters(1)
if characters_data:
    for character in characters_data['results']:
        print(f"Name: {character['name']}")
```

### cURL Examples

```bash
# Get first page of characters
curl -X GET "http://localhost:8080/api/people" \
  -H "Accept: application/json"

# Search for characters
curl -X GET "http://localhost:8080/api/people?search=vader" \
  -H "Accept: application/json"

# Get character by ID with error handling
curl -X GET "http://localhost:8080/api/people/1" \
  -H "Accept: application/json" \
  -w "HTTP Status: %{http_code}\n"

# Check API health
curl -X GET "http://localhost:8080/health" \
  -H "Accept: application/json"
```

## 🔒 Authentication

Currently, the API doesn't require authentication. For production use, consider implementing:

- API keys
- JWT tokens
- OAuth 2.0
- Rate limiting per user

## 📈 Performance Tips

1. **Use pagination** for large datasets
2. **Implement caching** on the client side
3. **Handle rate limits** gracefully
4. **Use compression** for requests
5. **Monitor response times**

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Ensure the API server has CORS enabled
2. **Connection refused**: Check if the API server is running
3. **404 errors**: Verify the endpoint URLs
4. **Rate limiting**: Implement exponential backoff

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=true
go run main.go
```

For more troubleshooting help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

**May the Force be with your API calls!** ⭐
