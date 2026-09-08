import { getPersonCases, getPersonProfile, getPersonTimeline } from "@/data/queries";
import type {
  LegalCaseOut,
  LocationOut,
  PersonProfileOut as PersonProfile,
  TimelineEvent,
} from "@/data/queries";

export type { LegalCaseOut, LocationOut, PersonProfile, TimelineEvent };

export function fetchPersonProfile(personId: string): Promise<PersonProfile> {
  const profile = getPersonProfile(personId);
  if (!profile) return Promise.reject(new Error("Persona no encontrada."));
  return Promise.resolve(profile);
}

export function fetchPersonCases(personId: string): Promise<LegalCaseOut[]> {
  return Promise.resolve(getPersonCases(personId));
}

export function fetchPersonTimeline(personId: string): Promise<TimelineEvent[]> {
  return Promise.resolve(getPersonTimeline(personId));
}
