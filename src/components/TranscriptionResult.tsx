import React from 'react';
import { Copy } from 'lucide-react';

interface TranscriptionResultProps {
  fileName: string;
  text: string;
  error?: boolean;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ fileName, text, error }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 ${error ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">{fileName}</h3>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-blue-500 transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
      <p className={`whitespace-pre-wrap ${error ? 'text-red-600' : 'text-gray-600'}`}>{text}</p>
    </div>
  );
};