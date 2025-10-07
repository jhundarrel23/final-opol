/* eslint-disable no-unused-vars */
// Coordinator Analytics Dashboard - polished, modern, and more visual
import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tooltip,
  Stack,
  Skeleton,
} from "@mui/material";
import { Refresh, BarChart, TableChart, Group, Map, Layers, Terrain } from "@mui/icons-material";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import useCoordinatorAnalytics from "./hooks/useCoordinatorAnalytics";

const KPI_CARDS = [
  { key: "total_beneficiaries", label: "Beneficiaries", icon: <Group />, color: "#2563eb", bg: "linear-gradient(135deg,#dbeafe,#eff6ff)" },
  { key: "total_hectares", label: "Total Hectares", icon: <Map />, color: "#16a34a", bg: "linear-gradient(135deg,#dcfce7,#f0fdf4)" },
  { key: "parcels_count", label: "Parcels", icon: <Layers />, color: "#9333ea", bg: "linear-gradient(135deg,#ede9fe,#faf5ff)" },
  { key: "total_farm_area_hectares", label: "Total Farm Area", icon: <Terrain />, color: "#f59e0b", bg: "linear-gradient(135deg,#fef3c7,#fffbeb)" },
];

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel" style={{ width: "100%" }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function CoordinatorAnalyticsDashboard() {
  const { data, loading, error, refetch } = useCoordinatorAnalytics();
  const [tab, setTab] = useState(0);
  const handleChange = (_event, newValue) => setTab(newValue);

  const formatNumber = (n, digits = 2) => {
    const num = Number(n || 0);
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toFixed ? num.toFixed(digits) : num;
  };

  // Memoized chart configs
  const farmDistribution = useMemo(() => data?.farm_distribution || [], [data]);
  const topCommodities = useMemo(() => (data?.top_commodities || []).slice(0, 10), [data]);
  const monthlyAssignments = useMemo(() => data?.monthly_assignments || [], [data]);

  const donutOptions = useMemo(() => {
    const labels = farmDistribution.map((r) => r.farm_type);
    const series = farmDistribution.map((r) => Number(r.area) || 0);
    return {
      options: {
        chart: { type: "donut", toolbar: { show: false } },
        labels,
        legend: { position: "bottom" },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        colors: ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#9333ea", "#06b6d4"],
        plotOptions: {
          pie: {
            donut: {
              size: "60%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total",
                  formatter: () => formatNumber(series.reduce((a, b) => a + b, 0)),
                },
              },
            },
          },
        },
        tooltip: {
          y: { formatter: (val) => `${formatNumber(val)} ha` },
        },
      },
      series,
    };
  }, [farmDistribution]);

  const commoditiesBarOptions = useMemo(() => {
    const categories = topCommodities.map((c) => c.commodity_name);
    const series = [
      {
        name: "Area (ha)",
        data: topCommodities.map((c) => Number(c.area) || 0),
      },
    ];
    return {
      options: {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        xaxis: { categories },
        dataLabels: { enabled: false },
        colors: ["#2563eb"],
        grid: { strokeDashArray: 3 },
        tooltip: { y: { formatter: (val) => `${formatNumber(val)} ha` } },
      },
      series,
    };
  }, [topCommodities]);

  const monthlyAreaOptions = useMemo(() => {
    const labels = monthlyAssignments.map((m) => m.month);
    const series = [{ name: "Assignments", data: monthlyAssignments.map((m) => Number(m.count) || 0) }];
    return {
      options: {
        chart: { background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { show: true, width: 3, colors: ["#16a34a"], curve: "smooth" },
        fill: {
          type: "gradient",
          gradient: { shade: "light", type: "vertical", opacityFrom: 0.7, opacityTo: 0.05, stops: [0, 100] },
        },
        colors: ["#16a34a"],
        dataLabels: { enabled: false },
        xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { tickAmount: 4 },
        grid: { strokeDashArray: 3 },
        tooltip: { y: { title: { formatter: () => "Assignments" } } },
      },
      series,
    };
  }, [monthlyAssignments]);

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Coordinator Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visual insights for your assigned beneficiaries and farm data
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
            {/* KPI CARDS */}
            {KPI_CARDS.map((kpi) => {
              const value =
                kpi.key === "total_hectares" || kpi.key === "total_farm_area_hectares"
                  ? data[kpi.key]?.toFixed?.(2) ?? data[kpi.key]
                  : data[kpi.key] ?? 0;
              return (
                <Grid item xs={12} md={3} key={kpi.key}>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, background: kpi.bg }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar variant="rounded" sx={{ bgcolor: "#fff", color: kpi.color, boxShadow: 1 }}>
                            {kpi.icon}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="overline" color="text.secondary">
                              {kpi.label}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">{value}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {kpi.label === "Beneficiaries" ? "Assigned to you" : kpi.label === "Parcels" ? "Distinct farm parcels" : "Aggregated"}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}

            {/* DISTRIBUTION + DETAILS */}
            <Grid item xs={12} md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Farm Distribution
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {farmDistribution.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No farm distribution data available.
                      </Typography>
                    ) : (
                      <Chart
                        options={donutOptions.options}
                        series={donutOptions.series}
                        type="donut"
                        height={280}
                      />
                    )}
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {(farmDistribution || []).map((r, i) => (
                        <Stack direction="row" key={i} justifyContent="space-between" alignItems="center">
                          <Chip size="small" label={r.farm_type} variant="outlined" color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(r.area)} ha • {Number(r.percentage) || 0}%
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* CHARTS AND TABLE */}
            <Grid item xs={12} md={8}>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Tabs value={tab} onChange={handleChange} textColor="primary" indicatorColor="primary" sx={{ mb: 1 }}>
                      <Tab icon={<BarChart />} label="Charts" />
                      <Tab icon={<TableChart />} label="Table" />
                    </Tabs>
                    <TabPanel value={tab} index={0}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            Top Commodities by Area
                          </Typography>
                          {topCommodities.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No commodity data available.</Typography>
                          ) : (
                            <Chart
                              options={commoditiesBarOptions.options}
                              series={commoditiesBarOptions.series}
                              type="bar"
                              height={360}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </TabPanel>
                    <TabPanel value={tab} index={1}>
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
                                  <Chip label={row.farm_type} color="primary" variant="outlined" />
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
                                    No farm type data available.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Monthly assignments chart */}
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Beneficiaries Assigned (last 12 months)
                    </Typography>
                    <Box sx={{ px: 1 }}>
                      {monthlyAssignments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No monthly assignment data yet.
                        </Typography>
                      ) : (
                        <Chart
                          options={monthlyAreaOptions.options}
                          series={monthlyAreaOptions.series}
                          type="area"
                          height={280}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>
            <Tooltip title="Refresh data">
              <IconButton onClick={refetch} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}