import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import ApplyIcon from '@mui/icons-material/Send';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarIcon from '@mui/icons-material/CalendarToday';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[10],
}));

const ProgramCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colors = {
    'active': { bg: theme.palette.success.main, color: theme.palette.success.contrastText },
    'coming_soon': { bg: theme.palette.info.main, color: theme.palette.info.contrastText },
    'ended': { bg: theme.palette.grey[500], color: theme.palette.grey.contrastText },
  };
  
  const statusColors = colors[status] || colors['active'];
  return {
    backgroundColor: statusColors.bg,
    color: statusColors.color,
    fontWeight: 'bold'
  };
});

// Mock data for available programs
const mockPrograms = [
  {
    id: 'PROG-001',
    title: 'Fertilizer Subsidy Program',
    description: 'Financial assistance for purchasing organic and inorganic fertilizers to improve crop yield and soil fertility.',
    category: 'Financial Assistance',
    maxBenefit: '₱5,000',
    duration: '6 months',
    requirements: [
      'Valid farm ownership documents',
      'Barangay certification as active farmer',
      'Farm size: 0.5 - 10 hectares',
      'Primary livelihood must be farming'
    ],
    eligibility: 'Small-scale farmers with 0.5 to 10 hectares of farmland',
    applicationDeadline: '2024-03-31',
    status: 'active',
    beneficiaries: 250,
    remainingSlots: 75
  },
  {
    id: 'PROG-002',
    title: 'High-Quality Seed Distribution',
    description: 'Free distribution of certified rice, corn, and vegetable seeds to improve agricultural productivity.',
    category: 'In-Kind Assistance',
    maxBenefit: '₱3,500 worth of seeds',
    duration: '4 months',
    requirements: [
      'Active farmer registration',
      'Minimum 1 hectare farmland',
      'Commitment to use provided seeds',
      'Submit harvest report'
    ],
    eligibility: 'Registered farmers with minimum 1 hectare of cultivated land',
    applicationDeadline: '2024-04-15',
    status: 'active',
    beneficiaries: 180,
    remainingSlots: 45
  },
  {
    id: 'PROG-003',
    title: 'Farm Equipment Assistance',
    description: 'Subsidized farm equipment and tools to modernize farming practices and increase efficiency.',
    category: 'Equipment Support',
    maxBenefit: '₱15,000',
    duration: '12 months',
    requirements: [
      'Farmer cooperative membership',
      'Minimum 2 hectares farmland',
      'Equipment maintenance training completion',
      'Group application (5+ farmers)'
    ],
    eligibility: 'Farmer cooperatives and associations with collective farmland',
    applicationDeadline: '2024-05-30',
    status: 'active',
    beneficiaries: 95,
    remainingSlots: 30
  },
  {
    id: 'PROG-004',
    title: 'Crop Insurance Program',
    description: 'Insurance coverage against crop losses due to natural disasters, pests, and diseases.',
    category: 'Insurance Coverage',
    maxBenefit: '₱8,000 coverage',
    duration: '12 months',
    requirements: [
      'Active farming for minimum 2 years',
      'Updated farm registration',
      'Crop production records',
      'Premium contribution (20%)'
    ],
    eligibility: 'Farmers with established farming history and documented production',
    applicationDeadline: '2024-06-15',
    status: 'active',
    beneficiaries: 320,
    remainingSlots: 80
  },
  {
    id: 'PROG-005',
    title: 'Agricultural Training Program',
    description: 'Comprehensive training on modern farming techniques, sustainable agriculture, and business management.',
    category: 'Training & Education',
    maxBenefit: 'Free training + ₱2,000 allowance',
    duration: '3 months',
    requirements: [
      'Basic literacy required',
      'Commitment to complete 40-hour training',
      'Active participation in field demonstrations',
      'Share knowledge with other farmers'
    ],
    eligibility: 'All farmers interested in improving their agricultural knowledge and skills',
    applicationDeadline: '2024-07-31',
    status: 'coming_soon',
    beneficiaries: 0,
    remainingSlots: 100
  },
  {
    id: 'PROG-006',
    title: 'Irrigation Support Program',
    description: 'Financial and technical assistance for irrigation system development and water management.',
    category: 'Infrastructure Support',
    maxBenefit: '₱25,000',
    duration: '18 months',
    requirements: [
      'Communal irrigation project',
      'Environmental impact assessment',
      'Community participation agreement',
      'Technical feasibility study'
    ],
    eligibility: 'Farmer associations with communal irrigation needs',
    applicationDeadline: '2024-12-31',
    status: 'coming_soon',
    beneficiaries: 0,
    remainingSlots: 20
  }
];

const categories = ['All Categories', 'Financial Assistance', 'In-Kind Assistance', 'Equipment Support', 'Insurance Coverage', 'Training & Education', 'Infrastructure Support'];

function AvailablePrograms() {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    // Simulate API call
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPrograms(mockPrograms);
        setFilteredPrograms(mockPrograms);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    let filtered = programs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(program => program.category === selectedCategory);
    }

    setFilteredPrograms(filtered);
  }, [programs, searchTerm, selectedCategory]);

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProgram(null);
  };

  const handleApplyProgram = (programId) => {
    // Redirect to application form with pre-filled program
    window.location.href = `/beneficiary/applications/new?program=${programId}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Active',
      'coming_soon': 'Coming Soon',
      'ended': 'Ended'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StyledCard>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading available programs...</Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={<AgricultureIcon />}
          title="Available Programs"
          subheader="Explore agricultural assistance programs you can apply for"
        />
        <CardContent>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Programs Grid */}
          {filteredPrograms.length === 0 ? (
            <Alert severity="info">
              {searchTerm || selectedCategory !== 'All Categories' 
                ? 'No programs match your search criteria. Try adjusting your filters.'
                : 'No programs are currently available. Please check back later.'
              }
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredPrograms.map((program) => (
                <Grid item xs={12} md={6} lg={4} key={program.id}>
                  <ProgramCard>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {program.title}
                        </Typography>
                        <StatusChip
                          label={getStatusText(program.status)}
                          status={program.status}
                          size="small"
                        />
                      </Box>
                      
                      <Chip 
                        label={program.category} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mb: 2 }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {program.description}
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                            <Typography variant="body2">
                              <strong>Max Benefit:</strong>
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            {program.maxBenefit}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                            <Typography variant="body2">
                              <strong>Duration:</strong>
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="info.main">
                            {program.duration}
                          </Typography>
                        </Grid>
                      </Grid>

                      {program.status === 'active' && (
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Available Slots:</strong> {program.remainingSlots} of {program.beneficiaries + program.remainingSlots}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(program.beneficiaries / (program.beneficiaries + program.remainingSlots)) * 100}
                            sx={{ mt: 1 }}
                          />
                        </Paper>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(program)}
                        startIcon={<InfoIcon />}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleApplyProgram(program.id)}
                        startIcon={<ApplyIcon />}
                        disabled={program.status !== 'active' || program.remainingSlots === 0}
                        sx={{ ml: 'auto' }}
                      >
                        {program.status === 'active' 
                          ? (program.remainingSlots > 0 ? 'Apply Now' : 'Full')
                          : getStatusText(program.status)
                        }
                      </Button>
                    </CardActions>
                  </ProgramCard>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </StyledCard>

      {/* Program Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProgram?.title}
        </DialogTitle>
        <DialogContent>
          {selectedProgram && (
            <Box>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>Program Description</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProgram.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>Eligibility Criteria</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedProgram.eligibility}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>Requirements</Typography>
                  <ul>
                    {selectedProgram.requirements.map((req, index) => (
                      <li key={index}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>Program Details</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {selectedProgram.category}</Typography>
                    <Typography variant="body2"><strong>Max Benefit:</strong> {selectedProgram.maxBenefit}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {selectedProgram.duration}</Typography>
                    <Typography variant="body2"><strong>Application Deadline:</strong> {new Date(selectedProgram.applicationDeadline).toLocaleDateString()}</Typography>
                    <Typography variant="body2"><strong>Status:</strong></Typography>
                    <StatusChip
                      label={getStatusText(selectedProgram.status)}
                      status={selectedProgram.status}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    
                    {selectedProgram.status === 'active' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2"><strong>Beneficiaries:</strong> {selectedProgram.beneficiaries}</Typography>
                        <Typography variant="body2"><strong>Available Slots:</strong> {selectedProgram.remainingSlots}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedProgram?.status === 'active' && selectedProgram?.remainingSlots > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleApplyProgram(selectedProgram.id)}
              startIcon={<ApplyIcon />}
            >
              Apply for this Program
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AvailablePrograms;