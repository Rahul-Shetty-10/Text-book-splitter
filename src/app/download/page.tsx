'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Loader2, FileText, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface GeneratedFile {
  filename: string;
  title: string;
  url: string;
}

function DownloadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get('fileId');

  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setError('No file ID provided');
      setIsLoading(false);
      return;
    }

    loadFiles();
  }, [fileId]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files/${fileId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load files');
      }

      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    files.forEach((file) => {
      setTimeout(() => {
        handleDownload(file.url, file.filename);
      }, 500 * files.indexOf(file));
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg text-slate-600">Loading files...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Download Chapters</CardTitle>
            <CardDescription>
              Your PDF has been split into chapter-wise PDFs. Download them below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  PDF Split Successfully!
                </h3>
                <p className="text-slate-600 mb-6">
                  Your PDF has been split into chapter-wise files.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Due to the current implementation, files are saved locally.
                    Check the <code className="bg-blue-100 px-1 rounded">outputs/{fileId}</code> directory
                    to access your split PDF files.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-md border mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Chapter Title</TableHead>
                        <TableHead className="w-32 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{file.filename}</TableCell>
                          <TableCell>{file.title}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(file.url, file.filename)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {files.length > 1 && (
                  <div className="flex justify-end">
                    <Button onClick={handleDownloadAll}>
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium mb-1">File Location:</p>
                  <p className="text-slate-500">
                    Files are saved in: <code className="bg-slate-200 px-1 rounded">outputs/{fileId}/</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Link href="/upload">
                <Button variant="outline">Upload Another PDF</Button>
              </Link>
              <Link href="/">
                <Button>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg text-slate-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
