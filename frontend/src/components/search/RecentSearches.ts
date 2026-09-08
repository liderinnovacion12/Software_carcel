const STORAGE_KEY = "bialco.recent_searches";
const MAX_ITEMS = 5;

export interface RecentSearchEntry {
  personId: string;
  fullName: string;
  internalCode: string;
}

export function getRecentSearches(): RecentSearchEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearchEntry[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(entry: RecentSearchEntry): void {
  try {
    const current = getRecentSearches().filter((item) => item.personId !== entry.personId);
    const updated = [entry, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable (private mode, blocked storage) - silently skip.
  }
}
