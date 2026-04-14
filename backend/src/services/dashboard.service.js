import { dashboardRepository } from '../repositories/dashboard.repository.js';

export const dashboardService = {
  async getStats(user) {
    return dashboardRepository.getStats(user);
  },

  async getActivity() {
    return dashboardRepository.getRecentActivity();
  },
};
