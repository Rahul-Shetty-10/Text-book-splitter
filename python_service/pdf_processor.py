import fitz  # PyMuPDF
import re
import os
import sys
import json
from typing import List, Dict, Optional


def extract_toc(pdf_path: str) -> List[Dict[str, any]]:
    """
    Extract table of contents from PDF using bookmarks.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of chapters with title and start_page
    """
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    
    if not toc:
        return []
    
    chapters = []
    for item in toc:
        level, title, page_num = item
        # Only include top-level chapters (level 1)
        if level == 1:
            chapters.append({
                "title": title.strip(),
                "start_page": page_num
            })
    
    doc.close()
    return chapters


def detect_chapters_by_text(pdf_path: str) -> List[Dict[str, any]]:
    """
    Detect chapters by scanning text patterns in the PDF.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of chapters with title and start_page
    """
    doc = fitz.open(pdf_path)
    chapters = []
    
    # Pattern for chapter/unit/lesson with numbers
    pattern = re.compile(r'(chapter|unit|lesson)\s+\d+', re.IGNORECASE)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        
        # Search for chapter patterns
        matches = pattern.findall(text)
        
        if matches:
            # Get the full line containing the match
            lines = text.split('\n')
            for line in lines:
                if pattern.search(line):
                    title = line.strip()
                    # Clean up the title
                    title = re.sub(r'\s+', ' ', title)
                    chapters.append({
                        "title": title,
                        "start_page": page_num + 1  # 1-indexed
                    })
                    break  # Only take first match per page
    
    doc.close()
    return chapters


def clean_filename(title: str, max_length: int = 50) -> str:
    """
    Clean a title to be used as a filename.
    
    Args:
        title: The chapter title
        max_length: Maximum length of the filename
        
    Returns:
        Cleaned filename
    """
    # Remove special characters
    cleaned = re.sub(r'[^\w\s-]', '', title)
    # Replace spaces with underscores
    cleaned = cleaned.replace(' ', '_')
    # Remove multiple underscores
    cleaned = re.sub(r'_+', '_', cleaned)
    # Remove leading/trailing underscores
    cleaned = cleaned.strip('_')
    # Limit length
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rstrip('_')
    return cleaned


def split_pdf(pdf_path: str, chapters: List[Dict[str, any]], output_dir: str, file_id: str) -> List[Dict[str, any]]:
    """
    Split PDF into chapter-wise PDFs.
    
    Args:
        pdf_path: Path to the original PDF
        chapters: List of chapters with title and start_page
        output_dir: Directory to save output files
        file_id: Unique identifier for the file
        
    Returns:
        List of generated files with filename and path
    """
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # Create output directory
    output_path = os.path.join(output_dir, file_id)
    os.makedirs(output_path, exist_ok=True)
    
    generated_files = []
    
    for i, chapter in enumerate(chapters):
        start_page = chapter["start_page"] - 1  # Convert to 0-indexed
        end_page = chapters[i + 1]["start_page"] - 1 if i + 1 < len(chapters) else total_pages
        
        # Create new PDF for this chapter
        new_doc = fitz.open()
        new_doc.insert_pdf(doc, from_page=start_page, to_page=end_page - 1)
        
        # Clean filename
        filename = clean_filename(chapter["title"])
        
        # Handle duplicate filenames
        base_filename = filename
        counter = 1
        while os.path.exists(os.path.join(output_path, f"{filename}.pdf")):
            filename = f"{base_filename}_{counter}"
            counter += 1
        
        output_file = os.path.join(output_path, f"{filename}.pdf")
        new_doc.save(output_file)
        new_doc.close()
        
        generated_files.append({
            "filename": f"{filename}.pdf",
            "path": output_file,
            "title": chapter["title"],
            "url": f"/api/download/{file_id}/{filename}.pdf"
        })
    
    doc.close()
    return generated_files


def process_pdf(pdf_path: str) -> Dict[str, any]:
    """
    Process PDF to detect chapters using TOC or text patterns.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary with chapters and detection method
    """
    # Try TOC first
    toc_chapters = extract_toc(pdf_path)
    
    if toc_chapters:
        return {
            "chapters": toc_chapters,
            "method": "toc",
            "success": True
        }
    
    # Fallback to text detection
    text_chapters = detect_chapters_by_text(pdf_path)
    
    if text_chapters:
        return {
            "chapters": text_chapters,
            "method": "text",
            "success": True
        }
    
    return {
        "chapters": [],
        "method": "none",
        "success": False,
        "error": "No chapters detected"
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        sys.exit(1)

    command = sys.argv[1]

    if command == "process":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "PDF path required"}))
            sys.exit(1)
        pdf_path = sys.argv[2]
        result = process_pdf(pdf_path)
        print(json.dumps(result))

    elif command == "split":
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Missing required arguments"}))
            sys.exit(1)
        pdf_path = sys.argv[2]
        output_dir = sys.argv[3]
        file_id = sys.argv[4]
        chapters_json = sys.argv[5]
        chapters = json.loads(chapters_json)
        result = split_pdf(pdf_path, chapters, output_dir, file_id)
        print(json.dumps(result))

    else:
        print(json.dumps({"error": "Unknown command"}))
        sys.exit(1)
