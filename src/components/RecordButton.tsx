import React, { useState } from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isRecording ? (
        <>
          <Square className="w-5 h-5" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="w-5 h-5" />
          Start Recording
        </>
      )}
    </button>
  );
};