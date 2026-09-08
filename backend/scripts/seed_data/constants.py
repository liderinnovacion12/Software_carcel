"""Static synthetic-demo pools used by the seed generators.

All values here are fictional and used only to build a believable demo
dataset ("Datos sinteticos para demostracion") - none represent real people,
real establishments, or real legal proceedings.
"""

ESTABLISHMENTS = [
    {"name": "Establecimiento Penitenciario La Ceiba", "code": "EP-CEIBA", "city": "Villavera", "capacity": 420},
    {"name": "Establecimiento Penitenciario Rio Claro", "code": "EP-RIOCLARO", "city": "Puerto Alegre", "capacity": 260},
    {"name": "Establecimiento Penitenciario Altomonte", "code": "EP-ALTOMONTE", "city": "San Rafael del Monte", "capacity": 180},
]

AREA_NAMES = ["Patio 1", "Patio 2", "Patio 3", "Patio 4", "Pabellon A", "Pabellon B"]

CASE_TYPE_LABELS = [
    "Proceso penal - etapa de ejecucion de penas (demo)",
    "Proceso penal - etapa de juicio (demo)",
    "Proceso penal - fase de investigacion (demo)",
    "Solicitud de beneficio administrativo (demo)",
]

CASE_AUTHORITIES = [
    "Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 1 (demo)",
    "Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 2 (demo)",
    "Juzgado Penal del Circuito No. 3 (demo)",
    "Juzgado Penal del Circuito No. 5 (demo)",
]

CASE_STATUSES = [
    "identificado",
    "pendiente_revision",
    "en_analisis",
    "documentacion_incompleta",
    "documentacion_completa",
    "en_espera_decision",
    "cerrado",
]

REDEMPTION_ACTIVITY_TYPES = ["trabajo", "estudio", "ensenanza"]

COLOMBIAN_CITIES_OF_ORIGIN = [
    "Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena", "Cucuta",
    "Bucaramanga", "Pereira", "Ibague", "Villavicencio", "Monteria", "Pasto",
    "Manizales", "Neiva", "Popayan", "Valledupar", "Armenia", "Sincelejo",
]
