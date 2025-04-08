import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { RecordButton } from './components/RecordButton';
import { TranscriptionResult } from './components/TranscriptionResult';
import { Headphones, Loader2 } from 'lucide-react';
import { WhisperTranscriber } from './utils/transcribe';

interface TranscriptionResult {
  fileName: string;
  text: string;
  error?: boolean;
}

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((fileList: FileList) => {
    setFiles(prev => [...prev, ...Array.from(fileList)]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
    setError(null);
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    const file = new File([blob], `Recording-${new Date().toISOString()}.webm`, {
      type: 'audio/webm'
    });
    setFiles(prev => [...prev, file]);
    setError(null);
  }, []);

  const transcribeFiles = async () => {
    setIsTranscribing(true);
    setError(null);
    try {
      const transcriber = await WhisperTranscriber.getInstance();
      const results: TranscriptionResult[] = [];

      for (const file of files) {
        try {
          const text = await transcriber.transcribe(file);
          results.push({ fileName: file.name, text });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error transcribing ${file.name}:`, error);
          results.push({ 
            fileName: file.name, 
            text: `Failed to transcribe: ${errorMessage}`,
            error: true 
          });
        }
      }

      setTranscriptions(results);
      setFiles([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize transcription service';
      setError(errorMessage);
      console.error('Transcription service error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Headphones className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Whisper Transcription
            </h1>
          </div>
          <p className="text-gray-600">
            Upload audio files or record directly to transcribe your content
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <FileUpload onFilesSelected={handleFilesSelected} />
          <div className="mt-6 flex justify-center">
            <RecordButton onRecordingComplete={handleRecordingComplete} />
          </div>
          <FileList files={files} onRemove={handleRemoveFile} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {files.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={transcribeFiles}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  'Transcribe Files'
                )}
              </button>
            </div>
          )}
        </div>

        {transcriptions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcriptions</h2>
            {transcriptions.map((result, index) => (
              <TranscriptionResult
                key={index}
                fileName={result.fileName}
                text={result.text}
                error={result.error}
              />
            ))}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-6">
          <p>Supported formats: MP3, WAV, M4A, WEBM</p>
          <p className="mt-1">Files are processed locally on your device</p>
        </div>
      </div>
    </div>
  );
}

export default App;