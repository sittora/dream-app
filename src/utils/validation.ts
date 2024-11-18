import { z } from 'zod';
import { logger } from '../services/logger';

// Common validation schemas
export const userProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  socialLinks: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional(),
    instagram: z.string().url('Invalid Instagram URL').optional(),
    website: z.string().url('Invalid website URL').optional(),
  }).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['en', 'es', 'fr', 'de']),
  timezone: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    dreamReminders: z.boolean(),
    analysisUpdates: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']),
    dreamSharingDefault: z.enum(['public', 'private', 'friends']),
    showOnlineStatus: z.boolean(),
  }),
});

// Validation wrapper that includes logging
export async function validateData<T>(
  schema: z.Schema<T>,
  data: unknown,
  context: string
): Promise<z.infer<typeof schema>> {
  try {
    const validatedData = await schema.parseAsync(data);
    logger.debug('Data validation successful', {
      context,
      dataKeys: Object.keys(data as object),
    });
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation failed', {
        context,
        errors: error.errors,
        data,
      });
      
      // Format error messages for user display
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError(
        'Validation failed',
        formattedErrors,
        context
      );
    }
    throw error;
  }
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{ field: string; message: string }>,
    public readonly context: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// File validation
export const fileValidation = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    validateType: (type: string): boolean => 
      fileValidation.image.allowedTypes.includes(type),
    validateSize: (size: number): boolean => 
      size <= fileValidation.image.maxSize,
  },
  export: {
    validateExportData: (data: unknown): boolean => {
      try {
        // Basic structure validation for exported data
        const schema = z.object({
          user: z.object({}).passthrough(),
          dreams: z.array(z.object({}).passthrough()),
          analyses: z.array(z.object({}).passthrough()),
          exportedAt: z.string().datetime(),
        });
        schema.parse(data);
        return true;
      } catch {
        return false;
      }
    },
  },
};

// Resource cleanup validation
export const validateResourceCleanup = async (
  resources: Array<{ type: string; id: string }>,
  context: string
): Promise<void> => {
  const failedCleanups: Array<{ type: string; id: string; error: string }> = [];

  for (const resource of resources) {
    try {
      await validateResourceExists(resource);
    } catch (error) {
      failedCleanups.push({
        type: resource.type,
        id: resource.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (failedCleanups.length > 0) {
    logger.error('Resource cleanup validation failed', {
      context,
      failedCleanups,
    });
    throw new ValidationError(
      'Resource cleanup validation failed',
      failedCleanups.map(f => ({
        field: `${f.type}:${f.id}`,
        message: f.error,
      })),
      context
    );
  }
};

async function validateResourceExists(
  resource: { type: string; id: string }
): Promise<void> {
  // Implement resource existence check
  // This would typically make API calls to verify the resource exists
  // For now, we'll just log the attempt
  logger.debug('Validating resource exists', { resource });
}

// Helper function to create validation context
export const createValidationContext = (operation: string) => ({
  validate: <T>(schema: z.Schema<T>, data: unknown) =>
    validateData(schema, data, operation),
});
