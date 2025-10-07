/* eslint-disable no-unused-vars */
// Coordinator Overview - clean, high-signal overview for coordinators
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Box,
	Grid,
	Card,
	CardContent,
	CardActions,
	Button,
	Typography,
	IconButton,
	Divider,
	Stack,
	Chip,
	Avatar,
	Tooltip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert,
	Skeleton,
} from "@mui/material";
import {
	Refresh,
	EventAvailable,
	AssignmentInd,
	PlaylistAddCheck,
	Map,
	ArrowForward,
	TrendingUp,
	PeopleAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import useCoordinatorAnalytics from "./hooks/useCoordinatorAnalytics";

const cardMotion = { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 260, damping: 20 } };

const StatCard = ({ title, value, subtitle, icon, color, bg }) => (
	<motion.div {...cardMotion}>
		<Card sx={{ borderRadius: 3, boxShadow: 3, background: bg || "white" }}>
			<CardContent>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar variant="rounded" sx={{ bgcolor: color || "primary.main", color: "#fff", boxShadow: 1 }}>
						{icon}
					</Avatar>
					<Box flex={1}>
						<Typography variant="overline" color="text.secondary">
							{title}
						</Typography>
						<Typography variant="h4" fontWeight={800}>
							{value}
						</Typography>
						{subtitle && (
							<Typography variant="body2" color="text.secondary">
								{subtitle}
							</Typography>
						)}
					</Box>
				</Stack>
			</CardContent>
		</Card>
	</motion.div>
);

export default function CoordinatorOverview() {
	const navigate = useNavigate();
	const { data, loading, error, refetch } = useCoordinatorAnalytics();

	const formatNumber = (n, digits = 2) => {
		const num = Number(n || 0);
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
		if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
		return num.toFixed ? num.toFixed(digits) : num;
	};

	const monthlyAssignments = useMemo(() => data?.monthly_assignments || [], [data]);
	const recentTopCommodities = useMemo(() => (data?.top_commodities || []).slice(0, 5), [data]);
	const farmDistribution = useMemo(() => data?.farm_distribution || [], [data]);

	const radialProgress = useMemo(() => {
		// Fake completion metric from distribution/assignments if not provided
		const total = monthlyAssignments.reduce((a, b) => a + (Number(b.count) || 0), 0);
		const max = Math.max(1, ...monthlyAssignments.map((m) => Number(m.count) || 0));
		const pct = Math.min(100, Math.round((total / (max * 12 || 1)) * 100));
		return {
			series: [pct],
			options: {
				chart: { type: "radialBar", sparkline: { enabled: true } },
				colors: ["#16a34a"],
				plotOptions: {
					radialBar: {
						hollow: { size: "58%" },
						dataLabels: {
							name: { show: true, offsetY: 8 },
							value: { show: true, fontSize: "28px", fontWeight: 800, formatter: (v) => `${v}%` },
							total: { show: true, label: "Progress" },
						},
					},
				},
				stroke: { lineCap: "round" },
				labels: ["Completion"],
			},
		};
	}, [monthlyAssignments]);

	const areaSpark = useMemo(() => {
		const labels = monthlyAssignments.map((m) => m.month);
		const series = [{ name: "Assignments", data: monthlyAssignments.map((m) => Number(m.count) || 0) }];
		return {
			series,
			options: {
				chart: { type: "area", sparkline: { enabled: true }, toolbar: { show: false } },
				stroke: { curve: "smooth", width: 3 },
				fill: { type: "gradient", gradient: { opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 100] } },
				colors: ["#2563eb"],
				tooltip: { y: { title: { formatter: () => "Assignments" } } },
			},
		};
	}, [monthlyAssignments]);

	// Option 1: Using navigate
	const handleNavigation = (path) => {
		console.log('Navigating to:', path);
		try {
			navigate(path);
		} catch (error) {
			console.error('Navigation error:', error);
			// Fallback: Use window.location
			window.location.href = path;
		}
	};

	// Option 2: Direct link navigation
	const handleDirectNavigation = (path) => {
		window.location.href = path;
	};

	return (
		<Box sx={{ p: 3 }}>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
						<Box>
							<Typography variant="h4" fontWeight={800}>
								Coordinator Overview
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Your at-a-glance summary of program activity and assignments
							</Typography>
						</Box>
						<Tooltip title="Refresh data">
							<IconButton onClick={refetch} color="primary">
								<Refresh />
							</IconButton>
						</Tooltip>
					</Box>
					<Divider />
				</Grid>

				{loading && (
					<>
						{Array.from({ length: 4 }).map((_, i) => (
							<Grid item xs={12} md={3} key={i}>
								<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
									<CardContent>
										<Skeleton variant="rectangular" height={18} width={120} sx={{ mb: 1 }} />
										<Skeleton variant="text" height={48} sx={{ mb: 1 }} />
										<Skeleton variant="text" width={140} />
									</CardContent>
								</Card>
							</Grid>
						))}
						<Grid item xs={12}>
							<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
								<CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
									<CircularProgress />
								</CardContent>
							</Card>
						</Grid>
					</>
				)}

				{error && !loading && (
					<Grid item xs={12}>
						<Alert
							severity="error"
							action={
								<IconButton color="inherit" size="small" onClick={refetch}>
									<Refresh fontSize="inherit" />
								</IconButton>
							}
							sx={{ borderRadius: 2 }}
						>
							{error}
						</Alert>
					</Grid>
				)}

				{data && !loading && !error && (
					<>
						{/* Top stats */}
						<Grid item xs={12} md={3}>
							<StatCard
								title="Beneficiaries"
								value={formatNumber(data.total_beneficiaries, 0)}
								subtitle="Assigned to you"
								icon={<PeopleAlt />}
								color="primary.main"
								bg="linear-gradient(135deg,#dbeafe,#eff6ff)"
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<StatCard
								title="Total Hectares"
								value={data.total_hectares?.toFixed?.(2) ?? data.total_hectares ?? 0}
								subtitle="Allocated across commodities"
								icon={<Map />}
								color="success.main"
								bg="linear-gradient(135deg,#dcfce7,#f0fdf4)"
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<StatCard
								title="Parcels"
								value={formatNumber(data.parcels_count ?? 0, 0)}
								subtitle="Distinct farm parcels"
								icon={<AssignmentInd />}
								color="secondary.main"
								bg="linear-gradient(135deg,#ede9fe,#faf5ff)"
							/>
						</Grid>

						{/* Progress + Sparkline */}
						<Grid item xs={12} md={4}>
							<motion.div {...cardMotion}>
								<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
									<CardContent>
										<Typography variant="h6" gutterBottom>
											Program Progress
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Box display="flex" justifyContent="center" alignItems="center">
											<Chart options={radialProgress.options} series={radialProgress.series} type="radialBar" height={260} />
										</Box>
									</CardContent>
									<CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
										<Button size="small" endIcon={<ArrowForward />}>
											View details
										</Button>
									</CardActions>
								</Card>
							</motion.div>
						</Grid>

						<Grid item xs={12} md={8}>
							<motion.div {...cardMotion}>
								<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
									<CardContent>
										<Typography variant="h6" gutterBottom>
											Assignments Trend
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Box sx={{ px: 1 }}>
											{monthlyAssignments.length === 0 ? (
												<Typography variant="body2" color="text.secondary">
													No monthly assignment data yet.
												</Typography>
											) : (
												<Chart options={areaSpark.options} series={areaSpark.series} type="area" height={260} />
											)}
										</Box>
									</CardContent>
								</Card>
							</motion.div>
						</Grid>

						{/* Recent commodities + Farm distribution table */}
						<Grid item xs={12} md={5}>
							<motion.div {...cardMotion}>
								<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
									<CardContent>
										<Typography variant="h6" gutterBottom>
											Top Commodities (by area)
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<Stack spacing={1}>
											{recentTopCommodities.length === 0 && (
												<Typography variant="body2" color="text.secondary">
													No commodity data available.
												</Typography>
											)}
											{recentTopCommodities.map((c, i) => (
												<Stack direction="row" key={i} justifyContent="space-between" alignItems="center">
													<Stack direction="row" spacing={1} alignItems="center">
														<Chip size="small" color="primary" variant="outlined" label={c.commodity_name} />
													</Stack>
													<Typography variant="body2" color="text.secondary">
														{formatNumber(c.area)} ha
													</Typography>
												</Stack>
											))}
										</Stack>
									</CardContent>
								</Card>
							</motion.div>
						</Grid>

						<Grid item xs={12} md={7}>
							<motion.div {...cardMotion}>
								<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
									<CardContent>
										<Typography variant="h6" gutterBottom>
											Farm Distribution
										</Typography>
										<Divider sx={{ mb: 2 }} />
										<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
											<Table size="small">
												<TableHead>
													<TableRow>
														<TableCell>Farm Type</TableCell>
														<TableCell align="right">Area (ha)</TableCell>
														<TableCell align="right">Percentage</TableCell>
														<TableCell align="right">Entries</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{(farmDistribution || []).map((row, i) => (
														<TableRow key={i} hover>
															<TableCell>
																<Chip size="small" label={row.farm_type} variant="outlined" color="primary" />
															</TableCell>
															<TableCell align="right">{formatNumber(row.area)}</TableCell>
															<TableCell align="right">{Number(row.percentage) || 0}%</TableCell>
															<TableCell align="right">{row.entries ?? 0}</TableCell>
														</TableRow>
													))}
													{farmDistribution.length === 0 && (
														<TableRow>
															<TableCell colSpan={4}>
																<Typography variant="body2" color="text.secondary">
																	No farm distribution data available.
																</Typography>
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</CardContent>
								</Card>
							</motion.div>
						</Grid>

						{/* Quick actions - Removed motion wrapper to fix click issues */}
						<Grid item xs={12}>
							<Card sx={{ borderRadius: 3, boxShadow: 3 }}>
								<CardContent>
									<Stack
										direction={{ xs: "column", sm: "row" }}
										justifyContent="space-between"
										alignItems={{ xs: "stretch", sm: "center" }}
										spacing={2}
									>
										<Typography variant="h6">Quick Actions</Typography>
										<Stack direction="row" spacing={1} flexWrap="wrap">
											<Button 
												variant="contained" 
												color="primary" 
												startIcon={<EventAvailable />} 
												sx={{ borderRadius: 2 }}
												onClick={() => handleNavigation('/coordinator/interviews')}
											>
												Schedule Activity
											</Button>
											<Button 
												variant="outlined" 
												color="success" 
												startIcon={<PlaylistAddCheck />} 
												sx={{ borderRadius: 2 }}
												onClick={() => handleNavigation('/coordinator/Beneficiary-list')}
											>
												Add Beneficiary
											</Button>
											<Button 
												variant="outlined" 
												startIcon={<ArrowForward />} 
												sx={{ borderRadius: 2 }}
												onClick={() => handleNavigation('/coordinator/program-management')}
											>
												View All Programs
											</Button>
										</Stack>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					</>
				)}
			</Grid>
		</Box>
	);
}