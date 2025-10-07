/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	InputAdornment,
	Chip,
	Button,
	Stack,
	Paper,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Container,
	Divider,
	Alert
} from '@mui/material';
import {
	Search,
	History,
	CheckCircle,
	XCircle,
	AlertCircle,
	ArrowLeft,
	Calendar,
	ChevronRight,
	Package,
	FileText
} from 'lucide-react';

import useSubsidyHistory from './useSubsidyHistory';

// Item status chip - shows distributed/unclaimed/cancelled
const ItemStatusChip = ({ status }) => {
	const config = {
		distributed: { 
			label: 'Received', 
			color: 'success', 
			icon: <CheckCircle size={14} />
		},
		unclaimed: { 
			label: 'Unclaimed', 
			color: 'warning', 
			icon: <AlertCircle size={14} />
		},
		cancelled: { 
			label: 'Cancelled', 
			color: 'error', 
			icon: <XCircle size={14} />
		},
		pending: { 
			label: 'Pending', 
			color: 'default' 
		}
	};
	const c = config[status] || config.pending;
	
	return (
		<Chip 
			icon={c.icon} 
			label={c.label} 
			color={c.color} 
			size="small" 
			sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
		/>
	);
};

// Program status chip - shows completed/cancelled
const ProgramStatusChip = ({ status }) => {
	const config = {
		completed: { label: 'Completed', color: 'success' },
		cancelled: { label: 'Cancelled', color: 'error' }
	};
	const c = config[status] || config.completed;
	
	return (
		<Chip 
			label={c.label} 
			color={c.color} 
			size="small"
			sx={{ fontWeight: 600, px: 1.5 }}
		/>
	);
};

// Professional program card with cleaner layout
const ProgramCard = ({ program, onViewDetails }) => {
	const summary = program.items_summary || {};
	const date = program.end_date || program.created_at;
	const totalItems = summary.total_items || 0;
	const distributedItems = summary.distributed_items || 0;
	const unclaimedItems = summary.unclaimed_items || 0;

	return (
		<Card 
			sx={{ 
				mb: 2.5, 
				'&:hover': { 
					boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
					transform: 'translateY(-2px)'
				}, 
				transition: 'all 0.3s ease',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
				overflow: 'hidden'
			}}
		>
			<CardContent sx={{ p: 3 }}>
				{/* Header Section */}
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} mb={2.5}>
					<Box flex={1} minWidth={0}>
						<Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'text.primary', mb: 1 }}>
							{program.title}
						</Typography>
						<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Calendar size={16} color="#666" />
								<Typography variant="body2" color="text.secondary" fontWeight={500}>
									Ended:
								</Typography>
								<Typography variant="body2" color="text.primary" fontWeight={600}>
									{date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A'}
								</Typography>
							</Stack>
							<ProgramStatusChip status={program.status} />
						</Stack>
					</Box>
				</Stack>

				{/* Stats Section - Inline with dividers */}
				<Stack 
					direction="row" 
					spacing={3} 
					divider={<Divider orientation="vertical" flexItem />}
					sx={{ mb: 2.5, py: 2, px: 1 }}
				>
					<Box flex={1} textAlign="center">
						<Typography variant="h5" fontWeight={700} color="text.primary">
							{totalItems}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
							Total Items
						</Typography>
					</Box>
					<Box flex={1} textAlign="center">
						<Typography variant="h5" fontWeight={700} color="success.main">
							{distributedItems}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
							Received
						</Typography>
					</Box>
					<Box flex={1} textAlign="center">
						<Typography variant="h5" fontWeight={700} color="warning.main">
							{unclaimedItems}
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
							Unclaimed
						</Typography>
					</Box>
				</Stack>

				{/* View Details Button */}
				<Button 
					variant="outlined" 
					size="medium"
					endIcon={<ChevronRight size={18} />}
					onClick={() => onViewDetails(program)}
					fullWidth
					sx={{ 
						textTransform: 'none',
						fontWeight: 600,
						borderWidth: 1.5,
						'&:hover': {
							borderWidth: 1.5,
							bgcolor: 'primary.main',
							color: 'white'
						}
					}}
				>
					View Details
				</Button>
			</CardContent>
		</Card>
	);
};

// Details modal - cleaner layout
const DetailsModal = ({ open, onClose, program }) => {
	if (!program) return null;

	// API returns items in beneficiaries array
	const beneficiary = program.beneficiaries?.[0];
	const items = beneficiary?.items || [];
	const summary = program.items_summary || {};
	
	// Access creator/approver info - handle the nested sector object
	const creator = program.creator || null;
	const approver = program.approver || null;
	const sectorName = creator?.sector?.sector_name || creator?.sector || 'N/A';

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ pb: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" fontWeight={700}>
							{program.title}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Program #{program.id}
						</Typography>
					</Box>
					<ProgramStatusChip status={program.status} />
				</Stack>
			</DialogTitle>
			
			<Divider />
			
			<DialogContent sx={{ p: 3 }}>
				{program.description && (
					<Alert severity="info" sx={{ mb: 3 }}>
						{program.description}
					</Alert>
				)}

				{/* Summary section */}
				<Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
					<Typography variant="subtitle2" fontWeight={700} mb={2}>
						Program Summary
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">Total Items:</Typography>
								<Typography variant="body2" fontWeight={700}>{summary.total_items || 0}</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6}>
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">Received:</Typography>
								<Typography variant="body2" fontWeight={700} color="success.main">
									{summary.distributed_items || 0}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6}>
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">Unclaimed:</Typography>
								<Typography variant="body2" fontWeight={700} color="warning.main">
									{summary.unclaimed_items || 0}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6}>
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">Total Value:</Typography>
								<Typography variant="body2" fontWeight={700} color="primary.main">
									₱{(summary.total_value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={12}>
							<Stack direction="row" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">Date Ended:</Typography>
								<Typography variant="body2" fontWeight={700}>
									{program.end_date ? format(new Date(program.end_date), 'MMM dd, yyyy') : 'N/A'}
								</Typography>
							</Stack>
						</Grid>
					</Grid>
				</Paper>

				{/* Items list */}
				<Typography variant="subtitle2" fontWeight={700} mb={1.5}>
					Items Distributed ({items.length})
				</Typography>
				
				<Stack spacing={1.5}>
					{items.map((item) => (
						<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
							<Stack spacing={1.5}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
									<Box flex={1} minWidth={0}>
										<Typography variant="body2" fontWeight={600} gutterBottom>
											{item.item_name}
										</Typography>
										<Stack spacing={0.5}>
											<Typography variant="caption" color="text.secondary">
												Quantity: {item.quantity} {item.unit}
											</Typography>
											{item.unit_value && (
												<Typography variant="caption" color="text.secondary">
													Unit Value: ₱{(item.unit_value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
												</Typography>
											)}
											{item.total_value && (
												<Typography variant="caption" color="primary.main" fontWeight={600}>
													Total Value: ₱{(item.total_value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
												</Typography>
											)}
											{item.released_at && (
												<Typography variant="caption" color="success.main">
													Received on: {format(new Date(item.released_at), 'MMM dd, yyyy h:mm a')}
												</Typography>
											)}
										</Stack>
									</Box>
									<ItemStatusChip status={item.status} />
								</Stack>
								{item.status === 'unclaimed' && item.coordinator_notes && (
									<Alert severity="warning" sx={{ py: 0.5 }}>
										<Typography variant="caption">
											<strong>Reason:</strong> {item.coordinator_notes}
										</Typography>
									</Alert>
								)}
							</Stack>
						</Paper>
					))}
					{items.length === 0 && (
						<Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
							<Typography variant="body2" color="text.secondary">
								No items recorded for this program.
							</Typography>
						</Paper>
					)}
				</Stack>
			</DialogContent>
			
			<Divider />
			
			<DialogActions sx={{ p: 2.5 }}>
				<Button onClick={onClose} variant="contained" fullWidth size="large">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// Main component
const SubsidyHistory = ({ onBack }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedProgram, setSelectedProgram] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [tab, setTab] = useState(0);

	const {
		subsidyHistory,
		programStats,
		loading,
		error
	} = useSubsidyHistory();

	const filtered = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		const list = subsidyHistory || [];
		const byTab = tab === 0 ? list : list.filter(p => p.status === (tab === 1 ? 'completed' : 'cancelled'));
		if (!q) return byTab;
		return byTab.filter(p =>
			(p.title || '').toLowerCase().includes(q) ||
			(p.description || '').toLowerCase().includes(q)
		);
	}, [subsidyHistory, searchTerm, tab]);

	if (loading) {
		return (
			<Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="md" sx={{ py: 6 }}>
				<Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
					<Typography variant="h6" color="error" fontWeight={800} gutterBottom>
						Failed to load history
					</Typography>
					<Typography variant="body2" color="text.secondary">{error}</Typography>
				</Paper>
			</Container>
		);
	}

	const completedCount = subsidyHistory.filter(p => p.status === 'completed').length;
	const cancelledCount = subsidyHistory.filter(p => p.status === 'cancelled').length;

	return (
		<Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="md">
				<Button
					startIcon={<ArrowLeft size={18} />}
					onClick={onBack || (() => window.history.back())}
					sx={{ mb: 3, fontWeight: 600 }}
				>
					Back
				</Button>

				{/* Stats header */}
				<Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
					<Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
						<Box sx={{ 
							bgcolor: 'primary.main', 
							color: 'white', 
							p: 1, 
							borderRadius: 1.5,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							<History size={24} />
						</Box>
						<Box>
							<Typography variant="h5" fontWeight={700}>
								Subsidy History
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Track your program participation and items received
							</Typography>
						</Box>
					</Stack>

					<Divider sx={{ my: 2 }} />

					<Grid container spacing={3}>
						<Grid item xs={12} sm={4}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Box sx={{ 
									bgcolor: 'primary.light', 
									color: 'primary.main', 
									p: 1, 
									borderRadius: 1,
									display: 'flex'
								}}>
									<Package size={20} />
								</Box>
								<Box>
									<Typography variant="h4" fontWeight={700} color="primary.main">
										{programStats.totalItems}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Items Received
									</Typography>
								</Box>
							</Stack>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Box sx={{ 
									bgcolor: 'success.light', 
									color: 'success.main', 
									p: 1, 
									borderRadius: 1,
									display: 'flex'
								}}>
									<CheckCircle size={20} />
								</Box>
								<Box>
									<Typography variant="h4" fontWeight={700} color="success.main">
										{completedCount}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Completed
									</Typography>
								</Box>
							</Stack>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Box sx={{ 
									bgcolor: 'grey.200', 
									color: 'text.primary', 
									p: 1, 
									borderRadius: 1,
									display: 'flex'
								}}>
									<FileText size={20} />
								</Box>
								<Box>
									<Typography variant="h4" fontWeight={700} color="text.primary">
										{subsidyHistory.length}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Total Programs
									</Typography>
								</Box>
							</Stack>
						</Grid>
					</Grid>
				</Paper>

				{/* Search bar */}
				<TextField
					fullWidth
					size="medium"
					placeholder="Search programs by name or description..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search size={20} />
							</InputAdornment>
						),
					}}
					sx={{ 
						bgcolor: 'white', 
						mb: 2,
						'& .MuiOutlinedInput-root': {
							borderRadius: 2
						}
					}}
				/>

				{/* Custom Tabs */}
				<Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
					<Stack direction="row">
						<Button
							fullWidth
							onClick={() => setTab(0)}
							sx={{
								py: 1.5,
								borderRadius: 0,
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.95rem',
								bgcolor: tab === 0 ? 'primary.main' : 'transparent',
								color: tab === 0 ? 'white' : 'text.primary',
								'&:hover': {
									bgcolor: tab === 0 ? 'primary.dark' : 'action.hover'
								}
							}}
						>
							All ({subsidyHistory.length})
						</Button>
						<Button
							fullWidth
							onClick={() => setTab(1)}
							sx={{
								py: 1.5,
								borderRadius: 0,
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.95rem',
								bgcolor: tab === 1 ? 'success.main' : 'transparent',
								color: tab === 1 ? 'white' : 'text.primary',
								'&:hover': {
									bgcolor: tab === 1 ? 'success.dark' : 'action.hover'
								}
							}}
						>
							Completed ({completedCount})
						</Button>
						<Button
							fullWidth
							onClick={() => setTab(2)}
							sx={{
								py: 1.5,
								borderRadius: 0,
								textTransform: 'none',
								fontWeight: 600,
								fontSize: '0.95rem',
								bgcolor: tab === 2 ? 'error.main' : 'transparent',
								color: tab === 2 ? 'white' : 'text.primary',
								'&:hover': {
									bgcolor: tab === 2 ? 'error.dark' : 'action.hover'
								}
							}}
						>
							Cancelled ({cancelledCount})
						</Button>
					</Stack>
				</Paper>

				{/* Program cards */}
				{filtered.length > 0 ? (
					filtered.map((program) => (
						<ProgramCard 
							key={program.id} 
							program={program} 
							onViewDetails={(p) => {
								setSelectedProgram(p);
								setShowModal(true);
							}} 
						/>
					))
				) : (
					<Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
						<History size={64} color="#9e9e9e" style={{ marginBottom: 16 }} />
						<Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
							{searchTerm ? 'No programs found' : 'No program history yet'}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{searchTerm ? 'Try adjusting your search terms.' : 'Your program participation history will appear here.'}
						</Typography>
					</Paper>
				)}

				{/* Details modal */}
				<DetailsModal 
					open={showModal} 
					onClose={() => {
						setShowModal(false);
						setSelectedProgram(null);
					}} 
					program={selectedProgram} 
				/>
			</Container>
		</Box>
	);
};

SubsidyHistory.propTypes = {
	onBack: PropTypes.func
};

ProgramCard.propTypes = {
	program: PropTypes.object.isRequired,
	onViewDetails: PropTypes.func.isRequired
};

DetailsModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	program: PropTypes.object
};

ItemStatusChip.propTypes = {
	status: PropTypes.string.isRequired
};

ProgramStatusChip.propTypes = {
	status: PropTypes.string.isRequired
};

export default SubsidyHistory;