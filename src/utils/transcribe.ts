import { pipeline } from '@xenova/transformers';

export class WhisperTranscriber {
  private static instance: WhisperTranscriber;
  private transcriber: any;
  private isLoading: boolean = false;
  private initializationError: Error | null = null;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private modelPath: string = './models/whisper-tiny.en';

  private constructor() {}

  static async getInstance(): Promise<WhisperTranscriber> {
    if (!WhisperTranscriber.instance) {
      WhisperTranscriber.instance = new WhisperTranscriber();
    }
    return WhisperTranscriber.instance;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async initialize() {
    if (!this.transcriber && !this.isLoading) {
      this.isLoading = true;
      let retryCount = 0;

      while (retryCount < this.maxRetries) {
        try {
          console.log(`Attempting to initialize model from local path (attempt ${retryCount + 1}/${this.maxRetries})`);
          
          this.transcriber = await pipeline('automatic-speech-recognition', this.modelPath, {
            local_files_only: true,
            model_config: {
              use_auth_token: false,
              local_files_only: true,
              trust_remote_code: true
            }
          });

          console.log('Successfully initialized model from local path');
          this.initializationError = null;
          break;
          
        } catch (error) {
          console.error(`Local model initialization attempt ${retryCount + 1} failed:`, error);
          
          if (retryCount < this.maxRetries - 1) {
            console.log(`Retrying in ${this.retryDelay/1000} seconds...`);
            await this.delay(this.retryDelay);
            retryCount++;
            continue;
          }

          const errorMessage = `Failed to load local model from ${this.modelPath}. Please ensure the model files are present in the correct location.`;
          this.initializationError = new Error(errorMessage);
          throw this.initializationError;
        }
      }

      this.isLoading = false;
    }

    if (this.initializationError) {
      throw this.initializationError;
    }

    return this.transcriber;
  }

  async transcribe(audioFile: File): Promise<string> {
    try {
      const transcriber = await this.initialize();
      
      if (!transcriber) {
        throw new Error('Transcription service not initialized properly');
      }

      const result = await transcriber(audioFile, {
        chunk_length_s: 15,
        stride_length_s: 3,
        language: 'en',
        task: 'transcribe',
        return_timestamps: false,
      });
      
      if (!result || typeof result.text !== 'string') {
        throw new Error('Invalid transcription result format');
      }

      return result.text.trim();
    } catch (error) {
      console.error('Detailed transcription error:', error);
      if (error instanceof Error) {
        if (error === this.initializationError) {
          throw error;
        }
        throw new Error(`Transcription failed: ${error.message}`);
      }
      throw new Error('Transcription failed: Unknown error occurred');
    }
  }
}