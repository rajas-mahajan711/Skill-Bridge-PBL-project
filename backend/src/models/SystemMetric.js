/**
 * SystemMetric Model
 * Provides high-level platform analytics, placement readiness distribution, and storage telemetry.
 */

export class SystemMetricService {
  static async getOverviewMetrics() {
    return {
      metrics: {
        totalStudents: 1240,
        totalFaculty: 48,
        totalRecruiters: 35,
        totalAdmins: 4,
        verifiedSkillsCount: 3820,
        averagePlacementReadiness: 81.4,
        aiJobsCompletedToday: 342,
        pendingVerifications: 19
      },
      placementBreakdown: {
        ready: 650,        // Score >= 80%
        inProgress: 470,   // Score 60-79%
        needsSupport: 120  // Score < 60%
      },
      topSkillsDistribution: [
        { name: 'Python', count: 910, averageScore: 84 },
        { name: 'Data Structures & Algorithms', count: 870, averageScore: 76 },
        { name: 'React / Frontend', count: 740, averageScore: 82 },
        { name: 'Database / MongoDB', count: 680, averageScore: 78 },
        { name: 'Machine Learning', count: 420, averageScore: 71 }
      ],
      systemHealth: {
        database: 'connected',
        aiService: 'healthy',
        storage: 'operational',
        uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 3600)
      }
    };
  }
}
