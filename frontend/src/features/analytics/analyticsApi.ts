import {
  getAlertCountsByLevel,
  getCaseStatusDistribution,
  getDashboardIndicators,
  getOccupancyByEstablishment,
  getPopulationTrend,
} from "@/data/queries";

export function fetchAnalytics() {
  return Promise.resolve({
    indicators: getDashboardIndicators(),
    populationTrend: getPopulationTrend(),
    caseStatusDistribution: getCaseStatusDistribution(),
    alertsByLevel: getAlertCountsByLevel(),
    occupancyByEstablishment: getOccupancyByEstablishment(),
  });
}
