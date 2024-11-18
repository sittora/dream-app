import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  API_URL: z.string().url(),
  APP_NAME: z.string().min(1),
  APP_VERSION: z.string().min(1),
  ENV: z.enum(['development', 'production', 'test']),
  MFA_ENABLED: z.boolean(),
  ANALYTICS_ENABLED: z.boolean(),
});

const parseEnvVars = () => {
  const env = {
    JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'default_secret_key',
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Anima Insights',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENV: import.meta.env.VITE_ENV || 'development',
    MFA_ENABLED: import.meta.env.VITE_MFA_ENABLED === 'true',
    ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  };

  return envSchema.parse(env);
};

export const env = parseEnvVars();