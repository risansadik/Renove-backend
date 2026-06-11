export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface ISearchService {
  search(query: string, numResults?: number): Promise<SearchResult[]>;
}