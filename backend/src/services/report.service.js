import { reportRepository } from '../repositories/report.repository.js';

export const reportService = {
  async adminDistributionMonitoring() {
    const [distribution, roleSummary] = await Promise.all([
      reportRepository.distributionMonitoring(),
      reportRepository.roleWisePrescriptionSummary(),
    ]);
    return { distribution, roleSummary };
  },
};
