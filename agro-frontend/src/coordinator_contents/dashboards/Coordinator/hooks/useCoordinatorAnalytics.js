/* eslint-disable no-unused-vars */
// src/hooks/useCoordinatorAnalytics.js
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";

export default function useCoordinatorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      console.log("[CoordinatorAnalytics] Fetching analytics...");

      const response = await axiosInstance.get("/api/coordinator/analytics", {
        signal, // 👈 abort support
      });

      console.log("[CoordinatorAnalytics] API raw response:", response.data);

      // ✅ normalize data
      const parsed = {
        ...response.data,
        total_beneficiaries: Number(response.data.total_beneficiaries) || 0,
        total_hectares: Number(response.data.total_hectares) || 0,
        farm_distribution: (response.data.farm_distribution || []).map((f) => ({
          ...f,
          area: Number(f.area) || 0,
          percentage: Number(f.percentage) || 0,
        })),
        top_commodities: (response.data.top_commodities || []).map((c) => ({
          ...c,
          area: Number(c.area) || 0,
        })),
        monthly_assignments: (response.data.monthly_assignments || []).map((m) => ({
          ...m,
          count: Number(m.count) || 0,
        })),
      };

      setData(parsed);
      console.log("[CoordinatorAnalytics] Parsed analytics data:", parsed);
    } catch (err) {
      if (err.name === "CanceledError") {
        console.warn("[CoordinatorAnalytics] Request cancelled");
        return;
      }

      console.error("[CoordinatorAnalytics] Fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while fetching analytics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // initial fetch
  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  // expose refetch so components can reload manually
  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch };
}