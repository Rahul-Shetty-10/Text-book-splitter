'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  title: string;
  start_page: number;
}

interface ProcessResult {
  chapters: Chapter[];
  method: string;
  success: boolean;
  error?: string;
}

function ProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get('fileId');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [method, setMethod] = useState<string>('');

  useEffect(() => {
    if (!fileId) {
      setError('No file ID provided');
      setIsLoading(false);
      return;
    }

    processPDF();
  }, [fileId]);

  const processPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const data: ProcessResult = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process PDF');
      }

      setChapters(data.chapters);
      setMethod(data.method);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterTitleChange = (index: number, newTitle: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].title = newTitle;
    setChapters(updatedChapters);
  };

  const handleSplit = async () => {
    if (!fileId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, chapters }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to split PDF');
      }

      // Navigate to download page
      router.push(`/download?fileId=${fileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg text-slate-600">Detecting chapters...</p>
              <p className="text-sm text-slate-500">
                This may take a moment for large PDFs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-6">{error}</p>
            <div className="flex space-x-4">
              <Link href="/upload">
                <Button variant="outline">Upload Another File</Button>
              </Link>
              {fileId && (
                <Button onClick={processPDF} variant="ghost">
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Review Chapters</CardTitle>
            <CardDescription>
              {chapters.length} chapters detected using {method === 'toc' ? 'PDF Table of Contents' : 'text pattern detection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Chapter Title</TableHead>
                    <TableHead className="w-24">Start Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters.map((chapter, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={chapter.title}
                          onChange={(e) => handleChapterTitleChange(index, e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>{chapter.start_page}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <Link href="/upload">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSplit} disabled={isProcessing || chapters.length === 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Split PDF
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium mb-1">Tips:</p>
                  <ul className="space-y-1 text-slate-500">
                    <li>• Edit chapter titles before splitting</li>
                    <li>• Titles will be used for output filenames</li>
                    <li>• Special characters will be cleaned automatically</li>
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

export default function ProcessPage() {
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
      <ProcessContent />
    </Suspense>
  );
}
