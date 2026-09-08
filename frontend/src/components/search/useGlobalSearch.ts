import { useQuery } from "@tanstack/react-query";
import { searchPersons } from "@/data/queries";
import type { SearchResultItem } from "@/data/queries";

export type { SearchResultItem };

interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: (): Promise<SearchResponse> =>
      Promise.resolve({ query, results: searchPersons(query) }),
    enabled: query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
