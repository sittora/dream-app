import { env } from '../config';
import { logger } from './logger';
import { fileValidation } from '../utils/validation';
import { feedbackManager } from '../utils/feedback';
import { handleAPIError } from '../utils/api-error';

interface UploadResponse {
  url: string;
  key: string;
}

class UploadService {
  private readonly baseUrl = env.API_URL + '/upload';
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    return feedbackManager.handleFileUpload(
      async () => {
        // Validate file type and size
        if (!fileValidation.image.validateType(file.type)) {
          throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        }

        if (!fileValidation.image.validateSize(file.size)) {
          throw new Error('File too large. Maximum size is 5MB.');
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'profile');

        // Get pre-signed URL
        const presignedUrl = await this.getPresignedUrl(file.type)
          .catch(handleAPIError('get upload URL'));

        // Upload to storage with progress tracking
        const response = await feedbackManager.trackProgress(
          () => fetch(presignedUrl.url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          }),
          {
            startMessage: 'Starting file upload...',
            progressCallback: (progress) => {
              // Update progress bar or status message
            },
            completeMessage: 'File upload complete',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        logger.info('Profile picture uploaded successfully', {
          fileType: file.type,
          fileSize: file.size,
        });

        return {
          url: presignedUrl.publicUrl,
          key: presignedUrl.key,
        };
      },
      file.name
    );
  }

  private async getPresignedUrl(contentType: string): Promise<{
    url: string;
    key: string;
    publicUrl: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/presigned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          contentType,
          type: 'profile',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to get presigned URL', { error });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    return feedbackManager.handleOperation(
      async () => {
        const response = await fetch(`${this.baseUrl}/${key}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }

        logger.info('File deleted successfully', { key });
      },
      {
        context: 'file-deletion',
        successMessage: 'File deleted successfully',
        errorMessage: 'Failed to delete file',
      }
    );
  }
}

export const uploadService = new UploadService();
