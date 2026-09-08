import { apiRequest } from "@/lib/apiClient";

export interface LocationOut {
  establishment_name: string;
  area_name: string | null;
  cell_code: string | null;
  effective_from: string;
  effective_to: string | null;
}

export interface PersonProfile {
  id: string;
  internal_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  birth_date: string;
  sex: string;
  status: string;
  current_location: LocationOut | null;
}

export interface LegalCaseOut {
  id: string;
  radicado: string;
  authority: string;
  case_type_label: string;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

export interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  description: string;
}

export function fetchPersonProfile(personId: string): Promise<PersonProfile> {
  return apiRequest<PersonProfile>(`/persons/${personId}`);
}

export function fetchPersonCases(personId: string): Promise<LegalCaseOut[]> {
  return apiRequest<LegalCaseOut[]>(`/persons/${personId}/cases`);
}

export function fetchPersonTimeline(personId: string): Promise<TimelineEvent[]> {
  return apiRequest<TimelineEvent[]>(`/persons/${personId}/timeline`);
}
