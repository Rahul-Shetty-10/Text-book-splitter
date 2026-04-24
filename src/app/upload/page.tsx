'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const autoProcessAndSplit = async (fileId: string) => {
    setIsProcessing(true);
    try {
      // Process PDF to detect chapters
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const processData = await processResponse.json();

      if (!processResponse.ok || !processData.success) {
        throw new Error(processData.error || 'Failed to process PDF');
      }

      // Split PDF
      const splitResponse = await fetch('/api/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, chapters: processData.chapters }),
      });

      const splitData = await splitResponse.json();

      if (!splitResponse.ok) {
        throw new Error(splitData.error || 'Failed to split PDF');
      }

      // Navigate to download page with split files
      router.push(`/download?fileId=${fileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process and split PDF');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size === 0) {
      setError('Empty file uploaded');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFileId(data.fileId);
      
      // Automatically process and split the PDF
      await autoProcessAndSplit(data.fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Upload Textbook PDF</CardTitle>
            <CardDescription>
              Upload your textbook PDF to automatically split it into chapter-wise PDFs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {isUploading || isProcessing ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-lg text-slate-600">
                    {isUploading ? 'Uploading file...' : 'Processing and splitting PDF...'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {isProcessing ? 'This may take a moment for large PDFs' : ''}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="w-12 h-12 text-slate-400" />
                  <div>
                    <p className="text-lg font-medium text-slate-700">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-sm text-slate-500 mt-2">or</p>
                  </div>
                  <label htmlFor="file-input">
                    <Button asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-400">
                    Only PDF files are supported
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium mb-1">Supported Features:</p>
                  <ul className="space-y-1 text-slate-500">
                    <li>• Automatic chapter detection using PDF TOC</li>
                    <li>• Fallback to text pattern detection</li>
                    <li>• Edit chapter names before splitting</li>
                    <li>• Download individual chapter PDFs</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
