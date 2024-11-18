import { logger } from '../services/logger';
import { APIError } from './api-error';
import { ValidationError } from './validation';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackMessage {
  type: FeedbackType;
  message: string;
  details?: string[];
  timestamp: Date;
}

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  feedback: FeedbackMessage;
}

class FeedbackManager {
  private messages: FeedbackMessage[] = [];

  addMessage(type: FeedbackType, message: string, details?: string[]) {
    const feedbackMessage: FeedbackMessage = {
      type,
      message,
      details,
      timestamp: new Date(),
    };

    this.messages.push(feedbackMessage);
    this.logMessage(feedbackMessage);

    return feedbackMessage;
  }

  private logMessage(message: FeedbackMessage) {
    const logMethod = {
      success: 'info',
      error: 'error',
      warning: 'warn',
      info: 'info',
    }[message.type] as keyof typeof logger;

    logger[logMethod]('User feedback', {
      type: message.type,
      message: message.message,
      details: message.details,
    });
  }

  clearMessages() {
    this.messages = [];
  }

  getMessages() {
    return [...this.messages];
  }

  // Handle common operation patterns
  async handleOperation<T>(
    operation: () => Promise<T>,
    {
      context,
      successMessage,
      errorMessage = 'Operation failed',
    }: {
      context: string;
      successMessage: string;
      errorMessage?: string;
    }
  ): Promise<OperationResult<T>> {
    try {
      const data = await operation();
      
      return {
        success: true,
        data,
        feedback: this.addMessage('success', successMessage),
      };
    } catch (error) {
      let feedback: FeedbackMessage;

      if (error instanceof ValidationError) {
        feedback = this.addMessage(
          'error',
          `${errorMessage}: Validation failed`,
          error.errors.map(e => `${e.field}: ${e.message}`)
        );
      } else if (error instanceof APIError) {
        feedback = this.addMessage(
          'error',
          `${errorMessage}: ${error.message}`,
          error.details ? [JSON.stringify(error.details)] : undefined
        );
      } else {
        feedback = this.addMessage(
          'error',
          `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return {
        success: false,
        feedback,
      };
    }
  }

  // Specialized handlers for common operations
  async handleFileUpload<T>(
    uploadOperation: () => Promise<T>,
    fileName: string
  ): Promise<OperationResult<T>> {
    return this.handleOperation(uploadOperation, {
      context: 'file-upload',
      successMessage: `Successfully uploaded ${fileName}`,
      errorMessage: `Failed to upload ${fileName}`,
    });
  }

  async handleDataExport<T>(
    exportOperation: () => Promise<T>
  ): Promise<OperationResult<T>> {
    return this.handleOperation(exportOperation, {
      context: 'data-export',
      successMessage: 'Successfully exported your data',
      errorMessage: 'Failed to export your data',
    });
  }

  async handleAccountDeletion(
    deleteOperation: () => Promise<void>
  ): Promise<OperationResult<void>> {
    return this.handleOperation(deleteOperation, {
      context: 'account-deletion',
      successMessage: 'Your account has been successfully deleted',
      errorMessage: 'Failed to delete your account',
    });
  }

  // Progress feedback for long-running operations
  async trackProgress<T>(
    operation: () => Promise<T>,
    {
      startMessage,
      progressCallback,
      completeMessage,
    }: {
      startMessage: string;
      progressCallback: (progress: number) => void;
      completeMessage: string;
    }
  ): Promise<T> {
    this.addMessage('info', startMessage);
    
    try {
      const result = await operation();
      this.addMessage('success', completeMessage);
      return result;
    } catch (error) {
      this.addMessage('error', 'Operation failed', [
        error instanceof Error ? error.message : 'Unknown error',
      ]);
      throw error;
    }
  }
}

export const feedbackManager = new FeedbackManager();
