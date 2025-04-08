import React from 'react';
import { File, X } from 'lucide-react';

interface FileListProps {
  files: File[];
  onRemove: (file: File) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Selected Files</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <File className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
            <button
              onClick={() => onRemove(file)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};