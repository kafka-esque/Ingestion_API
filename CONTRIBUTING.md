# Contribution Guidelines

---

## 📋 Before Starting

1. Create an issue describing the feature or bug
2. Wait for approval from maintainers
3. Fork the repository
4. Create a feature branch

---

## 🔀 Branch Naming Convention

```
feature/description          # New feature
bugfix/description          # Bug fix
docs/description            # Documentation
refactor/description        # Code refactoring
test/description            # Tests
```

Example:
```bash
git checkout -b feature/kafka-integration
```

---

## 💻 Coding Standards

### Java Code Style
- Use 4 spaces for indentation
- Follow Google Java Style Guide
- Use meaningful variable names
- Add JavaDoc comments for public methods

### Naming Conventions
- Classes: PascalCase (UserService)
- Methods: camelCase (getUserById)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_ATTEMPTS)
- Variables: camelCase (userName)

---

## 📝 Commit Messages

```
type(scope): subject

body

footer
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

**Example:**
```
feat(auth): implement JWT token refresh endpoint

- Add refresh token validation
- Implement token rotation
- Add comprehensive tests

Closes #123
```

---

## ✅ Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] No new warnings from linter
- [ ] Commit messages are clear and descriptive

---

## 🧪 Testing Requirements

- Minimum 80% code coverage
- All critical paths must have tests
- Integration tests for database operations
- Mock external services

---

## 📚 Documentation

- Update README.md for new features
- Add JavaDoc comments
- Update API documentation
- Add examples for complex features

---

## 🚀 Review Process

1. Create Pull Request
2. Wait for automated checks to pass
3. Request review from 2+ maintainers
4. Address feedback
5. Squash commits if needed
6. Merge after approval

---

## 🐛 Bug Report Template

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Java Version: 21
- Spring Boot Version: 3.5.3
- Database: MySQL 8
- OS: [Your OS]

## Logs/Screenshots
[Attach relevant logs or screenshots]
```

---

## 🎯 Feature Request Template

```markdown
## Description
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other possible approaches

## Additional Context
[Any other information]
```

---

## ❓ Questions?

- Check existing issues and discussions
- Create a new discussion
- Contact maintainers

