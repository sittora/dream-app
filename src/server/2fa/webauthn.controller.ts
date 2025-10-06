import { Request, Response } from 'express';
import pino from 'pino';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import {
  webauthnRegisterOptionsSchema,
  webauthnRegisterVerifySchema,
  webauthnLoginOptionsSchema,
  webauthnLoginVerifySchema,
} from './validators.js';

// Create logger instance
const logger = pino({
  name: 'webauthn-controller',
  level: process.env.LOG_LEVEL || 'info',
});

// WebAuthn configuration
const WEBAUTHN_CONFIG = {
  rpName: process.env.VITE_APP_NAME || 'Anima Insights',
  rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
  origin: process.env.BASE_URL || 'http://localhost:3000',
  enableWebAuthn: process.env.ENABLE_WEBAUTHN === 'true',
} as const;

// TODO: Replace with actual database implementation
interface WebAuthnCredential {
  id: string;
  userId: string;
  credentialID: string;
  credentialPublicKey: Buffer;
  counter: number;
  transports?: AuthenticatorTransport[];
  authenticatorName?: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

interface WebAuthnChallenge {
  id: string;
  userId?: string;
  challenge: string;
  type: 'registration' | 'authentication';
  expiresAt: Date;
}

class WebAuthnDatabase {
  async createCredential(credential: Omit<WebAuthnCredential, 'id' | 'createdAt'>): Promise<WebAuthnCredential> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement createCredential with existing database layer');
    return {
      ...credential,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
  }

  async findCredentialsByUserId(userId: string): Promise<WebAuthnCredential[]> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement findCredentialsByUserId with existing database layer');
    return [];
  }

  async findCredentialById(credentialID: string): Promise<WebAuthnCredential | null> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement findCredentialById with existing database layer');
    return null;
  }

  async updateCredentialCounter(credentialID: string, counter: number): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement updateCredentialCounter with existing database layer');
  }

  async deleteCredential(id: string): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement deleteCredential with existing database layer');
  }

  async storeChallenge(challenge: Omit<WebAuthnChallenge, 'id'>): Promise<string> {
    // TODO: Implement with existing database layer (or Redis for temporary storage)
    const challengeId = crypto.randomUUID();
    logger.warn('TODO: Implement storeChallenge with existing database layer');
    return challengeId;
  }

  async getChallenge(challengeId: string): Promise<WebAuthnChallenge | null> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement getChallenge with existing database layer');
    return null;
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    // TODO: Implement with existing database layer
    logger.warn('TODO: Implement deleteChallenge with existing database layer');
  }
}

const webauthnDb = new WebAuthnDatabase();

/**
 * Check if WebAuthn is enabled
 */
function checkWebAuthnEnabled(res: Response): boolean {
  if (!WEBAUTHN_CONFIG.enableWebAuthn) {
    res.status(404).json({
      error: 'WebAuthn not enabled',
      details: 'WebAuthn functionality is not enabled on this server',
    });
    return false;
  }
  return true;
}

/**
 * Generate registration options for WebAuthn credential
 */
export async function generateWebAuthnRegistrationOptions(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = webauthnRegisterOptionsSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    // Get existing credentials for this user
    const existingCredentials = await webauthnDb.findCredentialsByUserId(userId);

    const options: GenerateRegistrationOptionsOpts = {
      rpName: WEBAUTHN_CONFIG.rpName,
      rpID: WEBAUTHN_CONFIG.rpID,
      userID: new TextEncoder().encode(userId),
      userName: req.user?.email || `user-${userId}`,
      userDisplayName: req.user?.displayName || req.user?.email || `User ${userId}`,
      // Prevent re-registration of existing credentials
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform', // Allow external authenticators
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      attestationType: 'none',
    };

    const registrationOptions = await generateRegistrationOptions(options);

    // Store challenge
    const challengeId = await webauthnDb.storeChallenge({
      userId,
      challenge: registrationOptions.challenge,
      type: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    logger.info({ userId, challengeId }, 'WebAuthn registration options generated');

    res.json({
      options: registrationOptions,
      challengeId,
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'WebAuthn registration options generation failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to generate registration options',
    });
  }
}

/**
 * Verify WebAuthn registration response
 */
export async function verifyWebAuthnRegistration(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request
    const validationResult = webauthnRegisterVerifySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { credential, authenticatorName } = validationResult.data;

    // Get and validate challenge
    const challengeRecord = await webauthnDb.getChallenge(req.body.challengeId);
    if (!challengeRecord || challengeRecord.userId !== userId || challengeRecord.type !== 'registration') {
      res.status(400).json({
        error: 'Invalid challenge',
        details: 'Registration challenge not found or invalid',
      });
      return;
    }

    // Check challenge expiration
    if (challengeRecord.expiresAt < new Date()) {
      await webauthnDb.deleteChallenge(req.body.challengeId);
      res.status(400).json({
        error: 'Challenge expired',
        details: 'Registration challenge has expired',
      });
      return;
    }

    const verification: VerifyRegistrationResponseOpts = {
      response: {
        ...credential,
        clientExtensionResults: {},
      },
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: WEBAUTHN_CONFIG.origin,
      expectedRPID: WEBAUTHN_CONFIG.rpID,
    };

    const verificationResult = await verifyRegistrationResponse(verification);

    if (!verificationResult.verified || !verificationResult.registrationInfo) {
      res.status(400).json({
        error: 'Registration verification failed',
        details: 'Could not verify the registration response',
      });
      return;
    }

    // Store the credential
    const { credential: credData } = verificationResult.registrationInfo;
    
    await webauthnDb.createCredential({
      userId,
      credentialID: Buffer.from(credData.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credData.publicKey),
      counter: credData.counter,
      transports: [], // Transports not available in registration response
      authenticatorName,
    });

    // Clean up challenge
    await webauthnDb.deleteChallenge(req.body.challengeId);

    logger.info({ userId, credentialID: Buffer.from(credData.id).toString('base64url') }, 'WebAuthn credential registered');

    res.status(201).json({
      verified: true,
      message: 'Security key registered successfully',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'WebAuthn registration verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to verify registration',
    });
  }
}

/**
 * Generate authentication options for WebAuthn login
 */
export async function generateWebAuthnAuthenticationOptions(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    // Validate request
    const validationResult = webauthnLoginOptionsSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { email } = validationResult.data;
    
    // TODO: Get user ID from email if provided
    let allowCredentials: any[] = [];
    
    if (email) {
      // TODO: Look up user by email and get their credentials
      // const user = await userDb.findByEmail(email);
      // if (user) {
      //   const credentials = await webauthnDb.findCredentialsByUserId(user.id);
      //   allowCredentials = credentials.map(cred => ({
      //     id: cred.credentialID,
      //     type: 'public-key',
      //     transports: cred.transports,
      //   }));
      // }
    }

    const options: GenerateAuthenticationOptionsOpts = {
      rpID: WEBAUTHN_CONFIG.rpID,
      allowCredentials,
      userVerification: 'preferred',
    };

    const authenticationOptions = await generateAuthenticationOptions(options);

    // Store challenge
    const challengeId = await webauthnDb.storeChallenge({
      challenge: authenticationOptions.challenge,
      type: 'authentication',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    logger.info({ email, challengeId }, 'WebAuthn authentication options generated');

    res.json({
      options: authenticationOptions,
      challengeId,
    });

  } catch (error) {
    logger.error({ error }, 'WebAuthn authentication options generation failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to generate authentication options',
    });
  }
}

/**
 * Verify WebAuthn authentication response
 */
export async function verifyWebAuthnAuthentication(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    // Validate request
    const validationResult = webauthnLoginVerifySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const { credential, challengeId } = validationResult.data;

    // Get and validate challenge
    const challengeRecord = await webauthnDb.getChallenge(challengeId || '');
    if (!challengeRecord || challengeRecord.type !== 'authentication') {
      res.status(400).json({
        error: 'Invalid challenge',
        details: 'Authentication challenge not found or invalid',
      });
      return;
    }

    // Check challenge expiration
    if (challengeRecord.expiresAt < new Date()) {
      await webauthnDb.deleteChallenge(challengeId || '');
      res.status(400).json({
        error: 'Challenge expired',
        details: 'Authentication challenge has expired',
      });
      return;
    }

    // Find the credential
    const credentialRecord = await webauthnDb.findCredentialById(credential.id);
    if (!credentialRecord) {
      res.status(400).json({
        error: 'Credential not found',
        details: 'The security key is not registered',
      });
      return;
    }

    const verification: VerifyAuthenticationResponseOpts = {
      response: {
        ...credential,
        clientExtensionResults: {},
      },
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: WEBAUTHN_CONFIG.origin,
      expectedRPID: WEBAUTHN_CONFIG.rpID,
      credential: {
        id: credentialRecord.credentialID,
        publicKey: new Uint8Array(credentialRecord.credentialPublicKey),
        counter: credentialRecord.counter,
      },
    };

    const verificationResult = await verifyAuthenticationResponse(verification);

    if (!verificationResult.verified) {
      res.status(400).json({
        error: 'Authentication verification failed',
        details: 'Could not verify the authentication response',
      });
      return;
    }

    // Update credential counter
    await webauthnDb.updateCredentialCounter(
      credentialRecord.credentialID,
      verificationResult.authenticationInfo.newCounter
    );

    // Clean up challenge
    await webauthnDb.deleteChallenge(challengeId || '');

    logger.info({ 
      userId: credentialRecord.userId, 
      credentialID: credentialRecord.credentialID 
    }, 'WebAuthn authentication successful');

    // TODO: Complete login process
    res.json({
      verified: true,
      userId: credentialRecord.userId,
      message: 'Authentication successful',
    });

  } catch (error) {
    logger.error({ error }, 'WebAuthn authentication verification failed');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to verify authentication',
    });
  }
}

/**
 * List user's registered WebAuthn credentials
 */
export async function listWebAuthnCredentials(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const credentials = await webauthnDb.findCredentialsByUserId(userId);

    res.json({
      credentials: credentials.map(cred => ({
        id: cred.id,
        authenticatorName: cred.authenticatorName || 'Security Key',
        createdAt: cred.createdAt,
        lastUsedAt: cred.lastUsedAt,
        transports: cred.transports,
      })),
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Failed to list WebAuthn credentials');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to list credentials',
    });
  }
}

/**
 * Delete a WebAuthn credential
 */
export async function deleteWebAuthnCredential(req: Request, res: Response): Promise<void> {
  try {
    if (!checkWebAuthnEnabled(res)) return;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { credentialId } = req.params;
    if (!credentialId) {
      res.status(400).json({
        error: 'Credential ID required',
        details: 'A credential ID must be provided',
      });
      return;
    }

    // TODO: Verify the credential belongs to this user
    await webauthnDb.deleteCredential(credentialId);

    logger.info({ userId, credentialId }, 'WebAuthn credential deleted');

    res.json({
      message: 'Security key removed successfully',
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Failed to delete WebAuthn credential');
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to delete credential',
    });
  }
}