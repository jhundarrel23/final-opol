/* eslint-disable consistent-return */
import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const useAdminDashboard = () => {
  const [sectorData, setSectorData] = useState([]);
  const [coordinatorData, setCoordinatorData] = useState([]);
  const [programsData, setProgramsData] = useState([]);
  const [coordinatorPerformanceData, setCoordinatorPerformanceData] = useState([]);
  const [distributionAnalytics, setDistributionAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [sectorRes, coordinatorRes, programsRes, performanceRes, analyticsRes] = await Promise.all([
        axiosInstance.get('api/admin/dashboard/sector-beneficiaries'),
        axiosInstance.get('api/admin/dashboard/coordinator-breakdown'),
        axiosInstance.get('api/admin/dashboard/sector-programs'),
        axiosInstance.get('api/admin/dashboard/coordinator-performance'),
        axiosInstance.get('api/analytics/dashboard') 
      ]);

      if (!isMounted) return;

      setSectorData(sectorRes.data.data || []);
      setCoordinatorData(coordinatorRes.data.data || []);
      setProgramsData(programsRes.data.data || []);
      setCoordinatorPerformanceData(performanceRes.data.data || []);
      setDistributionAnalytics(analyticsRes.data || null);
      setLastFetch(new Date());
    } catch (err) {
      if (!isMounted) return;
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');

      // Reset to safe defaults
      setSectorData([]);
      setCoordinatorData([]);
      setProgramsData([]);
      setCoordinatorPerformanceData([]);
      setDistributionAnalytics(null);
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived values
  const totalBeneficiaries = useMemo(
    () => sectorData.reduce((sum, sector) => sum + (sector.beneficiaries || 0), 0),
    [sectorData]
  );

  const totalCoordinators = useMemo(
    () => coordinatorData.reduce((sum, sector) => sum + (sector.coordinators?.length || 0), 0),
    [coordinatorData]
  );

  const totalPrograms = useMemo(
    () => programsData.reduce((sum, sector) => sum + (sector.total_programs || 0), 0),
    [programsData]
  );

  const programStatusSummary = useMemo(
    () =>
      programsData.reduce(
        (acc, sector) => {
          const status = sector.status || {};
          acc.ongoing += status.ongoing || 0;
          acc.completed += status.completed || 0;
          acc.pending += status.pending || 0;
          acc.cancelled += status.cancelled || 0;
          return acc;
        },
        { ongoing: 0, completed: 0, pending: 0, cancelled: 0 }
      ),
    [programsData]
  );

  const topCoordinator = useMemo(() => {
    const allCoordinators = coordinatorData.flatMap(sector =>
      (sector.coordinators || []).map(coord => ({
        ...coord,
        sectorName: sector.sector
      }))
    );

    return allCoordinators.reduce(
      (max, coord) =>
        (coord.beneficiaries || 0) > (max.beneficiaries || 0) ? coord : max,
      { beneficiaries: 0, coordinator: '', sectorName: '' }
    );
  }, [coordinatorData]);

  const topPerformingCoordinator = useMemo(() => {
    if (!coordinatorPerformanceData || coordinatorPerformanceData.length === 0) {
      return {
        coordinator_name: '',
        sector: '',
        metrics: { success_rate: 0, total_programs: 0 }
      };
    }
    return coordinatorPerformanceData[0];
  }, [coordinatorPerformanceData]);

  const distributionSummary = useMemo(() => {
    if (!distributionAnalytics) {
      return {
        totalPrograms: 0,
        ongoingPrograms: 0,
        completedPrograms: 0,
        totalBeneficiaries: 0,
        totalItems: 0,
        distributedItems: 0,
        pendingItems: 0,
        unclaimedItems: 0,
        completionRate: 0
      };
    }

    const summary = distributionAnalytics.summary || {};
    return {
      totalPrograms: summary.total_programs || 0,
      ongoingPrograms: summary.ongoing_programs || 0,
      completedPrograms: summary.completed_programs || 0,
      totalBeneficiaries: summary.total_beneficiaries || 0,
      totalItems: summary.total_items || 0,
      distributedItems: summary.distributed_items || 0,
      pendingItems: summary.pending_items || 0,
      unclaimedItems: summary.unclaimed_items || 0,
      completionRate: summary.completion_rate || 0
    };
  }, [distributionAnalytics]);

  const ongoingProgramsProgress = useMemo(() => {
    if (!distributionAnalytics?.ongoing_programs_progress) return [];
    return distributionAnalytics.ongoing_programs_progress.map(program => ({
      id: program.id,
      title: program.title,
      creator: program.creator,
      startDate: program.start_date,
      endDate: program.end_date,
      daysRemaining: program.days_remaining,
      beneficiaries: program.beneficiaries || [],
      progress: {
        completionRate: program.progress?.completion_rate || 0,
        distributedItems: program.progress?.distributed_items || 0,
        totalItems: program.progress?.total_items || 0,
        pendingItems: program.progress?.pending_items || 0
      },
      beneficiaryProgress: {
        completedBeneficiaries: program.beneficiary_progress?.completed_beneficiaries || 0,
        totalBeneficiaries: program.beneficiary_progress?.total_beneficiaries || 0,
        beneficiaryCompletionRate: program.beneficiary_progress?.beneficiary_completion_rate || 0
      }
    }));
  }, [distributionAnalytics]);

  const recentDistributions = useMemo(() => {
    if (!distributionAnalytics?.recent_distributions) return [];
    return distributionAnalytics.recent_distributions.map(distribution => ({
      distributedAt: distribution.distributed_at, // ✅ FIXED: changed from released_at
      itemName: distribution.item_name,
      quantity: distribution.quantity,
      unit: distribution.unit,
      totalValue: distribution.total_value,
      programTitle: distribution.program_title,
      beneficiaryName: distribution.beneficiary_name,
      barangay: distribution.barangay
    }));
  }, [distributionAnalytics]);

  return {
    // Raw data
    sectorData,
    coordinatorData,
    programsData,
    coordinatorPerformanceData,
    distributionAnalytics,

    // State
    loading,
    error,
    lastFetch,

    // Actions
    refreshData,

    // Computed values
    totalBeneficiaries,
    totalCoordinators,
    totalPrograms,
    programStatusSummary,
    topCoordinator,
    topPerformingCoordinator,

    // Distribution analytics
    distributionSummary,
    ongoingProgramsProgress,
    recentDistributions,

    // Helper flags
    hasData:
      sectorData.length > 0 ||
      coordinatorData.length > 0 ||
      programsData.length > 0,
    isEmpty:
      !loading &&
      sectorData.length === 0 &&
      coordinatorData.length === 0 &&
      programsData.length === 0,
    hasDistributionData: distributionAnalytics !== null
  };
};

export default useAdminDashboard;