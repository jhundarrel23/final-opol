/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, isBefore } from 'date-fns';
import PropTypes from 'prop-types';
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	Avatar,
	Button,
	Stack,
	Paper,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Collapse,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Snackbar,
	Divider,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';

// Helper: compute actual status from dates + backend status
const getActualStatus = (program) => {
	const now = new Date();
	const startDate = program.startDate ? new Date(program.startDate) : null;
	const endDate = program.endDate ? new Date(program.endDate) : null;

	if (program.status === 'cancelled') return 'cancelled';
	if (program.status === 'completed') return 'completed';

	if (startDate && endDate) {
		if (isBefore(now, startDate)) return 'pending';
		if (isAfter(now, endDate)) return 'completed';
		if (!isBefore(now, startDate) && !isAfter(now, endDate)) return 'ongoing';
	}

	return program.status || 'pending';
};

const StatusChip = ({ status }) => {
	const statusConfig = {
		pending: {
			label: 'Upcoming',
			color: '#b45309',
			bgColor: '#fff7ed',
			icon: <AccessTimeIcon sx={{ fontSize: 14 }} />
		},
		ongoing: {
			label: 'Ongoing',
			color: '#075985',
			bgColor: '#e0f2fe',
			icon: <PlayArrowIcon sx={{ fontSize: 14 }} />
		},
		completed: {
			label: 'Completed',
			color: '#166534',
			bgColor: '#dcfce7',
			icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
		},
		cancelled: {
			label: 'Cancelled',
			color: '#991b1b',
			bgColor: '#fee2e2',
			icon: <CancelIcon sx={{ fontSize: 14 }} />
		}
	};

	const config = statusConfig[status] || statusConfig.pending;

	return (
		<Chip
			icon={config.icon}
			label={config.label}
			size="small"
			sx={{
				color: config.color,
				backgroundColor: config.bgColor,
				fontWeight: 600,
				fontSize: '0.75rem',
				height: 24,
				border: `1px solid ${config.color}22`,
				'& .MuiChip-icon': { color: config.color, fontSize: 14 }
			}}
		/>
	);
};

const ItemsTable = ({ items }) => {
	if (!items || items.length === 0) {
		return (
			<Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
				<InventoryIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
				<Typography variant="body2">No items specified for this program</Typography>
			</Box>
		);
	}

	const formatMoney = (v) => `₱${(Number(v) || 0).toLocaleString()}`;

	return (
		<TableContainer>
			<Table size="small">
				<TableHead>
					<TableRow sx={{ bgcolor: '#f8fafc' }}>
						<TableCell sx={{ fontWeight: 700, color: '#374151' }}>Item Name</TableCell>
						<TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Qty</TableCell>
						<TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Unit</TableCell>
						<TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>Value</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{items.map((item, index) => (
						<TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
							<TableCell sx={{ fontWeight: 600, color: '#111827' }}>{item.item_name}</TableCell>
							<TableCell align="center" sx={{ color: '#475569' }}>{item.quantity}</TableCell>
							<TableCell align="center" sx={{ color: '#475569' }}>{item.unit}</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
								{item.total_value != null ? formatMoney(item.total_value) : '-'}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

const BeneficiaryModal = ({ open, onClose, program }) => {
	if (!program) return null;

	const money = (v) => `₱${(Number(v) || 0).toLocaleString()}`;

	const items = Array.isArray(program.items) ? program.items : [];
	const unclaimedItems = items.filter(i => i.status === 'unclaimed');
	const distributedItems = items.filter(i => i.status === 'distributed');
	const pendingItems = items.filter(i => i.status !== 'distributed' && i.status !== 'unclaimed');

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e2e8f0' }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar sx={{ bgcolor: '#3b82f6', width: 48, height: 48 }}>
						<StarIcon />
					</Avatar>
					<Box>
						<Typography variant="h5" fontWeight={800} color="#0f172a">
							Program Benefit Details
						</Typography>
						<Typography variant="body2" color="#64748b">
							{program.programTitle || program.title}
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ pt: 3 }}>
				<Alert
					severity="info"
					sx={{
						mb: 3,
						bgcolor: '#e0f2fe',
						color: '#075985',
						border: '1px solid #bae6fd',
						'& .MuiAlert-icon': { color: '#0284c7' }
					}}
				>
					<Typography variant="body2" fontWeight={600}>
						You will receive {program.totalItems || 0} items with a total value of {money(program.totalValue)}.
					</Typography>
				</Alert>

				{program.description && (
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
							Description
						</Typography>
						<Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
							<Typography variant="body2" sx={{ lineHeight: 1.7, color: '#334155' }}>
								{program.description}
							</Typography>
						</Paper>
					</Box>
				)}

				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12} sm={6}>
						<Paper sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<CalendarTodayIcon sx={{ color: '#b45309', fontSize: 18 }} />
								<Box>
									<Typography variant="caption" fontWeight={700} color="#b45309">
										START
									</Typography>
									<Typography variant="body2" fontWeight={700} color="#92400e">
										{program.startDate ? format(new Date(program.startDate), 'MMM dd, yyyy') : 'TBD'}
									</Typography>
								</Box>
							</Stack>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Paper sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: 2, border: '1px solid #fca5a5' }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<CalendarTodayIcon sx={{ color: '#991b1b', fontSize: 18 }} />
								<Box>
									<Typography variant="caption" fontWeight={700} color="#991b1b">
										END
									</Typography>
									<Typography variant="body2" fontWeight={700} color="#7f1d1d">
										{program.endDate ? format(new Date(program.endDate), 'MMM dd, yyyy') : 'TBD'}
									</Typography>
								</Box>
							</Stack>
						</Paper>
					</Grid>
				</Grid>

				{items.length > 0 && (
					<Box>
						<Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
							Your Items
						</Typography>
						<Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
							<ItemsTable items={items} />
						</Paper>

						{unclaimedItems.length > 0 && (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: '#991b1b' }}>
									Unclaimed Items
								</Typography>
								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<TableContainer>
										<Table size="small">
											<TableHead>
												<TableRow sx={{ bgcolor: '#fff1f2' }}>
													<TableCell sx={{ fontWeight: 700, color: '#7f1d1d' }}>Item</TableCell>
													<TableCell align="center" sx={{ fontWeight: 700, color: '#7f1d1d' }}>Qty</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#7f1d1d' }}>Reason</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{unclaimedItems.map((item, idx) => (
													<TableRow key={idx}>
														<TableCell sx={{ fontWeight: 600 }}>{item.item_name}</TableCell>
														<TableCell align="center">{item.quantity}</TableCell>
														<TableCell sx={{ color: '#7f1d1d' }}>{item.coordinator_notes || 'Unclaimed'}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</Paper>
							</Box>
						)}
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
				<Button
					onClick={onClose}
					variant="contained"
					size="large"
					sx={{
						bgcolor: '#3b82f6',
						'&:hover': { bgcolor: '#2563eb' },
						borderRadius: 2,
						px: 4
					}}
				>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ProgramRow = ({ program, onToggleExpand, isExpanded, onShowBeneficiaryInfo }) => {
	const actualStatus = getActualStatus(program);
	const unclaimedCount = (Array.isArray(program.items) ? program.items : []).filter((i) => i.status === 'unclaimed').length;

	const money = (v) => `₱${(Number(v) || 0).toLocaleString()}`;

	return (
		<>
			<TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
				<TableCell>
					<Stack spacing={0.5}>
						<Stack direction="row" spacing={1} alignItems="center">
							<Typography variant="body1" fontWeight={800} sx={{ color: '#111827' }}>
								{program.programTitle || program.title}
							</Typography>
							<IconButton
								size="small"
								onClick={() => onShowBeneficiaryInfo(program)}
								sx={{ color: '#2563eb', '&:hover': { bgcolor: '#eff6ff' } }}
								title="View beneficiary details"
							>
								<StarIcon fontSize="small" />
							</IconButton>
						</Stack>
						<Typography variant="caption" color="#6b7280">
							{program.programID || `SP-${program.id}`}
						</Typography>
					</Stack>
				</TableCell>

				<TableCell>
						<Stack direction="row" spacing={1.5} alignItems="center">
						<Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32 }}>
							<PersonIcon fontSize="small" />
						</Avatar>
						<Box>
							<Typography variant="body2" fontWeight={600} sx={{ color: '#111827' }}>
								{program.creatorName}
							</Typography>
							<Typography variant="caption" color="#6b7280">
								{program.creatorRole}
							</Typography>
						</Box>
							{unclaimedCount > 0 && (
								<Chip
									label={`Unclaimed ${unclaimedCount}`}
									color="error"
									size="small"
									sx={{ height: 20, fontSize: '0.7rem' }}
								/>
							)}
					</Stack>
				</TableCell>

				<TableCell><StatusChip status={actualStatus} /></TableCell>

				<TableCell>
					<Typography variant="body2" sx={{ color: '#1f2937' }}>
						{program.startDate ? format(new Date(program.startDate), 'MMM dd, yyyy') : 'TBD'}
					</Typography>
				</TableCell>

				<TableCell>
					<Typography variant="body2" sx={{ color: '#1f2937' }}>
						{program.endDate ? format(new Date(program.endDate), 'MMM dd, yyyy') : 'TBD'}
					</Typography>
				</TableCell>

				<TableCell align="center">
					<Typography variant="body1" fontWeight={800} sx={{ color: '#111827' }}>
						{program.totalItems || 0}
					</Typography>
				</TableCell>

				<TableCell align="right">
					<Typography variant="body1" fontWeight={800} sx={{ color: '#111827' }}>
						{money(program.totalValue)}
					</Typography>
				</TableCell>

				<TableCell align="center">
					<IconButton
						size="small"
						onClick={() => onToggleExpand(program.id)}
						sx={{
							transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s ease',
							color: '#6b7280'
						}}
					>
						<ExpandMoreIcon />
					</IconButton>
				</TableCell>
			</TableRow>

			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
					<Collapse in={isExpanded} timeout="auto" unmountOnExit>
						<Box sx={{ py: 3, px: 2, bgcolor: '#fbfbfc' }}>
							<Grid container spacing={2}>
								{program.description && (
									<Grid item xs={12} md={7}>
										<Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: '#111827' }}>
											Program Description
										</Typography>
										<Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
											<Typography variant="body2" sx={{ lineHeight: 1.7, color: '#374151' }}>
												{program.description}
											</Typography>
										</Paper>
									</Grid>
								)}

								<Grid item xs={12} md={program.description ? 5 : 12}>
									<Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: '#111827' }}>
										Beneficiary Status
									</Typography>
									<Alert
										severity="success"
										sx={{
											bgcolor: '#ecfdf5',
											color: '#065f46',
											border: '1px solid #a7f3d0',
											'& .MuiAlert-icon': { color: '#10b981' }
										}}
										action={
											<Button
												color="inherit"
												size="small"
												onClick={() => onShowBeneficiaryInfo(program)}
												sx={{ fontWeight: 700 }}
											>
												View Details
											</Button>
										}
									>
										<Typography variant="body2" fontWeight={600}>
											You are a confirmed beneficiary of this program
										</Typography>
									</Alert>

									{program.approver && (
										<Box sx={{ mt: 2 }}>
											<Paper sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
												<Stack direction="row" spacing={1} alignItems="center">
													<VerifiedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
													<Typography variant="body2" color="#1e3a8a" fontWeight={600}>
														Approved by: {program.approver}
													</Typography>
												</Stack>
											</Paper>
										</Box>
									)}
								</Grid>
							</Grid>

							<Divider sx={{ my: 3 }} />

							<Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: '#111827' }}>
								Items You'll Receive
							</Typography>
							<Paper variant="outlined" sx={{ borderRadius: 2 }}>
								<ItemsTable items={program.items} />
							</Paper>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

const hasUnclaimedItems = (program) => {
  const items = Array.isArray(program.items) ? program.items : [];
  return items.some((i) => i.status === 'unclaimed');
};

const applyFilters = (programs, filters) => {
	return programs.filter((program) => {
		let matches = true;
		const actualStatus = getActualStatus(program);

		if (filters.status && actualStatus !== filters.status) matches = false;

		if (filters.hasUnclaimed === 'yes' && !hasUnclaimedItems(program)) matches = false;
		if (filters.hasUnclaimed === 'no' && hasUnclaimedItems(program)) matches = false;

		if (filters.search) {
			const s = filters.search.toLowerCase();
			const title = (program.programTitle || program.title || '').toLowerCase();
			const creator = (program.creatorName || '').toLowerCase();
			matches = matches && (title.includes(s) || creator.includes(s));
		}

		return matches;
	});
};

const SubsidyTable = ({ subsidyPrograms }) => {
	const navigate = useNavigate();
	const [expandedPrograms, setExpandedPrograms] = useState([]);
	const [filters, setFilters] = useState({ status: '', search: '', hasUnclaimed: '' });
	const [selectedProgram, setSelectedProgram] = useState(null);
	const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
	const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
	const [showInitialNotification, setShowInitialNotification] = useState(false);

	// Only show active (pending/ongoing)
	const activePrograms = subsidyPrograms.filter(program => {
		const actual = getActualStatus(program);
		return actual === 'pending' || actual === 'ongoing';
	});

	const statusOptions = [
		{ value: '', label: 'All Active Programs' },
		{ value: 'pending', label: 'Upcoming' },
		{ value: 'ongoing', label: 'Active' }
	];

	const handleToggleExpand = (programId) => {
		setExpandedPrograms(prev =>
			prev.includes(programId) ? prev.filter(id => id !== programId) : [...prev, programId]
		);
	};

	const handleShowBeneficiaryInfo = (program) => {
		setSelectedProgram(program);
		setShowBeneficiaryModal(true);
	};

	const handleCloseModal = () => {
	 setShowBeneficiaryModal(false);
	 setSelectedProgram(null);
	};

	const handleViewHistory = () => navigate('/beneficiary/beneficiary-subsidy-history');

	const filteredPrograms = applyFilters(activePrograms, filters);

	const getStatusCounts = () => {
		const counts = { pending: 0, ongoing: 0 };
		activePrograms.forEach(program => {
			const s = getActualStatus(program);
			if (s === 'pending' || s === 'ongoing') counts[s] = (counts[s] || 0) + 1;
		});
		return counts;
	};

	const statusCounts = getStatusCounts();

	useEffect(() => {
		if (activePrograms && activePrograms.length > 0) {
			const timer = setTimeout(() => setShowWelcomeMessage(true), 600);
			const notificationTimer = setTimeout(() => setShowInitialNotification(true), 300);
			return () => { clearTimeout(timer); clearTimeout(notificationTimer); };
		}
	}, [activePrograms]);

	return (
		<Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
			{/* Initial Notification (does not hide header actions) */}
			<Snackbar
				open={showInitialNotification}
				autoHideDuration={4000}
				onClose={() => setShowInitialNotification(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert
					onClose={() => setShowInitialNotification(false)}
					severity="info"
					variant="filled"
					sx={{
						minWidth: 300,
						bgcolor: '#3b82f6',
						'& .MuiAlert-icon': { color: 'white' }
					}}
				>
					<Typography variant="body2" fontWeight={600}>
						{activePrograms.length > 0
							? 'You have active subsidy programs! Check your benefits below.'
							: 'No active subsidies right now. You can still review your history.'}
					</Typography>
				</Alert>
			</Snackbar>

			{/* Welcome Message */}
			<Snackbar
				open={showWelcomeMessage && activePrograms.length > 0}
				autoHideDuration={6000}
				onClose={() => setShowWelcomeMessage(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<Alert
					onClose={() => setShowWelcomeMessage(false)}
					severity="success"
					variant="filled"
					sx={{ bgcolor: '#22c55e', '& .MuiAlert-icon': { color: 'white' } }}
					action={
						<IconButton size="small" aria-label="close" color="inherit" onClick={() => setShowWelcomeMessage(false)}>
							<CloseIcon fontSize="small" />
						</IconButton>
					}
				>
					<Typography variant="body2" fontWeight={600}>
						Welcome! You have {activePrograms.length} active program{activePrograms.length !== 1 ? 's' : ''}.
					</Typography>
				</Alert>
			</Snackbar>

			<Box sx={{ p: 4 }}>
				{/* Header (View History is ALWAYS visible) */}
				<Box mb={3}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
						<Box>
							<Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#0f172a' }}>
								Active Subsidy Programs
							</Typography>
							<Typography variant="body1" color="#64748b">
								Track your current government subsidy program benefits
							</Typography>
						</Box>

						<Button
							variant="outlined"
							startIcon={<HistoryIcon />}
							onClick={handleViewHistory}
							sx={{
								borderRadius: 2,
								textTransform: 'none',
								fontWeight: 700,
								borderColor: '#e5e7eb',
								color: '#374151',
								px: 3,
								py: 1.2,
								minWidth: 160,
								'&:hover': {
									borderColor: '#2563eb',
									color: '#2563eb',
									bgcolor: '#f0f9ff'
								}
							}}
						>
							View History
						</Button>
					</Stack>
				</Box>

				{/* Status Overview */}
				<Grid container spacing={3} mb={3}>
					<Grid item xs={12} sm={6}>
						<Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '1px solid #e5e7eb' }}>
							<Typography variant="h3" fontWeight={900} sx={{ color: '#b45309', lineHeight: 1 }}>
								{statusCounts.pending}
							</Typography>
								<Typography variant="body2" color="#64748b" fontWeight={700}>
									Upcoming Programs
								</Typography>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '1px solid #e5e7eb' }}>
							<Typography variant="h3" fontWeight={900} sx={{ color: '#075985', lineHeight: 1 }}>
								{statusCounts.ongoing}
							</Typography>
							<Typography variant="body2" color="#64748b" fontWeight={700}>
								Ongoing Programs
							</Typography>
						</Paper>
					</Grid>
				</Grid>

				{/* Filters */}
				<Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
					<CardContent sx={{ p: 3 }}>
						<Grid container spacing={3} alignItems="center">
							<Grid item xs={12} md={5}>
								<TextField
									fullWidth
									size="small"
									placeholder="Search active programs (title, creator)..."
									value={filters.search}
									onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon color="action" />
											</InputAdornment>
										)
									}}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
								/>
							</Grid>
							<Grid item xs={12} md={3}>
								<FormControl fullWidth size="small">
									<InputLabel>Status</InputLabel>
									<Select
										value={filters.status}
										label="Status"
										onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
										sx={{ borderRadius: 2 }}
									>
										{statusOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={4}>
								<FormControl fullWidth size="small">
									<InputLabel>Has Unclaimed</InputLabel>
									<Select
										value={filters.hasUnclaimed}
										label="Has Unclaimed"
										onChange={(e) => setFilters(prev => ({ ...prev, hasUnclaimed: e.target.value }))}
										sx={{ borderRadius: 2 }}
									>
										<MenuItem value="">All</MenuItem>
										<MenuItem value="yes">Yes</MenuItem>
										<MenuItem value="no">No</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={4}>
								<Stack direction="row" spacing={1} alignItems="center">
									<FilterListIcon color="action" />
									<Typography variant="body2" color="#64748b" fontWeight={700}>
										{applyFilters(activePrograms, filters).length} program{applyFilters(activePrograms, filters).length !== 1 ? 's' : ''} found
									</Typography>
								</Stack>
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				{/* Programs Table or Empty State (History button always available in header) */}
				{applyFilters(activePrograms, filters).length > 0 ? (
					<Paper sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow sx={{ bgcolor: '#f8fafc' }}>
										<TableCell sx={{ fontWeight: 800, color: '#111827' }}>Program</TableCell>
										<TableCell sx={{ fontWeight: 800, color: '#111827' }}>Creator</TableCell>
										<TableCell sx={{ fontWeight: 800, color: '#111827' }}>Status</TableCell>
										<TableCell sx={{ fontWeight: 800, color: '#111827' }}>Start</TableCell>
										<TableCell sx={{ fontWeight: 800, color: '#111827' }}>End</TableCell>
										<TableCell align="center" sx={{ fontWeight: 800, color: '#111827' }}>Items</TableCell>
										<TableCell align="right" sx={{ fontWeight: 800, color: '#111827' }}>Total Value</TableCell>
										<TableCell align="center" sx={{ fontWeight: 800, color: '#111827' }}>Details</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{applyFilters(activePrograms, filters).map((program) => (
										<ProgramRow
											key={program.id}
										 program={program}
										 onToggleExpand={handleToggleExpand}
										 onShowBeneficiaryInfo={handleShowBeneficiaryInfo}
										 isExpanded={expandedPrograms.includes(program.id)}
										/>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				) : (
					<Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: '1px solid #e5e7eb' }}>
						<InventoryIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
						<Typography variant="h5" color="#374151" gutterBottom fontWeight={900}>
							No Active Programs Found
						</Typography>
						<Typography variant="body1" color="#6b7280" sx={{ mb: 2 }}>
							{filters.status || filters.search
								? 'No active programs match your current filters.'
								: 'You currently have no active subsidies.'}
						</Typography>
						<Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
							You can still review your previous subsidies anytime.
						</Typography>
						<Button
							variant="outlined"
							startIcon={<HistoryIcon />}
							onClick={handleViewHistory}
							sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
						>
							View Program History
						</Button>
					</Paper>
				)}
			</Box>

			{/* Beneficiary Modal */}
			<BeneficiaryModal
				open={showBeneficiaryModal}
				onClose={handleCloseModal}
				program={selectedProgram}
			/>
		</Box>
	);
};

SubsidyTable.propTypes = {
	subsidyPrograms: PropTypes.array.isRequired
};

SubsidyTable.defaultProps = {
	subsidyPrograms: []
};

export default SubsidyTable;