# Implementation: Issue #227 - Add Organization Management BFF Routes

## Overview

Added input validation to existing PATCH methods in organization management BFF routes using Zod schemas.

## Files Changed

### Created Files

1. **`/src/lib/organizations/validations.ts`**
   - Created Zod validation schemas for organization updates
   - `updateOrganizationSchema`: Validates organization fields (name, colors, email, website)
   - `updateOrganizationSettingsSchema`: Validates settings object
   - Includes TypeScript type exports

2. **`/src/lib/organizations/validations.test.ts`**
   - Comprehensive test suite with 28 test cases
   - Tests all validation rules and edge cases
   - 100% test coverage for validation logic

### Modified Files

3. **`/src/app/api/organizations/current/route.ts`**
   - Added Zod validation to existing PATCH method
   - Validates request body before proxying to backend
   - Returns structured error responses (400) for invalid inputs
   - Maintains existing GET method functionality

4. **`/src/app/api/organizations/settings/route.ts`**
   - Added Zod validation to existing PATCH method
   - Validates settings object structure
   - Returns structured error responses (400) for invalid inputs
   - Maintains existing GET method functionality

## Validation Rules

### Organization Update (`/api/organizations/current`)

- **name**: 1-100 characters (optional)
- **primary_color**: Valid hex color (#FFF or #FFFFFF format) (optional)
- **secondary_color**: Valid hex color (#FFF or #FFFFFF format) (optional)
- **email**: Valid email format, max 255 characters (optional)
- **website**: Valid HTTP/HTTPS URL (optional)

### Organization Settings (`/api/organizations/settings`)

- Accepts any JSON object with string keys
- Detailed validation delegated to backend

## Error Response Format

When validation fails, the API returns a 400 status with:

```json
{
  "detail": "Invalid input data",
  "errors": [
    {
      "field": "primary_color",
      "message": "Cor primária deve ser uma cor hexadecimal válida (ex: #FF5733)"
    }
  ]
}
```

## Example Usage

### Valid Request

```typescript
// PATCH /api/organizations/current
{
  "name": "Acme Corp",
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "email": "contact@acme.com",
  "website": "https://acme.com"
}
```

### Invalid Request

```typescript
// PATCH /api/organizations/current
{
  "name": "",  // Invalid: empty
  "primary_color": "red",  // Invalid: not hex
  "email": "not-an-email",  // Invalid: format
  "website": "ftp://example.com"  // Invalid: protocol
}

// Response: 400 Bad Request
{
  "detail": "Invalid input data",
  "errors": [
    { "field": "name", "message": "Nome da organização é obrigatório" },
    { "field": "primary_color", "message": "Cor primária deve ser uma cor hexadecimal válida (ex: #FF5733)" },
    { "field": "email", "message": "Email inválido" },
    { "field": "website", "message": "Website deve usar protocolo HTTP ou HTTPS" }
  ]
}
```

## Testing

All tests pass successfully:

```bash
npm run test:run -- src/lib/organizations/validations.test.ts

✓ 28 tests passed
```

Test coverage includes:

- Valid inputs for all fields
- Invalid inputs for all fields
- Edge cases (min/max lengths, case sensitivity)
- Multiple validation errors
- Empty/optional fields

## Quality Checks

✅ TypeScript compilation: PASSED
✅ ESLint: PASSED (no warnings or errors)
✅ Unit tests: PASSED (28/28)
✅ Follows existing code patterns
✅ Proper error handling
✅ Type safety maintained

## Integration Points

These BFF routes proxy to the backend API:

- Frontend: `PATCH /api/organizations/current`
- Backend: `PATCH ${BACKEND_URL}/api/v1/organizations/current`

- Frontend: `PATCH /api/organizations/settings`
- Backend: `PATCH ${BACKEND_URL}/api/v1/organizations/current/settings`

## Notes

- Validation happens at the BFF layer before reaching the backend
- Backend validation still applies (defense in depth)
- Error messages are in Portuguese (BR) per project standards
- All fields are optional in the update schema (partial updates supported)
- Uses Zod v4.2.1 API (`z.output`, `z.record(key, value)`, `issues` property)
