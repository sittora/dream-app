// Client helper for Jung Books API
// NOTE: This is not imported anywhere yet - ready for future integration

export interface JungBookResult {
  title: string;
  author: string;
  year?: number;
  edition_key?: string;
  openlibrary_key?: string;
  internet_archive_id: string;
  read_url: string;
  pdf_urls: string[];
  language?: string;
  confidence: number;
}

export interface FindJungBooksOptions {
  year?: string;
  lang?: string;
}

/**
 * Find Jung books using the backend API
 * @param q Search query (title or keywords)
 * @param opts Optional filters for year and language
 * @returns Array of book results
 */
export async function findJungBooks(
  q: string, 
  opts: FindJungBooksOptions = {}
): Promise<JungBookResult[]> {
  try {
    const params = new URLSearchParams({ q });
    
    if (opts.year) {
      params.set('year', opts.year);
    }
    
    if (opts.lang) {
      params.set('lang', opts.lang);
    }
    
    const response = await fetch(`/api/jung-books?${params.toString()}`);
    
    if (!response.ok) {
      const { logger } = await import('../lib/logger.js');
      logger.warn({ status: response.status, statusText: response.statusText }, 'Jung books API error');
      return [];
    }
    
    return (await response.json()) as JungBookResult[];
  } catch (error) {
    const { logger } = await import('../lib/logger.js');
    logger.warn({ error }, 'Failed to fetch Jung books');
    return [];
  }
}

/**
 * Search for a specific Jung work by title
 * @param title The book title to search for
 * @param year Optional publication year filter
 * @returns Array of matching books
 */
export async function findJungWorkByTitle(
  title: string, 
  year?: string
): Promise<JungBookResult[]> {
  return findJungBooks(title, { year });
}

/**
 * Get direct PDF links for a book (if available)
 * @param book The book result
 * @returns Array of PDF URLs
 */
export function getPdfLinks(book: JungBookResult): string[] {
  return book.pdf_urls || [];
}

/**
 * Get the Internet Archive reading URL for a book
 * @param book The book result
 * @returns URL to read the book on archive.org
 */
export function getReadingUrl(book: JungBookResult): string {
  return book.read_url;
}