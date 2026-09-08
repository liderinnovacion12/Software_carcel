import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiClient";

export interface SearchResultItem {
  person_id: string;
  full_name: string;
  internal_code: string;
  identification_number: string;
  establishment_name: string | null;
  status: string;
  match_reason: string;
}

interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => apiRequest<SearchResponse>("/search", { params: { q: query } }),
    enabled: query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
