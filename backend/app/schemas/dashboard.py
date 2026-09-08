from pydantic import BaseModel


class DashboardIndicators(BaseModel):
    poblacion_registrada: int
    casos_activos: int
    casos_pendientes_revision: int
    expedientes_incompletos: int
    redenciones_pendientes: int
    establecimientos_count: int
    capacidad_total: int
    ocupacion_actual: int
    ocupacion_porcentaje: float
