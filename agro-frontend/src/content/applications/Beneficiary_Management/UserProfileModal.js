/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Work,
  School,
  AccountCircle,
  Close,
  Wc,
  Badge,
  Home,
  ContactEmergency,
  Assignment,
  Receipt,
  Today,
  CheckCircle,
  Cancel,
  Pending,
  Agriculture,
  Nature,
  Straighten
} from '@mui/icons-material';
import axiosInstance from '../../../api/axiosInstance';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfileModal = ({ open, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [subsidyRecords, setSubsidyRecords] = useState([]);
  const [farmDetails, setFarmDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch detailed user information
  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch user details
      const response = await axiosInstance.get(`/api/admin/users/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
        console.log('User details:', response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user details');
      }
      
      // Fetch subsidy records
      try {
        const subsidyResponse = await axiosInstance.get(`/api/admin/users/${userId}/subsidies`);
        if (subsidyResponse.data.success) {
          setSubsidyRecords(subsidyResponse.data.data);
        }
      } catch (subsidyError) {
        console.warn('Could not fetch subsidy records:', subsidyError.message);
        setSubsidyRecords([]);
      }

      // Fetch farm details
      try {
        const farmResponse = await axiosInstance.get(`/api/admin/users/${userId}/farm-details`);
        if (farmResponse.data.success) {
          setFarmDetails(farmResponse.data.data);
        }
      } catch (farmError) {
        console.warn('Could not fetch farm details:', farmError.message);
        setFarmDetails([]);
      }
      
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
      setTabValue(0); // Reset to first tab
    }
  }, [open, userId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setUser(null);
    setSubsidyRecords([]);
    setFarmDetails([]);
    setError('');
    onClose();
  };

  if (!user && !loading) {
    return null;
  }

  const fullName = user ? `${user.fname || ''} ${user.mname || ''} ${user.lname || ''}`.trim() : 'Loading...';
  const beneficiaryDetail = user?.beneficiary_detail || user?.beneficiaryDetail;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const getSubsidyStatusIcon = (status) => {
    switch (status) {
      case 'ongoing': return <Pending color="warning" />;
      case 'completed': return <CheckCircle color="success" />;
      case 'cancelled': return <Cancel color="error" />;
      default: return <Assignment />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {loading ? <CircularProgress size={24} /> : fullName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {loading ? 'Loading...' : fullName}
              </Typography>
              {user && (
                <Box display="flex" gap={1} mt={0.5}>
                  <Chip 
                    label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} 
                    color={user.role === 'coordinator' ? 'warning' : 'primary'}
                    size="small"
                  />
                  <Chip 
                    label={user.status?.charAt(0).toUpperCase() + user.status?.slice(1)} 
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                  {user.email_verified_at && (
                    <Chip label="Verified" color="success" size="small" />
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, height: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        ) : user ? (
          <>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                px: 2,
                '& .MuiTab-root': {
                  minHeight: 72,
                  fontSize: '0.875rem'
                }
              }}
            >
              <Tab label="Profile" icon={<Person />} iconPosition="top" />
              <Tab label="Contact" icon={<LocationOn />} iconPosition="top" />
              <Tab label="Farm Details" icon={<Agriculture />} iconPosition="top" />
              <Tab label="Programs" icon={<Receipt />} iconPosition="top" />
              <Tab label="Account" icon={<AccountCircle />} iconPosition="top" />
            </Tabs>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Personal Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Badge /></ListItemIcon>
                          <ListItemText 
                            primary="Full Name" 
                            secondary={fullName}
                          />
                        </ListItem>
                        {user.extension_name && (
                          <ListItem>
                            <ListItemIcon><Badge /></ListItemIcon>
                            <ListItemText 
                              primary="Name Extension" 
                              secondary={user.extension_name}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemIcon><AccountCircle /></ListItemIcon>
                          <ListItemText 
                            primary="Username" 
                            secondary={user.username || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Email /></ListItemIcon>
                          <ListItemText 
                            primary="Email" 
                            secondary={user.email || 'N/A'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {beneficiaryDetail && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Demographics
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><CalendarToday /></ListItemIcon>
                            <ListItemText 
                              primary="Birth Date" 
                              secondary={beneficiaryDetail.birth_date ? 
                                new Date(beneficiaryDetail.birth_date).toLocaleDateString() : 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Wc /></ListItemIcon>
                            <ListItemText 
                              primary="Sex" 
                              secondary={beneficiaryDetail.sex?.charAt(0).toUpperCase() + 
                                beneficiaryDetail.sex?.slice(1) || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Home /></ListItemIcon>
                            <ListItemText 
                              primary="Civil Status" 
                              secondary={beneficiaryDetail.civil_status?.charAt(0).toUpperCase() + 
                                beneficiaryDetail.civil_status?.slice(1) || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><School /></ListItemIcon>
                            <ListItemText 
                              primary="Education" 
                              secondary={beneficiaryDetail.highest_education || 'N/A'}
                            />
                          </ListItem>
                          {beneficiaryDetail.is_pwd && (
                            <ListItem>
                              <ListItemIcon><Badge /></ListItemIcon>
                              <ListItemText 
                                primary="PWD Status" 
                                secondary="Person with Disability"
                              />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Contact & Location Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Contact Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Phone /></ListItemIcon>
                          <ListItemText 
                            primary="Primary Contact" 
                            secondary={beneficiaryDetail?.contact_number || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ContactEmergency /></ListItemIcon>
                          <ListItemText 
                            primary="Emergency Contact" 
                            secondary={beneficiaryDetail?.emergency_contact_number || 'N/A'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Address Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText 
                            primary="Barangay" 
                            secondary={beneficiaryDetail?.barangay || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText 
                            primary="Municipality" 
                            secondary={beneficiaryDetail?.municipality || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText 
                            primary="Province" 
                            secondary={beneficiaryDetail?.province || 'N/A'}
                          />
                        </ListItem>
                        {beneficiaryDetail?.place_of_birth && (
                          <ListItem>
                            <ListItemIcon><LocationOn /></ListItemIcon>
                            <ListItemText 
                              primary="Place of Birth" 
                              secondary={beneficiaryDetail.place_of_birth}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Farm Details Tab */}
            <TabPanel value={tabValue} index={2}>
              {farmDetails.farm_profiles && farmDetails.farm_profiles.length > 0 ? (
                <>
                  {/* Farm Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="primary">
                            {farmDetails.summary?.total_farm_profiles || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Farm Profiles
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="primary">
                            {farmDetails.summary?.total_parcels || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Farm Parcels
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="primary">
                            {farmDetails.summary?.total_farm_area || 0} ha
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Area
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="primary">
                            {farmDetails.summary?.total_commodities || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Commodities
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Farm Profiles */}
                  {farmDetails.farm_profiles.map((profile, profileIndex) => (
                    <Card key={profile.id} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Agriculture color="primary" />
                          <Typography variant="h6">
                            Farm Profile #{profile.farm_profile_info.reference_number}
                          </Typography>
                          <Chip 
                            label={`${profile.profile_summary.total_area} hectares`} 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              {profile.farm_profile_info.barangay}, {profile.farm_profile_info.municipality}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Parcels: {profile.profile_summary.total_parcels} | 
                              Commodities: {profile.profile_summary.total_commodities}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Farm Parcels */}
                        {profile.farm_parcels.map((parcel, parcelIndex) => (
                          <Card key={parcel.id} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  Parcel #{parcel.parcel_number}
                                </Typography>
                                <Box display="flex" gap={1}>
                                  <Chip 
                                    label={parcel.tenure_type_display} 
                                    size="small" 
                                    color="info"
                                    variant="outlined"
                                  />
                                  {parcel.parcel_summary.has_organic_commodities && (
                                    <Chip 
                                      label="Organic" 
                                      size="small" 
                                      color="success"
                                      icon={<Nature />}
                                    />
                                  )}
                                </Box>
                              </Box>

                              <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                  <Typography variant="body2">
                                    <Straighten fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                    Area: {parcel.total_farm_area} ha
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2">
                                    <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                    {parcel.barangay}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2">
                                    Utilized: {parcel.parcel_summary.total_commodity_area} ha
                                  </Typography>
                                </Grid>
                              </Grid>

                              {parcel.landowner_name && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Landowner: {parcel.landowner_name}
                                </Typography>
                              )}

                              {/* Commodities Table */}
                              {parcel.commodities.length > 0 && (
                                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Commodity</TableCell>
                                        <TableCell align="right">Area (ha)</TableCell>
                                        <TableCell align="center">Farm Type</TableCell>
                                        <TableCell align="center">Organic</TableCell>
                                        <TableCell align="right">Heads/Count</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {parcel.commodities.map((commodity, commodityIndex) => (
                                        <TableRow key={commodityIndex}>
                                          <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                              {commodity.display_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {commodity.commodity_type}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            {commodity.size_hectares || 0}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip 
                                              label={commodity.farm_type} 
                                              size="small" 
                                              variant="outlined"
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            {commodity.is_organic_practitioner ? (
                                              <Nature color="success" fontSize="small" />
                                            ) : (
                                              <Cancel color="disabled" fontSize="small" />
                                            )}
                                          </TableCell>
                                          <TableCell align="right">
                                            {commodity.number_of_heads || '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}

                              {/* Parcel utilization */}
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Land Utilization: {parcel.parcel_summary.total_commodity_area}/{parcel.total_farm_area} ha 
                                  ({parcel.parcel_summary.is_fully_utilized ? 'Fully Utilized' : 
                                    `${parcel.parcel_summary.remaining_area} ha remaining`})
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Alert severity="info">
                  No farm details found for this user.
                </Alert>
              )}
            </TabPanel>

            {/* Subsidy Programs Tab */}
            <TabPanel value={tabValue} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Subsidy Program Records
                  </Typography>
                  
                  {subsidyRecords.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Program Name</TableCell>
                            <TableCell>Application Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Total Items</TableCell>
                            <TableCell>Total Value</TableCell>
                            <TableCell>Date Approved</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subsidyRecords.map((program, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {program.program_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {program.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {program.application_date ? 
                                  new Date(program.application_date).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {getSubsidyStatusIcon(program.status)}
                                  <Chip 
                                    label={program.status?.toUpperCase() || 'N/A'} 
                                    color={getStatusColor(program.status)}
                                    size="small"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                {program.summary?.total_items || 0} items
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {program.summary?.distributed_items || 0} distributed
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {program.summary?.total_value ? 
                                  `₱${Number(program.summary.total_value).toLocaleString()}` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {program.date_approved ? 
                                  new Date(program.date_approved).toLocaleDateString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No subsidy program records found for this user.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Account Details Tab */}
            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <AccountCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Account Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Today /></ListItemIcon>
                          <ListItemText 
                            primary="Account Created" 
                            secondary={user.created_at ? 
                              new Date(user.created_at).toLocaleString() : 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Today /></ListItemIcon>
                          <ListItemText 
                            primary="Last Updated" 
                            secondary={user.updated_at ? 
                              new Date(user.updated_at).toLocaleString() : 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Email /></ListItemIcon>
                          <ListItemText 
                            primary="Email Verified" 
                            secondary={user.email_verified_at ? 
                              new Date(user.email_verified_at).toLocaleString() : 'Not Verified'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {beneficiaryDetail && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                          RSBSA Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><Assignment /></ListItemIcon>
                            <ListItemText 
                              primary="System Generated RSBSA" 
                              secondary={beneficiaryDetail.system_generated_rsbsa_number || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Assignment /></ListItemIcon>
                            <ListItemText 
                              primary="Manual RSBSA" 
                              secondary={beneficiaryDetail.manual_rsbsa_number || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Home /></ListItemIcon>
                            <ListItemText 
                              primary="Household Head" 
                              secondary={beneficiaryDetail.is_household_head ? 'Yes' : 'No'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Work /></ListItemIcon>
                            <ListItemText 
                              primary="Association Member" 
                              secondary={beneficiaryDetail.is_association_member || 'N/A'}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default UserProfileModal;