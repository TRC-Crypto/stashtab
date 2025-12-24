/**
 * OpenAPI 3.1 Specification for Stashtab API
 *
 * This is a manually maintained spec that provides comprehensive documentation
 * while avoiding the strict typing issues with @hono/zod-openapi.
 */

export const openAPISpec = {
  openapi: '3.1.0',
  info: {
    title: 'Stashtab API',
    version: '0.1.0',
    description: `# Stashtab Neobank API

RESTful API for the Stashtab DeFi neobank platform.

## Authentication

All authenticated endpoints require a Privy JWT token passed in the Authorization header:

\`\`\`
Authorization: Bearer <privy-token>
\`\`\`

## Rate Limiting

Rate limits are applied per-user for authenticated endpoints and per-IP for public endpoints.

| Endpoint Type | Limit |
|--------------|-------|
| Public (yield) | 30/min |
| Standard (read) | 60/min |
| Strict (write) | 10/min |

Rate limit headers are included in all responses:
- \`X-RateLimit-Limit\`: Maximum requests per window
- \`X-RateLimit-Remaining\`: Remaining requests in window
- \`X-RateLimit-Reset\`: Unix timestamp when window resets

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "requestId": "uuid"
}
\`\`\`

The \`requestId\` can be used when contacting support.`,
    contact: {
      name: 'Stashtab',
      url: 'https://github.com/TRC-Crypto/stashtab',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:8787',
      description: 'Local development',
    },
    // Add your production server URL when deploying:
    // {
    //   url: 'https://your-api-domain.com',
    //   description: 'Production',
    // },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and account creation',
    },
    {
      name: 'Account',
      description: 'Account management, balances, and transactions',
    },
    {
      name: 'Yield',
      description: 'Yield rates and historical data',
    },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Create user account',
        description:
          'Verify Privy authentication token and create a new user account with a predicted Safe address. If the user already exists, returns existing account info.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Account created or already exists',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Account created' },
                    userId: { type: 'string', format: 'uuid' },
                    safeAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
                    ownerAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
                  },
                  required: ['message', 'userId', 'safeAddress'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/account': {
      get: {
        tags: ['Account'],
        summary: 'Get account information',
        description: 'Retrieve full account information including balances and yield rates.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Account information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AccountResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/account/balance': {
      get: {
        tags: ['Account'],
        summary: 'Get balance only',
        description: 'Retrieve current balance and yield rate (lighter endpoint for refreshing).',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Balance information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BalanceResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/account/send': {
      post: {
        tags: ['Account'],
        summary: 'Send USDC',
        description: 'Send USDC to another address (internal or external).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Transfer initiated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInitiated' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '422': { $ref: '#/components/responses/UnprocessableEntity' },
        },
      },
    },
    '/account/withdraw': {
      post: {
        tags: ['Account'],
        summary: 'Withdraw USDC',
        description: 'Withdraw USDC from Aave to an external address.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WithdrawRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Withdrawal initiated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInitiated' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '422': { $ref: '#/components/responses/UnprocessableEntity' },
        },
      },
    },
    '/account/deposit': {
      post: {
        tags: ['Account'],
        summary: 'Deposit to yield',
        description: 'Trigger deposit of USDC from Safe to Aave for yield earning.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: {
                    type: 'string',
                    description: 'Amount to deposit (optional, defaults to full balance)',
                    pattern: '^\\d+$',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Deposit initiated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInitiated' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/yield/rate': {
      get: {
        tags: ['Yield'],
        summary: 'Get current yield rate',
        description: 'Get the current Aave supply APY for USDC. Results are cached for 60 seconds.',
        responses: {
          '200': {
            description: 'Current yield rate',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/YieldRateResponse' },
              },
            },
          },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/yield/history': {
      get: {
        tags: ['Yield'],
        summary: 'Get historical yield data',
        description: 'Get historical APY data over time (placeholder - not yet implemented).',
        parameters: [
          {
            name: 'period',
            in: 'query',
            description: 'Time period for historical data',
            schema: {
              type: 'string',
              enum: ['1d', '7d', '30d', '90d'],
              default: '7d',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Historical yield data (placeholder)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    note: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Privy authentication token',
      },
    },
    schemas: {
      Balance: {
        type: 'object',
        properties: {
          safeBalance: { type: 'string', description: 'USDC balance in Safe (raw units)' },
          aaveBalance: { type: 'string', description: 'aUSDC balance in Aave (raw units)' },
          totalBalance: { type: 'string', description: 'Total balance (raw units)' },
          totalDeposited: { type: 'string', description: 'Total amount deposited (raw units)' },
          yieldEarned: { type: 'string', description: 'Yield earned from Aave (raw units)' },
        },
        required: ['safeBalance', 'aaveBalance', 'totalBalance', 'totalDeposited', 'yieldEarned'],
      },
      YieldRate: {
        type: 'object',
        properties: {
          apyPercent: { type: 'number', description: 'Current APY as percentage (e.g., 5.24)' },
          liquidityRate: { type: 'string', description: 'Raw liquidity rate from Aave' },
          lastUpdated: { type: 'integer', description: 'Unix timestamp of last update' },
        },
        required: ['apyPercent', 'liquidityRate', 'lastUpdated'],
      },
      AccountResponse: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          safeAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          ownerAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          balance: { $ref: '#/components/schemas/Balance' },
          yieldRate: { $ref: '#/components/schemas/YieldRate' },
        },
        required: ['userId', 'safeAddress', 'ownerAddress', 'balance', 'yieldRate'],
      },
      BalanceResponse: {
        type: 'object',
        properties: {
          balance: { $ref: '#/components/schemas/Balance' },
          yieldRate: { $ref: '#/components/schemas/YieldRate' },
        },
        required: ['balance', 'yieldRate'],
      },
      SendRequest: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Recipient Ethereum address',
          },
          amount: {
            type: 'string',
            pattern: '^\\d+$',
            description: 'Amount to send in raw USDC units (6 decimals)',
          },
        },
        required: ['to', 'amount'],
      },
      WithdrawRequest: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Destination Ethereum address',
          },
          amount: {
            type: 'string',
            pattern: '^\\d+$',
            description: 'Amount to withdraw in raw USDC units (6 decimals)',
          },
        },
        required: ['to', 'amount'],
      },
      TransactionInitiated: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
          to: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          amount: { type: 'string' },
          txHash: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['message', 'status'],
      },
      YieldRateResponse: {
        type: 'object',
        properties: {
          asset: { type: 'string', example: 'USDC' },
          chainId: { type: 'integer', example: 84532 },
          apyPercent: { type: 'number', example: 5.24 },
          liquidityRate: { type: 'string' },
          liquidityIndex: { type: 'string' },
          lastUpdated: { type: 'integer' },
          aTokenAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          poolAddress: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
        },
        required: [
          'asset',
          'chainId',
          'apyPercent',
          'liquidityRate',
          'liquidityIndex',
          'lastUpdated',
          'aTokenAddress',
          'poolAddress',
        ],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
            required: ['code', 'message'],
          },
          requestId: { type: 'string' },
        },
        required: ['error'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request - validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                code: 'VALIDATION_FAILED',
                message: 'Invalid request body',
                details: { field: 'amount', issue: 'Must be a positive integer' },
              },
              requestId: 'abc-123',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - invalid or missing token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                code: 'AUTH_INVALID_TOKEN',
                message: 'Invalid or expired authentication token',
              },
              requestId: 'abc-123',
            },
          },
        },
      },
      RateLimited: {
        description: 'Too many requests',
        headers: {
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Seconds to wait before retrying',
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded. Try again in 30 seconds',
              },
              requestId: 'abc-123',
            },
          },
        },
      },
      UnprocessableEntity: {
        description: 'Unprocessable entity - business logic error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                code: 'INSUFFICIENT_FUNDS',
                message: 'Insufficient funds for this operation',
                details: { required: '1000000', available: '500000' },
              },
              requestId: 'abc-123',
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
              },
              requestId: 'abc-123',
            },
          },
        },
      },
    },
  },
};
