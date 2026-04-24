import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    const outputDir = path.join(process.cwd(), 'outputs', fileId);

    const files = await readdir(outputDir);

    const fileData = files
      .filter(file => file.endsWith('.pdf'))
      .map(filename => ({
        filename,
        title: filename.replace('.pdf', '').replace(/_/g, ' '),
        url: `/api/download/${fileId}/${filename}`,
      }));

    return NextResponse.json({ files: fileData });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
