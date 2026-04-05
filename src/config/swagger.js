const env = require('./env');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: env.APP_NAME,
    version: '1.0.0',
    description: 'Production-style finance dashboard backend with JWT auth, refresh token rotation, RBAC, soft delete, aggregated dashboard analytics, and unit tests.'
  },
  servers: [
    { url: env.SWAGGER_SERVER_URL + env.API_PREFIX, description: 'API server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      FinanceRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          amount: { type: 'number' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', nullable: true },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          accessTokenExpiresIn: { type: 'string', example: '15m' },
          refreshTokenExpiresIn: { type: 'string', example: '7d' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } }
        }
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totals: {
            type: 'object',
            properties: {
              totalIncome: { type: 'number' },
              totalExpense: { type: 'number' },
              netBalance: { type: 'number' },
              recordsCount: { type: 'number' }
            }
          },
          categoryTotals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                type: { type: 'string' },
                total: { type: 'number' },
                count: { type: 'number' }
              }
            }
          },
          monthlyTrends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                income: { type: 'number' },
                expense: { type: 'number' },
                net: { type: 'number' }
              }
            }
          },
          recentActivity: {
            type: 'array',
            items: { '$ref': '#/components/schemas/FinanceRecord' }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'API is healthy' } }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Registered successfully' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login and receive access/refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Logged in successfully' } }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue a new token pair',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { '200': { description: 'Tokens rotated successfully' } }
      }
    },
    '/auth/logout': {
      post: {
        summary: 'Revoke the current refresh session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { '200': { description: 'Logged out successfully' } }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Current user returned' } }
      }
    },
    '/auth/logout-all': {
      post: {
        summary: 'Revoke all active refresh sessions for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All sessions revoked successfully' } }
      }
    },
    '/users': {
      get: {
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Users returned' } }
      },
      post: {
        summary: 'Create a user as admin',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'User created' } }
      }
    },
    '/users/{id}': {
      get: {
        summary: 'Get a user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User returned' } }
      },
      patch: {
        summary: 'Update user profile, role, status, or password',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User updated' } }
      }
    },
    '/users/{id}/status': {
      patch: {
        summary: 'Update user status only',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Status updated' } }
      }
    },
    '/records': {
      get: {
        summary: 'List finance records with filters and pagination',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Records returned' } }
      },
      post: {
        summary: 'Create a finance record',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Record created' } }
      }
    },
    '/records/{id}': {
      get: {
        summary: 'Get a finance record by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Record returned' } }
      },
      patch: {
        summary: 'Update a finance record',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Record updated' } }
      },
      delete: {
        summary: 'Soft delete a finance record',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Record soft deleted' } }
      }
    },
    '/dashboard/summary': {
      get: {
        summary: 'Get totals, category totals, monthly trends, and recent activity',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dashboard summary returned',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/DashboardSummary' }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
