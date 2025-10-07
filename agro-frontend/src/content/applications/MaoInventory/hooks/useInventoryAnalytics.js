import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

/**
 * Corrected admin analytics hook that matches your controller methods exactly
 * @param {number} period - Number of days for analytics (default: 30)
 * @param {string|null} itemType - Optional filter for inventory analytics
 * @param {string|null} status - Optional filter for program analytics
 */
const useAdminAnalytics = (period = 30, itemType = null, status = null) => {
  const [data, setData] = useState({
    overview: null,
    inventory: null,
    programs: null,
    beneficiaries: null,
    financials: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all analytics in parallel - matching your controller endpoints
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters for each endpoint
      const inventoryParams = new URLSearchParams({ period: period.toString() });
      if (itemType) inventoryParams.append('item_type', itemType);

      const programParams = new URLSearchParams({ period: period.toString() });
      if (status) programParams.append('status', status);

      const beneficiaryParams = new URLSearchParams({ period: period.toString() });
      const financialParams = new URLSearchParams({ period: period.toString() });

      // Call the correct endpoints that match your controller methods
      const [
        overviewRes,
        inventoryRes,
        programsRes,
        beneficiariesRes,
        financialsRes,
      ] = await Promise.all([
        axiosInstance.get('api/admin/analytics/dashboard-overview'),
        axiosInstance.get(`api/admin/analytics/inventory?${inventoryParams.toString()}`),
        axiosInstance.get(`api/admin/analytics/programs?${programParams.toString()}`),
        axiosInstance.get(`api/admin/analytics/beneficiaries?${beneficiaryParams.toString()}`),
        axiosInstance.get(`api/admin/analytics/financials?${financialParams.toString()}`),
      ]);

      return {
        overview: overviewRes.data,
        inventory: inventoryRes.data,
        programs: programsRes.data,
        beneficiaries: beneficiariesRes.data,
        financials: financialsRes.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch admin analytics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [period, itemType, status]);

  // Load all analytics
  const loadAnalytics = useCallback(async () => {
    const analyticsData = await fetchAnalytics();
    if (analyticsData) {
      setData({
        ...analyticsData,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [fetchAnalytics]);

  // Auto-fetch on mount & when filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      const analyticsData = await fetchAnalytics();
      if (mounted && analyticsData) {
        setData({
          ...analyticsData,
          lastUpdated: new Date().toISOString(),
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchAnalytics]);

  // Public API
  const refresh = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // -------- Computed helpers based on your controller structure --------
  
  // Overview helpers
  const getInventorySummary = useCallback(
    () => data?.overview?.inventory_summary || null,
    [data]
  );

  const getProgramSummary = useCallback(
    () => data?.overview?.program_summary || null,
    [data]
  );

  const getBeneficiarySummary = useCallback(
    () => data?.overview?.beneficiary_summary || null,
    [data]
  );

  const getFinancialSummary = useCallback(
    () => data?.overview?.financial_summary || null,
    [data]
  );

  const getRecentActivity = useCallback(
    () => data?.overview?.recent_activity || [],
    [data]
  );

  // Inventory helpers
  const getStockLevels = useCallback(
    () => data?.inventory?.stock_levels || [],
    [data]
  );

  const getLowStockAlerts = useCallback(
    () => data?.inventory?.low_stock_alerts || [],
    [data]
  );

  const getStockMovements = useCallback(
    () => data?.inventory?.stock_movements || [],
    [data]
  );

  const getInventoryValueAnalysis = useCallback(
    () => data?.inventory?.value_analysis || null,
    [data]
  );

  const getTurnoverRates = useCallback(
    () => data?.inventory?.turnover_rates || [],
    [data]
  );

  const getExpiryAnalysis = useCallback(
    () => data?.inventory?.expiry_analysis || null,
    [data]
  );

  // Program helpers
  const getProgramPerformance = useCallback(
    () => data?.programs?.program_performance || [],
    [data]
  );

  const getCompletionRates = useCallback(
    () => data?.programs?.completion_rates || {},
    [data]
  );

  const getDistributionEfficiency = useCallback(
    () => data?.programs?.distribution_efficiency || null,
    [data]
  );

  const getCoordinatorPerformance = useCallback(
    () => data?.programs?.coordinator_performance || [],
    [data]
  );

  const getGeographicDistribution = useCallback(
    () => data?.programs?.geographic_distribution || [],
    [data]
  );

  const getItemPopularity = useCallback(
    () => data?.programs?.item_popularity || [],
    [data]
  );

  // Beneficiary helpers
  const getBeneficiaryDemographics = useCallback(
    () => data?.beneficiaries?.beneficiary_demographics || null,
    [data]
  );

  const getAssistanceDistribution = useCallback(
    () => data?.beneficiaries?.assistance_distribution || {},
    [data]
  );

  const getGeographicCoverage = useCallback(
    () => data?.beneficiaries?.geographic_coverage || [],
    [data]
  );

  const getRepeatBeneficiaries = useCallback(
    () => data?.beneficiaries?.repeat_beneficiaries || [],
    [data]
  );

  const getBeneficiaryValueDistribution = useCallback(
    () => data?.beneficiaries?.beneficiary_value_distribution || [],
    [data]
  );

  // Financial helpers
  const getTotalInventoryValue = useCallback(
    () => data?.financials?.total_inventory_value || 0,
    [data]
  );

  const getDistributionValueTrends = useCallback(
    () => data?.financials?.distribution_value_trends || [],
    [data]
  );

  const getCostPerBeneficiary = useCallback(
    () => data?.financials?.cost_per_beneficiary || null,
    [data]
  );

  const getBudgetUtilization = useCallback(
    () => data?.financials?.budget_utilization || [],
    [data]
  );

  const getValueByCategory = useCallback(
    () => data?.financials?.value_by_category || [],
    [data]
  );

  // Convenience helpers
  const getLowStockCount = useCallback(
    () => data?.inventory?.low_stock_alerts?.length || 0,
    [data]
  );

  const getCriticalStockItems = useCallback(
    () =>
      data?.inventory?.low_stock_alerts?.filter(
        (item) => item.alert_level === 'critical'
      ) || [],
    [data]
  );

  const getExpiringSoonCount = useCallback(
    () => data?.inventory?.expiry_analysis?.expiring_soon?.length || 0,
    [data]
  );

  const getItemsByType = useCallback(
    (type) =>
      data?.inventory?.stock_levels?.filter(
        (item) => item.item_type === type
      ) || [],
    [data]
  );

  const getStockStatusSummary = useCallback(() => {
    if (!data?.inventory?.stock_levels)
      return { good: 0, medium: 0, low: 0 };

    return data.inventory.stock_levels.reduce(
      (summary, item) => {
        summary[item.stock_status] =
          (summary[item.stock_status] || 0) + 1;
        return summary;
      },
      { good: 0, medium: 0, low: 0 }
    );
  }, [data]);

  const getTopTurnoverItems = useCallback(
    (limit = 10) => data?.inventory?.turnover_rates?.slice(0, limit) || [],
    [data]
  );

  return {
    // Raw data (matches your controller structure exactly)
    overview: data.overview,
    inventory: data.inventory,
    programs: data.programs,
    beneficiaries: data.beneficiaries,
    financials: data.financials,

    // State
    loading,
    error,
    lastUpdated: data.lastUpdated,

    // Actions
    refresh,
    fetchAnalytics,

    // Overview helpers
    getInventorySummary,
    getProgramSummary,
    getBeneficiarySummary,
    getFinancialSummary,
    getRecentActivity,

    // Inventory helpers
    getStockLevels,
    getLowStockAlerts,
    getStockMovements,
    getInventoryValueAnalysis,
    getTurnoverRates,
    getExpiryAnalysis,
    getLowStockCount,
    getCriticalStockItems,
    getExpiringSoonCount,
    getItemsByType,
    getStockStatusSummary,
    getTopTurnoverItems,

    // Program helpers
    getProgramPerformance,
    getCompletionRates,
    getDistributionEfficiency,
    getCoordinatorPerformance,
    getGeographicDistribution,
    getItemPopularity,

    // Beneficiary helpers
    getBeneficiaryDemographics,
    getAssistanceDistribution,
    getGeographicCoverage,
    getRepeatBeneficiaries,
    getBeneficiaryValueDistribution,

    // Financial helpers
    getTotalInventoryValue,
    getDistributionValueTrends,
    getCostPerBeneficiary,
    getBudgetUtilization,
    getValueByCategory,
  };
};

export default useAdminAnalytics;