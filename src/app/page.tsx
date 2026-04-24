import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Textbook Chapter Splitter
          </h1>
          <p className="text-xl text-slate-600">
            Automatically split PDF textbooks into chapter-wise PDFs using TOC or text pattern detection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Upload className="w-12 h-12 text-blue-600 mb-2" />
              <CardTitle>1. Upload</CardTitle>
              <CardDescription>Upload your textbook PDF file</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-12 h-12 text-green-600 mb-2" />
              <CardTitle>2. Detect</CardTitle>
              <CardDescription>Auto-detect chapters using TOC or patterns</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="w-12 h-12 text-purple-600 mb-2" />
              <CardTitle>3. Download</CardTitle>
              <CardDescription>Download individual chapter PDFs</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href="/upload">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
