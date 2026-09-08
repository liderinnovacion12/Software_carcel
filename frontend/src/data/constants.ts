// Static synthetic-demo pools. All values are fictional and used only to
// build a believable demo dataset ("Datos sinteticos para demostracion") -
// none represent real people, real establishments, or real legal proceedings.

export const FIRST_NAMES_MALE = [
  "Andres", "Carlos", "Juan", "Luis", "Miguel", "Jorge", "Diego", "Santiago",
  "Felipe", "Camilo", "Sebastian", "Alejandro", "Ricardo", "Daniel", "David",
  "Julian", "Nicolas", "Oscar", "Pedro", "Rafael", "Cristian", "Fernando",
  "Eduardo", "Gustavo", "Ivan", "Jairo", "Leonardo", "Manuel", "Mauricio",
  "Wilson", "Yesid", "Hector", "Alvaro", "Antonio", "Armando", "Bernardo",
];

export const FIRST_NAMES_FEMALE = [
  "Maria", "Laura", "Diana", "Sandra", "Paola", "Angela", "Claudia", "Adriana",
  "Carolina", "Catalina", "Daniela", "Fernanda", "Gloria", "Ingrid", "Jenny",
  "Karen", "Liliana", "Marcela", "Natalia", "Patricia", "Rocio", "Sofia",
  "Tatiana", "Valentina", "Viviana", "Ximena", "Yolanda", "Alejandra", "Beatriz",
  "Constanza", "Doris", "Esperanza", "Flor", "Graciela", "Isabel", "Johana",
];

export const LAST_NAMES = [
  "Gomez", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Hernandez", "Perez",
  "Sanchez", "Ramirez", "Torres", "Diaz", "Vargas", "Castro", "Ruiz", "Alvarez",
  "Romero", "Suarez", "Rojas", "Moreno", "Munoz", "Jimenez", "Ortiz", "Rios",
  "Mendoza", "Castillo", "Reyes", "Cardenas", "Guerrero", "Medina", "Aguilar",
  "Cruz", "Nino", "Pineda", "Beltran", "Contreras", "Delgado", "Escobar",
  "Fajardo", "Gutierrez", "Herrera", "Lozano", "Ospina", "Quintero", "Salazar",
  "Trujillo", "Valencia", "Zapata", "Bermudez", "Caicedo", "Duarte",
];

export const COLOMBIAN_CITIES_OF_ORIGIN = [
  "Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena", "Cucuta",
  "Bucaramanga", "Pereira", "Ibague", "Villavicencio", "Monteria", "Pasto",
  "Manizales", "Neiva", "Popayan", "Valledupar", "Armenia", "Sincelejo",
];

export interface EstablishmentSeed {
  name: string;
  code: string;
  city: string;
  capacity: number;
}

export const ESTABLISHMENTS: EstablishmentSeed[] = [
  { name: "Establecimiento Penitenciario La Ceiba", code: "EP-CEIBA", city: "Villavera", capacity: 420 },
  { name: "Establecimiento Penitenciario Rio Claro", code: "EP-RIOCLARO", city: "Puerto Alegre", capacity: 260 },
  { name: "Establecimiento Penitenciario Altomonte", code: "EP-ALTOMONTE", city: "San Rafael del Monte", capacity: 180 },
];

export const AREA_NAMES = ["Patio 1", "Patio 2", "Patio 3", "Patio 4", "Pabellon A", "Pabellon B"];

export const CASE_TYPE_LABELS = [
  "Proceso penal - etapa de ejecucion de penas (demo)",
  "Proceso penal - etapa de juicio (demo)",
  "Proceso penal - fase de investigacion (demo)",
  "Solicitud de beneficio administrativo (demo)",
];

export const CASE_AUTHORITIES = [
  "Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 1 (demo)",
  "Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 2 (demo)",
  "Juzgado Penal del Circuito No. 3 (demo)",
  "Juzgado Penal del Circuito No. 5 (demo)",
];

export const CASE_STATUSES = [
  "identificado",
  "pendiente_revision",
  "en_analisis",
  "documentacion_incompleta",
  "documentacion_completa",
  "en_espera_decision",
  "cerrado",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  identificado: "Identificado",
  pendiente_revision: "Pendiente de revision",
  en_analisis: "En analisis",
  documentacion_incompleta: "Documentacion incompleta",
  documentacion_completa: "Documentacion completa",
  en_espera_decision: "En espera de decision",
  cerrado: "Cerrado",
};

export const REDEMPTION_ACTIVITY_TYPES = ["trabajo", "estudio", "ensenanza"] as const;

export const DOCUMENT_CATEGORIES = [
  "Sentencia condenatoria",
  "Constancia de redencion",
  "Certificado de antecedentes",
  "Boleta de libertad",
  "Estudio de caso social",
  "Historia clinica basica",
];
