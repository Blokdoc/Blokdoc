# Blokdoc Testing Suite

This directory contains tests for the Blokdoc application. The tests are organized by type and component.

## Test Structure

- `unit/` - Unit tests for individual functions and components
- `integration/` - Integration tests for API endpoints and services
- `e2e/` - End-to-end tests for user workflows
- `blockchain/` - Tests for blockchain integration
- `utils/` - Test utilities and helpers

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:blockchain

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual functions and components in isolation. Use mocks for external dependencies.

Example:

```typescript
import { validateDocument } from '../src/services/document/validation';

describe('Document Validation', () => {
  test('should validate a valid document', () => {
    const validDocument = {
      name: 'test-document.pdf',
      size: 1024,
      type: 'application/pdf'
    };
    
    const result = validateDocument(validDocument);
    expect(result.valid).toBe(true);
  });
  
  test('should reject an oversized document', () => {
    const oversizedDocument = {
      name: 'large-document.pdf',
      size: 100 * 1024 * 1024, // 100MB
      type: 'application/pdf'
    };
    
    const result = validateDocument(oversizedDocument);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('size exceeds');
  });
});
```

### Integration Tests

Integration tests should focus on testing the interaction between multiple components or services.

### End-to-End Tests

End-to-end tests should simulate user interactions to verify complete workflows.

## Test Coverage

We aim for at least 80% test coverage for critical components. Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Continuous Integration

Tests are automatically run on every pull request and push to the main branch using GitHub Actions. 