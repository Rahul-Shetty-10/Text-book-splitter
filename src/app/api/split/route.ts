import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, chapters } = body;

    if (!fileId || !chapters || !Array.isArray(chapters)) {
      return NextResponse.json(
        { error: 'File ID and chapters array are required' },
        { status: 400 }
      );
    }

    const pdfPath = path.join(process.cwd(), 'uploads', `${fileId}.pdf`);
    const outputDir = path.join(process.cwd(), 'outputs');
    const pythonScript = path.join(process.cwd(), 'python_service', 'pdf_processor.py');

    // Prepare chapters data for Python script
    const chaptersData = JSON.stringify(chapters);

    // Run Python script to split PDF
    const result = await new Promise((resolve, reject) => {
      const python = spawn('python', [
        pythonScript,
        'split',
        pdfPath,
        outputDir,
        fileId,
        chaptersData
      ]);
      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(error || 'Python script failed'));
        } else {
          try {
            const jsonOutput = JSON.parse(output);
            resolve(jsonOutput);
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Split error:', error);
    return NextResponse.json(
      { error: 'Failed to split PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
