// src/beneficiary/hooks/useSubsidy.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const parsePrograms = (payload) => {
	if (!payload) return [];
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload.programs)) return payload.programs;
	if (Array.isArray(payload.programs?.data)) return payload.programs.data;
	return [];
};

const normalizeStats = (stats) => ({
	approved: Number(stats?.approved ?? 0),
	pending: Number(stats?.pending ?? 0),
	completed: Number(stats?.completed ?? 0),
	total: Number(stats?.total ?? 0),
	readyForPickup: Number(stats?.ready_for_pickup ?? 0),
});

const useSubsidy = () => {
	const [subsidyPrograms, setSubsidyPrograms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [notRegistered, setNotRegistered] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [stats, setStats] = useState({ 
		approved: 0, 
		pending: 0, 
		completed: 0, 
		total: 0,
		readyForPickup: 0
	});

	const fetchSubsidyPrograms = useCallback(async (showLoading = true) => {
		try {
			if (showLoading) setLoading(true);
			setError('');
			setNotRegistered(false);

			const res = await axiosInstance.get('/api/rsbsa/beneficiary/dashboard/overview');
			const programs = parsePrograms(res.data);
			const s = normalizeStats(res.data?.stats);

			setSubsidyPrograms(programs);
			setStats(s);
			setLastUpdated(new Date());
		} catch (err) {
			const status = err.response?.status;
			const message = err.response?.data?.message || err.message || 'Failed to fetch subsidy programs';

			if (status === 404 && message === 'You are not registered as a beneficiary.') {
				setNotRegistered(true);
				setSubsidyPrograms(parsePrograms(err.response?.data) || []);
				setStats({ approved: 0, pending: 0, completed: 0, total: 0, readyForPickup: 0 });
				setError('');
			} else {
				setError(message);
				setSubsidyPrograms([]);
				setNotRegistered(false);
				setStats({ approved: 0, pending: 0, completed: 0, total: 0, readyForPickup: 0 });
			}
		} finally {
			if (showLoading) setLoading(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchSubsidyPrograms(false);
		} finally {
			setRefreshing(false);
		}
	}, [fetchSubsidyPrograms]);

	const fetchProgramDetails = useCallback(async (programId) => {
		const res = await axiosInstance.get('/api/rsbsa/beneficiary/dashboard/programs');
		const list = Array.isArray(res.data) ? res.data : (res.data?.programs?.data || res.data?.programs || []);
		const program = list.find((p) => p.id === programId);
		if (!program) throw new Error('Program not found');
		return program;
	}, []);

	useEffect(() => {
		fetchSubsidyPrograms();
	}, [fetchSubsidyPrograms]);

	const totalPrograms = subsidyPrograms.length;
	const hasPrograms = totalPrograms > 0;

	const completedCount = useMemo(
		() => subsidyPrograms.filter((p) => p.status === 'completed').length,
		[subsidyPrograms]
	);
	const cancelledCount = useMemo(
		() => subsidyPrograms.filter((p) => ['cancelled', 'rejected', 'declined'].includes(p.status)).length,
		[subsidyPrograms]
	);
	const activeOrPendingCount = useMemo(
		() => subsidyPrograms.filter((p) => ['pending', 'ongoing', 'approved', 'under_review'].includes(p.status)).length,
		[subsidyPrograms]
	);

	const upcoming = useMemo(() => {
		const today = new Date();
		const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const parseDate = (d) => (d ? new Date(d) : null);

		return subsidyPrograms
			.map((p) => ({ ...p, _date: parseDate(p.expectedRelease ?? p.release_date ?? p.distribution_date) }))
			.filter((p) => p._date && p._date.toString() !== 'Invalid Date' && p._date >= startOfToday)
			.sort((a, b) => a._date - b._date);
	}, [subsidyPrograms]);

	return {
		subsidyPrograms,
		stats,
		upcoming,
		totalPrograms,
		hasPrograms,
		loading,
		refreshing,
		error,
		notRegistered,
		lastUpdated,
		completedCount,
		cancelledCount,
		activeOrPendingCount,
		fetchSubsidyPrograms,
		refresh,
		refetch: fetchSubsidyPrograms,
		fetchProgramDetails,
		clearError: () => {
			setError('');
			setNotRegistered(false);
		},
	};
};

export default useSubsidy;