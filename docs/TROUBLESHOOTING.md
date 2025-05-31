# 🔧 Troubleshooting Guide

This guide helps you resolve common issues with the Star Wars Character Explorer.

## 🚨 Common Issues

### Frontend Issues

#### 1. Application Won't Start

**Error**: `ng serve` fails to start

**Symptoms**:
```bash
Error: Cannot find module '@angular/core'
```

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (requires 18+)
node --version

# Update Angular CLI
npm install -g @angular/cli@latest
```

#### 2. Build Failures

**Error**: TypeScript compilation errors

**Symptoms**:
```bash
Error: TS2307: Cannot find module './character.model'
```

**Solutions**:
```bash
# Check file paths and imports
# Ensure all imports use correct relative paths

# Clear TypeScript cache
rm -rf .angular/cache
ng build

# Check tsconfig.json configuration
```

#### 3. API Connection Issues

**Error**: Characters not loading

**Symptoms**:
- Empty character list
- Loading spinner never stops
- Console errors about CORS

**Solutions**:
```typescript
// Check API URL in environment files
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // Verify this URL
};

// Check browser console for CORS errors
// Ensure Go API server is running on port 8080
```

#### 4. Styling Issues

**Error**: Styles not applying correctly

**Symptoms**:
- Missing Star Wars theme
- Broken layouts
- CSS variables not working

**Solutions**:
```scss
// Check if CSS custom properties are supported
// Verify styles.scss is imported correctly

// Clear browser cache
// Hard refresh (Ctrl+F5 or Cmd+Shift+R)

// Check for CSS conflicts in browser dev tools
```

### Backend Issues

#### 1. Go Server Won't Start

**Error**: `go run main.go` fails

**Symptoms**:
```bash
go: cannot find main module
```

**Solutions**:
```bash
# Initialize Go module
go mod init starwars-api
go mod tidy

# Check Go version (requires 1.21+)
go version

# Install dependencies
go mod download
```

#### 2. Database Issues

**Error**: SQLite database errors

**Symptoms**:
```bash
Error: database is locked
Error: no such table: characters
```

**Solutions**:
```bash
# Check database file permissions
ls -la starwars.db

# Recreate database
rm starwars.db
go run main.go  # Will recreate and seed database

# Check SQLite installation
sqlite3 --version
```

#### 3. CORS Errors

**Error**: Cross-origin requests blocked

**Symptoms**:
```bash
Access to fetch at 'http://localhost:8080/api/people' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solutions**:
```go
// Verify CORS middleware in main.go
router.Use(middleware.SetupCORS())

// Check CORS configuration
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

#### 4. Port Conflicts

**Error**: Port already in use

**Symptoms**:
```bash
Error: listen tcp :8080: bind: address already in use
```

**Solutions**:
```bash
# Find process using port 8080
lsof -i :8080
# or
netstat -tulpn | grep :8080

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=8081
go run main.go
```

## 🔍 Debugging Steps

### Frontend Debugging

#### 1. Browser Developer Tools

```javascript
// Check console for errors
console.log('Debug info:', data);

// Check network tab for API calls
// Look for failed requests (red status codes)

// Check application tab for local storage/session storage
```

#### 2. Angular DevTools

```bash
# Install Angular DevTools browser extension
# Use to inspect component state and NgRx store

# Check component inputs/outputs
# Verify NgRx actions and state changes
```

#### 3. Network Issues

```bash
# Test API endpoints directly
curl http://localhost:8080/api/people
curl http://localhost:8080/health

# Check if API server is running
ps aux | grep main

# Verify network connectivity
ping localhost
```

### Backend Debugging

#### 1. Logging

```go
// Add debug logging
log.Printf("Received request: %s %s", c.Request.Method, c.Request.URL.Path)

// Log database queries
db.LogMode(true)

// Check application logs
tail -f /var/log/starwars-api.log
```

#### 2. Database Debugging

```bash
# Connect to SQLite database
sqlite3 starwars.db

# Check tables
.tables

# Query data
SELECT * FROM characters LIMIT 5;

# Check database schema
.schema characters
```

## 🛠️ Performance Issues

### Slow Loading

**Symptoms**:
- Characters take long time to load
- UI feels sluggish
- High memory usage

**Solutions**:

#### Frontend Optimizations
```typescript
// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Implement trackBy functions
trackByCharacterId = (index: number, character: Character) => character.url;

// Use async pipe instead of manual subscriptions
// Lazy load feature modules
```

#### Backend Optimizations
```go
// Add database indexes
db.Model(&Character{}).AddIndex("idx_name", "name")

// Implement caching
cache := make(map[string]interface{})

// Use connection pooling
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
```

### Memory Leaks

**Symptoms**:
- Browser tab uses increasing memory
- Application becomes unresponsive

**Solutions**:
```typescript
// Unsubscribe from observables
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Use takeUntil pattern
this.characterService.getCharacters()
  .pipe(takeUntil(this.destroy$))
  .subscribe(characters => {
    // Handle characters
  });
```

## 🔒 Security Issues

### API Security

```go
// Implement rate limiting
rateLimiter := middleware.NewRateLimiter(100, time.Minute)
router.Use(middleware.RateLimit(rateLimiter))

// Validate input parameters
func validateID(id string) error {
    if _, err := strconv.Atoi(id); err != nil {
        return errors.New("invalid ID format")
    }
    return nil
}

// Sanitize database queries (GORM handles this automatically)
```

### Frontend Security

```typescript
// Sanitize user inputs
import { DomSanitizer } from '@angular/platform-browser';

// Use HTTPS in production
export const environment = {
  production: true,
  apiUrl: 'https://api.starwars-explorer.com'
};
```

## 📱 Mobile Issues

### Responsive Design Problems

**Symptoms**:
- Layout breaks on mobile
- Touch interactions don't work
- Text too small to read

**Solutions**:
```scss
// Use proper viewport meta tag
<meta name="viewport" content="width=device-width, initial-scale=1">

// Implement responsive breakpoints
@media (max-width: 768px) {
  .sw-character-card {
    margin: 8px;
    font-size: 0.9rem;
  }
}

// Use touch-friendly button sizes
.sw-button {
  min-height: 44px;  // iOS recommendation
  min-width: 44px;
}
```

## 🧪 Testing Issues

### Unit Test Failures

```typescript
// Mock HTTP requests
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule]
  });
});

// Mock external dependencies
const mockCharacterService = jasmine.createSpyObj('CharacterService', ['getCharacters']);

// Handle async operations
it('should load characters', fakeAsync(() => {
  component.loadCharacters();
  tick();
  expect(component.characters.length).toBeGreaterThan(0);
}));
```

### E2E Test Issues

```typescript
// Wait for elements to load
await page.waitForSelector('.sw-character-card');

// Handle dynamic content
await page.waitForFunction(() => 
  document.querySelectorAll('.sw-character-card').length > 0
);
```

## 📞 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing GitHub issues**
3. **Check browser console for errors**
4. **Verify all prerequisites are met**
5. **Try reproducing in a clean environment**

### How to Report Issues

Include the following information:

```markdown
**Environment**
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96]
- Node.js: [e.g., 18.0.0]
- Angular CLI: [e.g., 15.0.0]
- Go: [e.g., 1.21.0]

**Steps to Reproduce**
1. Start the application
2. Navigate to character list
3. Click on a character
4. See error

**Expected Behavior**
Character details should load

**Actual Behavior**
Error message appears

**Console Errors**
```
Paste any console errors here
```

**Additional Context**
Any other relevant information
```

### Support Channels

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and community help
- **Discord**: Real-time community support
- **Email**: For security issues

## 🔄 Recovery Procedures

### Reset to Clean State

```bash
# Frontend reset
rm -rf node_modules package-lock.json .angular
npm install
ng serve

# Backend reset
rm starwars.db
go clean -cache
go mod tidy
go run main.go

# Git reset (if needed)
git stash
git checkout main
git pull origin main
```

### Backup and Restore

```bash
# Backup database
cp starwars.db starwars.db.backup

# Restore database
cp starwars.db.backup starwars.db

# Backup configuration
cp -r src/environments src/environments.backup
```

Remember: When in doubt, check the logs and start with the simplest solution first! 🚀
