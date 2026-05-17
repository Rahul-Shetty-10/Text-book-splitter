# Textbook Chapter Splitter

A web application that automatically splits PDF textbooks into chapter-wise PDFs using Table of Contents (TOC) extraction or text pattern detection.

## Overview

This application consists of:
- **Frontend**: Next.js web application with React, TypeScript, and Tailwind CSS
- **Backend**: Python service for PDF processing using PyMuPDF
- **Features**: Upload PDF textbooks, auto-detect chapters, and download individual chapter PDFs

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.7 or higher)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Text-book_splitter/Text-book-splitter
```

### 2. Install Frontend Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Install Python Dependencies

```bash
# Navigate to python service directory
cd python_service

# Install Python requirements
pip install -r requirements.txt

# Go back to root directory
cd ..
```

### 4. Create Required Directories

The application automatically creates these directories, but you can create them manually:

```bash
mkdir uploads
mkdir outputs
```

## Running the Application

### Development Mode

```bash
# Start the Next.js development server
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Available Scripts

### Frontend Scripts (package.json)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Python Service

The Python PDF processor is called by the Next.js API routes and doesn't need to be run separately.

## Project Structure

```
Text-book-splitter/
|
|--- src/
|    |--- app/                 # Next.js app router pages
|    |    |--- api/           # API routes
|    |    |--- upload/        # File upload page
|    |    |--- process/       # PDF processing page
|    |    |--- download/      # Download page
|    |    |--- page.tsx       # Home page
|    |    |--- layout.tsx     # Root layout
|    |--- components/         # React components
|
|--- python_service/
|    |--- pdf_processor.py    # PDF processing logic
|    |--- requirements.txt    # Python dependencies
|
|--- package.json             # Node.js dependencies and scripts
|--- tsconfig.json           # TypeScript configuration
|--- tailwind.config.ts      # Tailwind CSS configuration
|--- postcss.config.js       # PostCSS configuration
|--- .gitignore              # Git ignore rules
```

## How It Works

1. **Upload**: Users upload PDF textbook files through the web interface
2. **Detection**: The Python service extracts chapters using:
   - Table of Contents (TOC) bookmarks from the PDF
   - Text pattern detection for chapter headings
3. **Processing**: Splits the PDF into individual chapter files
4. **Download**: Users can download individual chapter PDFs

## Dependencies

### Frontend Dependencies
- Next.js 14.2.3 (React framework)
- React 18.3.1 (UI library)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Radix UI components (UI primitives)
- Lucide React (Icons)
- UUID (Unique identifiers)

### Python Dependencies
- PyMuPDF (PDF processing and manipulation)

## Development Notes

- The application uses the App Router pattern in Next.js 13+
- File uploads are stored in the `uploads/` directory
- Processed chapter PDFs are stored in the `outputs/` directory
- Both directories are excluded from git via .gitignore
- The Python service is called via Node.js child_process from API routes

## Environment Variables

Create a `.env.local` file in the root directory for any environment-specific configurations (currently none required).

## Troubleshooting

### Common Issues

1. **PDF Processing Fails**: Ensure PyMuPDF is installed correctly
   ```bash
   pip install --upgrade pymupdf
   ```

2. **Upload Issues**: Check that uploads directory exists and has write permissions

3. **Build Errors**: Ensure all Node.js dependencies are installed
   ```bash
   npm install
   ```

### Port Conflicts

If port 3000 is in use, the development server will automatically try the next available port (3001, 3002, etc.).

## License

This project is private and not intended for distribution.
