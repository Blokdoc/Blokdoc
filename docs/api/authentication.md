# API Authentication

This document outlines the authentication methods used to secure the Blokdoc API.

## Authentication Methods

Blokdoc supports the following authentication methods:

1. **JWT Bearer Token** - Standard token-based authentication
2. **Wallet Signature** - Cryptographic authentication using Solana wallets
3. **API Keys** - For server-to-server integration

## JWT Bearer Token

Most API endpoints require a valid JWT token, which can be obtained by authenticating through the `/auth/login` endpoint.

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2023-08-01T00:00:00.000Z"
  }
}
```

### Using the Token

Include the token in the `Authorization` header for subsequent requests:

```http
GET /api/documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

Tokens are valid for 24 hours by default. To refresh a token before it expires, use the `/auth/refresh` endpoint:

```http
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Wallet Signature Authentication

For blockchain-related operations, you can authenticate using your Solana wallet.

### 1. Request Challenge

```http
GET /api/auth/wallet/challenge?address=<your_wallet_address>
```

### 2. Sign Challenge

The response will contain a challenge string that needs to be signed with your wallet:

```json
{
  "challenge": "Sign this message to authenticate with Blokdoc: 123456789"
}
```

### 3. Submit Signature

```http
POST /api/auth/wallet/verify
Content-Type: application/json

{
  "address": "your_wallet_address",
  "signature": "signed_challenge_data",
  "challenge": "challenge_from_step_1"
}
```

### 4. Receive Token

The response will include a JWT token that can be used as described above.

## API Keys

For server-to-server integration, API keys provide a simpler authentication method.

### Creating an API Key

API keys can be created in the developer settings section of your account.

### Using an API Key

Include the API key in the `X-API-Key` header:

```http
GET /api/documents
X-API-Key: your_api_key
```

### API Key Permissions

API keys can have granular permissions:
- `read:documents` - Read-only access to documents
- `write:documents` - Create and update documents
- `delete:documents` - Delete documents
- `admin:documents` - Full administrative access

## Security Recommendations

1. **Never share your JWT tokens or API keys**
2. **Store API keys securely** - Never commit them to code repositories
3. **Rotate API keys regularly** - We recommend every 90 days
4. **Use HTTPS for all API calls** - Non-HTTPS calls will be rejected
5. **Implement proper error handling** - Handle 401/403 responses appropriately

## Troubleshooting

### Common Authentication Errors

| HTTP Status | Error Code | Description | Solution |
|-------------|------------|-------------|----------|
| 401 | `token_expired` | JWT token has expired | Refresh the token |
| 401 | `invalid_token` | Token is invalid or malformed | Re-authenticate |
| 403 | `insufficient_scope` | Token lacks required permissions | Request proper permissions |
| 403 | `ip_restricted` | API key used from unauthorized IP | Use from approved IP or update restrictions |

### Support

If you continue to experience authentication issues, please contact our support team at api-support@blokdoc.io. 