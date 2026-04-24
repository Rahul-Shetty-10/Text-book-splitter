import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const pdfPath = path.join(process.cwd(), 'uploads', `${fileId}.pdf`);
    const pythonScript = path.join(process.cwd(), 'python_service', 'pdf_processor.py');

    // Run Python script to process PDF
    const result = await new Promise((resolve, reject) => {
      const python = spawn('python', [pythonScript, 'process', pdfPath]);
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
    console.error('Process error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
