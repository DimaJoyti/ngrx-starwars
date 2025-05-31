# 🤝 Contributing to Star Wars Character Explorer

Thank you for your interest in contributing to the Star Wars Character Explorer! This document provides guidelines and information for contributors.

## 🌟 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome newcomers and help them learn
- **Be collaborative** - Work together and share knowledge
- **Be constructive** - Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Go 1.21+
- Git
- Basic knowledge of Angular, TypeScript, and Go

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/ngrx-starwars.git
   cd ngrx-starwars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start Go API
   go run main.go
   
   # Terminal 2: Start Angular dev server
   ng serve
   ```

4. **Verify setup**
   - Frontend: http://localhost:4200
   - API: http://localhost:8080/health

## 📝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **New features** - Add new functionality
- 📚 **Documentation** - Improve docs and examples
- 🎨 **UI/UX improvements** - Enhance user experience
- ⚡ **Performance** - Optimize speed and efficiency
- 🧪 **Tests** - Add or improve test coverage
- 🔧 **Tooling** - Improve development workflow

### Contribution Workflow

1. **Check existing issues**
   - Look for existing issues or feature requests
   - Comment on issues you'd like to work on

2. **Create an issue** (for new features)
   - Describe the feature or bug
   - Discuss the approach with maintainers
   - Wait for approval before starting work

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Make your changes**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation as needed

5. **Test your changes**
   ```bash
   # Run tests
   npm test
   
   # Run linting
   npm run lint
   
   # Build the project
   npm run build
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add character search functionality"
   ```

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📋 Coding Standards

### TypeScript/Angular

#### Code Style
```typescript
// Use descriptive names
const handleCharacterSelection = (character: Character) => {
  // Implementation
};

// Use interfaces for type safety
interface CharacterFilter {
  name?: string;
  species?: string[];
  films?: string[];
}

// Use async/await for promises
async loadCharacters(): Promise<Character[]> {
  try {
    const response = await this.http.get<CharactersResponse>(url);
    return response.results;
  } catch (error) {
    this.handleError(error);
    return [];
  }
}
```

#### Component Guidelines
```typescript
@Component({
  selector: 'sw-character-card',  // Use 'sw-' prefix
  standalone: true,               // Use standalone components
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule],
  template: `...`,
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent {
  // Use readonly for inputs when possible
  @Input() readonly character!: Character;
  
  // Use descriptive event names
  @Output() characterSelected = new EventEmitter<Character>();
  
  // Use trackBy for performance
  trackByCharacterId = (index: number, character: Character) => character.url;
}
```

### Go/Backend

#### Code Style
```go
// Use descriptive function names
func GetCharacterByID(c *gin.Context) {
    // Implementation
}

// Use proper error handling
func (s *CharacterService) GetCharacter(id int) (*Character, error) {
    var character Character
    if err := s.db.First(&character, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, ErrCharacterNotFound
        }
        return nil, fmt.Errorf("failed to get character: %w", err)
    }
    return &character, nil
}

// Use context for cancellation
func (s *CharacterService) GetCharactersWithContext(ctx context.Context) ([]Character, error) {
    // Implementation with context
}
```

### SCSS/Styling

```scss
// Use CSS custom properties
.sw-character-card {
  background: var(--sw-surface);
  border: 1px solid var(--sw-primary);
  border-radius: 12px;
  
  // Use BEM methodology
  &__header {
    padding: 16px;
  }
  
  &__title {
    color: var(--sw-text-primary);
    font-family: 'Orbitron', monospace;
  }
  
  // Use responsive design
  @media (max-width: 768px) {
    margin: 8px;
  }
}
```

## 🧪 Testing Guidelines

### Frontend Tests

#### Unit Tests
```typescript
describe('CharacterService', () => {
  let service: CharacterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharacterService]
    });
    service = TestBed.inject(CharacterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch characters', () => {
    const mockCharacters = [{ name: 'Luke Skywalker' }];
    
    service.getCharacters().subscribe(characters => {
      expect(characters).toEqual(mockCharacters);
    });

    const req = httpMock.expectOne('/api/people');
    expect(req.request.method).toBe('GET');
    req.flush({ results: mockCharacters });
  });
});
```

#### Component Tests
```typescript
describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CharacterListComponent]
    });
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
  });

  it('should display characters', () => {
    component.characters = mockCharacters;
    fixture.detectChanges();
    
    const characterCards = fixture.debugElement.queryAll(By.css('.sw-character-card'));
    expect(characterCards.length).toBe(mockCharacters.length);
  });
});
```

### Backend Tests

```go
func TestGetCharacterByID(t *testing.T) {
    // Setup test database
    db := setupTestDB()
    defer db.Close()
    
    // Create test character
    character := &Character{Name: "Luke Skywalker"}
    db.Create(character)
    
    // Test the handler
    router := setupRouter(db)
    req := httptest.NewRequest("GET", "/api/people/1", nil)
    w := httptest.NewRecorder()
    
    router.ServeHTTP(w, req)
    
    assert.Equal(t, http.StatusOK, w.Code)
    
    var response Character
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.Equal(t, "Luke Skywalker", response.Name)
}
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Service for managing Star Wars character data
 * 
 * @example
 * ```typescript
 * const characters = await characterService.getCharacters();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  /**
   * Fetches paginated list of characters
   * 
   * @param page - Page number (1-based)
   * @param limit - Number of characters per page
   * @returns Observable of characters response
   */
  getCharacters(page = 1, limit = 10): Observable<CharactersResponse> {
    // Implementation
  }
}
```

### README Updates

When adding new features, update relevant documentation:

- Update feature list in README.md
- Add usage examples
- Update API documentation
- Add screenshots if UI changes

## 🔍 Pull Request Guidelines

### PR Title Format

Use conventional commit format:
- `feat: add character search functionality`
- `fix: resolve pagination bug`
- `docs: update API documentation`
- `style: improve character card design`
- `refactor: optimize character service`
- `test: add character service tests`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** - CI/CD pipeline runs
2. **Code review** - Maintainer reviews code
3. **Testing** - Manual testing if needed
4. **Approval** - PR approved by maintainer
5. **Merge** - Changes merged to main branch

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js: [e.g., 18.0.0]

**Screenshots**
Add screenshots if applicable
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

## 📞 Getting Help

- **Discord**: Join our community server
- **GitHub Issues**: Ask questions in issues
- **Email**: contact@starwars-explorer.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Star Wars Character Explorer! May the Force be with you! ⭐
