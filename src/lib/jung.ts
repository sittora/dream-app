import fetch from 'node-fetch';
import { z } from 'zod';

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

// Open Library API response types
interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_key?: string[];
  key?: string; // works key like /works/OLxxxxW
  ia?: string[]; // Internet Archive IDs
  language?: string[];
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

// Internet Archive metadata types
interface IAFile {
  name: string;
  format?: string;
  size?: string;
}

interface IAMetadata {
  identifier: string;
  title?: string;
  creator?: string[];
  date?: string;
  language?: string[];
  files?: IAFile[];
}

interface IAMetadataResponse {
  metadata: IAMetadata;
  files: IAFile[];
}

const NETWORK_TIMEOUT = 15000;

// Fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = NETWORK_TIMEOUT): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Score candidate based on token overlap
export function scoreCandidate(title: string, query: string): number {
  const titleTokens = title.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  if (queryTokens.length === 0 || titleTokens.length === 0) {
    return 0;
  }

  let score = 0;
  let exactMatches = 0;
  
  for (const queryToken of queryTokens) {
    for (const titleToken of titleTokens) {
      if (titleToken === queryToken) {
        // Exact word match gets high score
        score += 1.0;
        exactMatches++;
      } else if (titleToken.includes(queryToken) || queryToken.includes(titleToken)) {
        // Partial match gets lower score
        score += 0.5;
      }
    }
  }
  
  // Normalize by query length and boost for exact matches
  const normalizedScore = score / queryTokens.length;
  const exactBonus = exactMatches > 0 ? 0.2 : 0;
  
  return Math.min(1.0, normalizedScore + exactBonus);
}

// Search Open Library for Jung books
export async function searchOpenLibrary(
  query: string, 
  year?: string, 
  language?: string
): Promise<OpenLibraryDoc[]> {
  const params = new URLSearchParams({
    q: `author:"Carl Jung" OR author:"C. G. Jung" OR author:"C.G. Jung" title:(${query})`,
    limit: '50',
    fields: 'title,author_name,first_publish_year,edition_key,key,ia,language'
  });

  if (year) {
    params.set('q', params.get('q') + ` first_publish_year:${year}`);
  }

  const url = `https://openlibrary.org/search.json?${params.toString()}`;
  
  try {
    const response: OpenLibraryResponse = await fetchWithTimeout(url);
    return response.docs || [];
  } catch (error) {
    console.error('Open Library search failed:', error);
    return [];
  }
}

// Get Internet Archive metadata for a specific ID
export async function getArchiveMetadata(iaId: string): Promise<IAMetadataResponse | null> {
  const url = `https://archive.org/metadata/${iaId}`;
  
  try {
    const response: IAMetadataResponse = await fetchWithTimeout(url);
    return response;
  } catch (error) {
    console.error(`Failed to fetch IA metadata for ${iaId}:`, error);
    return null;
  }
}

// Extract PDF URLs from IA files
export function extractPdfUrls(iaId: string, files: IAFile[] = []): string[] {
  const pdfFiles = files.filter(file => 
    file.format?.toLowerCase() === 'pdf' || 
    file.name?.toLowerCase().endsWith('.pdf')
  );
  
  return pdfFiles.map(file => 
    `https://archive.org/download/${iaId}/${file.name}`
  );
}

// Main function to find Jung books
export async function findJungBooks(
  query: string,
  year?: string,
  language?: string
): Promise<JungBookResult[]> {
  // Search Open Library
  const docs = await searchOpenLibrary(query, year, language);
  
  // Collect all unique IA IDs
  const iaIds = new Set<string>();
  const docsByIaId = new Map<string, OpenLibraryDoc>();
  
  for (const doc of docs) {
    if (doc.ia && doc.ia.length > 0) {
      for (const iaId of doc.ia) {
        iaIds.add(iaId);
        if (!docsByIaId.has(iaId)) {
          docsByIaId.set(iaId, doc);
        }
      }
    }
  }
  
  // Fetch IA metadata for each ID (with error handling)
  const results: JungBookResult[] = [];
  const iaIdArray = Array.from(iaIds);
  
  for (const iaId of iaIdArray) {
    try {
      const iaData = await getArchiveMetadata(iaId);
      const doc = docsByIaId.get(iaId);
      
      if (!iaData || !doc) continue;
      
      const pdfUrls = extractPdfUrls(iaId, iaData.files);
      const confidence = scoreCandidate(doc.title, query);
      
      // Language preference
      let langScore = 1.0;
      if (language && doc.language) {
        const hasPreferredLang = doc.language.some(lang => 
          lang.toLowerCase().startsWith(language.toLowerCase())
        );
        langScore = hasPreferredLang ? 1.2 : 0.8;
      }
      
      const result: JungBookResult = {
        title: doc.title,
        author: doc.author_name?.[0] || 'Carl Jung',
        year: doc.first_publish_year,
        edition_key: doc.edition_key?.[0],
        openlibrary_key: doc.key,
        internet_archive_id: iaId,
        read_url: `https://archive.org/details/${iaId}`,
        pdf_urls: pdfUrls,
        language: doc.language?.[0],
        confidence: confidence * langScore
      };
      
      results.push(result);
    } catch (error) {
      console.error(`Error processing IA ID ${iaId}:`, error);
      // Continue processing other IDs
    }
  }
  
  // Sort by confidence (desc) then year (desc)
  results.sort((a, b) => {
    const confDiff = b.confidence - a.confidence;
    if (Math.abs(confDiff) > 0.01) return confDiff;
    
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    return yearB - yearA;
  });
  
  return results;
}

// Query validation schema
export const QuerySchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters'),
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number').optional(),
  lang: z.string().length(2, 'Language must be a 2-character ISO code').optional()
});

export type QueryParams = z.infer<typeof QuerySchema>;