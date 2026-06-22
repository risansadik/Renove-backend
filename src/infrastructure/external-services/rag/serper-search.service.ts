import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { SerperClientProvider } from "./providers/serper-client.provider";
import type {
  ISearchService,
  SearchResult,
} from "../../../application/interfaces/services/rag/ISearchService";

interface SerperOrganicItem {
  title: string;
  snippet: string;
  link: string;
}

interface SerperResponse {
  organic?: SerperOrganicItem[];
}

@injectable()
export class SerperSearchService implements ISearchService {
  private readonly _apiKey: string;
  private readonly _endpoint: string;

  constructor(
    @inject(TYPES.SerperClient) private readonly _serperProvider: SerperClientProvider
  ) {
    this._apiKey = this._serperProvider.getApiKey();
    this._endpoint = this._serperProvider.getEndpoint();
  }

  async search(query: string, numResults = 6): Promise<SearchResult[]> {
    const response = await fetch(this._endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this._apiKey,
      },
      body: JSON.stringify({ q: query, num: numResults }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SerperResponse;

    return (data.organic ?? []).slice(0, numResults).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      url: item.link,
    }));
  }
}