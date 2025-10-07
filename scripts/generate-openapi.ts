#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

import { loginRequestSchema, registerRequestSchema, refreshRequestSchema, loginResponseSchema, registerResponseSchema, refreshResponseSchema } from '../src/api/schemas/auth.js';

extendZodWithOpenApi(z);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.resolve(__dirname, '../docs/openapi.yaml');
let base: any;
if (fs.existsSync(specPath)) {
  const raw = fs.readFileSync(specPath, 'utf-8');
  base = YAML.parse(raw);
} else {
  base = {
    openapi: '3.1.0',
    info: { title: 'dream-app', version: '0.1.0' },
    paths: {},
    components: { schemas: {}, securitySchemes: {} },
    tags: [
      { name: 'System', description: 'System and infrastructure endpoints' },
      { name: 'Auth', description: 'Authentication and identity endpoints' }
    ]
  };
}

// Ensure structure
base.paths ||= {};
base.components ||= {}; base.components.schemas ||= {};
base.tags = base.tags || [ { name: 'System' }, { name: 'Auth' } ];

const registry = new OpenAPIRegistry();

// Register request/response components
registry.register('LoginRequest', loginRequestSchema);
registry.register('RegisterRequest', registerRequestSchema);
registry.register('RefreshRequest', refreshRequestSchema);
registry.register('LoginResponse', loginResponseSchema);
registry.register('RegisterResponse', registerResponseSchema);
registry.register('RefreshResponse', refreshResponseSchema);

// Helper to add or merge a path without clobbering non-auth routes
function mergePath(pathKey: string, method: string, operation: any) {
  base.paths[pathKey] = base.paths[pathKey] || {};
  // Do not overwrite existing non-auth operations
  base.paths[pathKey][method] = operation;
}

// Define auth operations (minimal, additive)
mergePath('/api/auth/login', 'post', {
  tags: ['Auth'],
  operationId: 'postAuthLogin',
  summary: 'Authenticate user and issue tokens',
  requestBody: {
    required: true,
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
    }
  },
  responses: {
    '200': { description: 'Login success', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
    '400': { description: 'Validation or credential error' },
    '401': { description: 'Invalid credentials' }
  }
});

mergePath('/api/auth/register', 'post', {
  tags: ['Auth'],
  operationId: 'postAuthRegister',
  summary: 'Register new user',
  requestBody: {
    required: true,
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
    }
  },
  responses: {
    '201': { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } } },
    '400': { description: 'Validation error' },
    '409': { description: 'Email already registered' }
  }
});

mergePath('/api/auth/refresh', 'post', {
  tags: ['Auth'],
  operationId: 'postAuthRefresh',
  summary: 'Refresh access token',
  requestBody: {
    required: false,
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } }
    }
  },
  responses: {
    '200': { description: 'Token refreshed', content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshResponse' } } } },
    '401': { description: 'Invalid or expired refresh token' }
  }
});

// Generate components document from registry
const generator = new OpenApiGeneratorV3(registry.definitions);
const registryDoc = generator.generateDocument({
  openapi: base.openapi || '3.1.0',
  info: base.info,
  servers: base.servers,
});

// Merge schemas (auth overrides win if conflict)
registryDoc.components = registryDoc.components || { schemas: {} };
const authSchemas = registryDoc.components.schemas || {};
base.components.schemas = { ...(base.components.schemas || {}), ...authSchemas };

// Write merged YAML
const finalYaml = YAML.stringify(base);
fs.writeFileSync(specPath, finalYaml, 'utf-8');

console.log(`OpenAPI auth paths merged into ${specPath}`);
