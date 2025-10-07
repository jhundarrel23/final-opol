/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import {
  Calendar,
  User,
  MapPin,
  FileText,
  CheckCircle
} from 'lucide-react';

const ProgramApprovalForm = ({ program, formatCurrency, formatDate }) => {
  // Nature Theme Colors
  const forestGreen = '#2d5016';
  const leafGreen = '#4a7c59';
  const skyBlue = '#5b9aa0';
  const mintGreen = '#a8d5ba';

  if (!program) return null;

  // Helper functions for beneficiary data
  const getBeneficiaryName = (beneficiary) => {
    if (beneficiary.beneficiary?.user) {
      const { fname, lname } = beneficiary.beneficiary.user;
      if (fname || lname) {
        return `${fname || ''} ${lname || ''}`.trim();
      }
    }
    if (beneficiary.full_name) return beneficiary.full_name;
    if (beneficiary.name) return beneficiary.name;
    
    const firstName = beneficiary.firstName || beneficiary.fname;
    const middleName = beneficiary.middleName || beneficiary.mname;
    const lastName = beneficiary.lastName || beneficiary.lname;
    
    if (firstName || middleName || lastName) {
      return [firstName, middleName, lastName].filter(Boolean).join(' ');
    }
    return 'Unknown Beneficiary';
  };

  const getRSBSANumber = (beneficiary) => {
    if (beneficiary.beneficiary?.rsbsa_number) {
      return beneficiary.beneficiary.rsbsa_number;
    }
    return beneficiary.rsbsa_number || 
           beneficiary.rsbsaNumber || 
           'Not Set';
  };

  const getBeneficiaryAddress = (beneficiary) => {
    if (beneficiary.beneficiary?.barangay) {
      return beneficiary.beneficiary.barangay;
    }
    return beneficiary.address || 
           beneficiary.streetPurokBarangay ||
           beneficiary.barangay ||
           '';
  };

  const getCoordinatorName = (beneficiary) => {
    if (beneficiary.coordinator) {
      const { fname, mname, lname, extension_name } = beneficiary.coordinator;
      return [fname, mname, lname, extension_name].filter(Boolean).join(' ');
    }
    if (beneficiary.coordinator_name) {
      return beneficiary.coordinator_name;
    }
    return null;
  };

  const getCoordinatorSector = (beneficiary) => {
    if (beneficiary.coordinator?.sector?.sector_name) {
      return beneficiary.coordinator.sector.sector_name;
    }
    if (beneficiary.coordinator_sector) {
      return beneficiary.coordinator_sector;
    }
    return null;
  };

  const groupedBeneficiaries = program.beneficiaries?.reduce((acc, beneficiary) => {
    const referenceCode = beneficiary.reference_code || 
                         beneficiary.application_reference_code;
    
    const beneficiaryKey = referenceCode || 
                          beneficiary.beneficiary?.user?.id || 
                          beneficiary.id ||
                          `temp-${Math.random()}`;
    
    if (!acc[beneficiaryKey]) {
      acc[beneficiaryKey] = {
        ...beneficiary,
        items: [],
        reference_code: referenceCode
      };
    }
    
    if (beneficiary.items && beneficiary.items.length > 0) {
      beneficiary.items.forEach(item => {
        const itemExists = acc[beneficiaryKey].items.some(existingItem => 
          existingItem.id === item.id
        );
        
        if (!itemExists) {
          acc[beneficiaryKey].items.push(item);
        }
      });
    }
    
    return acc;
  }, {}) || {};

  const beneficiaries = Object.values(groupedBeneficiaries);

  const coordinators = beneficiaries.reduce((acc, beneficiary) => {
    const name = getCoordinatorName(beneficiary);
    const sector = getCoordinatorSector(beneficiary);
    
    if (name && !acc.some(c => c.name === name)) {
      acc.push({ name, sector });
    }
    return acc;
  }, []);

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
          body {
            font-size: 12pt !important;
            line-height: 1.4 !important;
            color: #000 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #2d5016 !important;
            page-break-after: avoid;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            text-align: left !important;
          }
          th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }
          .MuiButton-root {
            display: none !important;
          }
          svg {
            display: none !important;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
      <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'white' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: forestGreen, mb: 2 }}>
            AGRICULTURAL SUBSIDY PROGRAM
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: leafGreen, mb: 1 }}>
            APPROVAL & RELEASE FORM
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Department of Agriculture - Agricultural Subsidy Management System
          </Typography>
        </Box>

        <Divider sx={{ mb: 4, borderColor: alpha(leafGreen, 0.3) }} />

        {/* Program Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: forestGreen, mb: 2 }}>
            Program Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Program Title</Typography>
              <Typography variant="body1" fontWeight={600}>{program.title}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Typography variant="body1" fontWeight={600} sx={{ color: forestGreen }}>
                {program.status?.toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Target Barangay</Typography>
              <Typography variant="body1" fontWeight={600}>
                {program.barangay || 'All Barangays'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Total Beneficiaries</Typography>
              <Typography variant="body1" fontWeight={600}>
                {beneficiaries.length}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Start Date</Typography>
              <Typography variant="body1" fontWeight={600}>{formatDate(program.start_date)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">End Date</Typography>
              <Typography variant="body1" fontWeight={600}>{formatDate(program.end_date)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Created By</Typography>
              <Typography variant="body1" fontWeight={600}>
                {program.creator ? `${program.creator.fname} ${program.creator.lname}` : 'Unknown'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Approved By</Typography>
              <Typography variant="body1" fontWeight={600}>
                {program.approver ? `${program.approver.fname} ${program.approver.lname}` : 'Pending Approval'}
              </Typography>
            </Grid>
          </Grid>
          {program.description && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{program.description}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4, borderColor: alpha(leafGreen, 0.3) }} />

        {/* Beneficiary List */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: forestGreen, mb: 3 }}>
            Beneficiary List & Item Distribution
          </Typography>
          
          <TableContainer component={Paper} sx={{ border: `2px solid ${alpha(leafGreen, 0.3)}` }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(leafGreen, 0.1) }}>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Beneficiary Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen, minWidth: 140 }}>RSBSA Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Unit Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: forestGreen }}>Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {beneficiaries.map((beneficiary, beneficiaryIndex) => {
                  const items = beneficiary.items || [];
                  return items.map((item, itemIndex) => (
                    <TableRow key={`${beneficiaryIndex}-${itemIndex}`}>
                      <TableCell sx={{ fontWeight: itemIndex === 0 ? 600 : 400 }}>
                        {itemIndex === 0 ? getBeneficiaryName(beneficiary) : ''}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {itemIndex === 0 ? (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: beneficiary.beneficiary?.rsbsa_number ? 'success.main' : 'text.secondary',
                              fontWeight: beneficiary.beneficiary?.rsbsa_number ? 600 : 400
                            }}
                          >
                            {getRSBSANumber(beneficiary)}
                          </Typography>
                        ) : ''}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {itemIndex === 0 ? getBeneficiaryAddress(beneficiary) : ''}
                      </TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {formatCurrency(item.unit_value || 0)}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.total_value || 0)}
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ mb: 4, borderColor: alpha(leafGreen, 0.3) }} />

        {/* Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: forestGreen, mb: 3 }}>
            Program Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={4}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `2px solid ${alpha(leafGreen, 0.3)}`,
                bgcolor: alpha(leafGreen, 0.05)
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: forestGreen }}>
                  {beneficiaries.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  TOTAL BENEFICIARIES
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={4}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `2px solid ${alpha(skyBlue, 0.3)}`,
                bgcolor: alpha(skyBlue, 0.05)
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: skyBlue }}>
                  {beneficiaries.reduce((sum, b) => sum + (b.items?.length || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  TOTAL ITEMS
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={4}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                border: `2px solid ${alpha(mintGreen, 0.6)}`,
                bgcolor: alpha(mintGreen, 0.1)
              }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: forestGreen }}>
                  {formatCurrency(beneficiaries.reduce((sum, b) => 
                    sum + (b.items?.reduce((itemSum, item) => itemSum + (item.total_value || 0), 0) || 0), 0
                  ))}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  TOTAL VALUE
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4, borderColor: alpha(leafGreen, 0.3) }} />

        {/* Signature Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: forestGreen, mb: 3 }}>
            Authorization & Signatures
          </Typography>
          <Grid container spacing={4}>
            {/* Coordinators Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen, mb: 2 }}>
                Coordinators
              </Typography>
              <Grid container spacing={2}>
                {coordinators.length > 0 ? (
                  coordinators.map((coordinator, index) => (
                    <Grid item xs={6} md={4} key={index}>
                      <Box sx={{ 
                        border: `2px solid ${alpha(leafGreen, 0.3)}`, 
                        p: 3, 
                        borderRadius: 2,
                        minHeight: 120
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          {coordinator.sector || 'Coordinator'}
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                          {coordinator.name}
                        </Typography>
                        <Box sx={{ mt: 4, borderTop: `1px solid ${alpha(leafGreen, 0.3)}`, pt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Signature & Date
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      border: `2px solid ${alpha(leafGreen, 0.3)}`, 
                      p: 3, 
                      borderRadius: 2,
                      minHeight: 120
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No coordinator assigned
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Approving Officer */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                border: `2px solid ${alpha(skyBlue, 0.3)}`, 
                p: 3, 
                borderRadius: 2,
                minHeight: 120
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: skyBlue, mb: 2 }}>
                  Approving Officer
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {program.approver ? `${program.approver.fname} ${program.approver.lname}` : 'Pending Assignment'}
                </Typography>
                <Box sx={{ mt: 4, borderTop: `1px solid ${alpha(skyBlue, 0.3)}`, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Signature & Date
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Program Creator */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                border: `2px solid ${alpha(mintGreen, 0.6)}`, 
                p: 3, 
                borderRadius: 2,
                minHeight: 120
              }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen, mb: 2 }}>
                  Program Creator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {program.creator ? `${program.creator.fname} ${program.creator.lname}` : 'N/A'}
                </Typography>
                <Box sx={{ mt: 4, borderTop: `1px solid ${alpha(mintGreen, 0.6)}`, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Signature & Date
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            This form serves as official documentation for the agricultural subsidy program.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Generated on {formatDate(new Date().toISOString())}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Agricultural Subsidy Management System - Department of Agriculture
          </Typography>
        </Box>
      </Box>
    </>
  );
};

ProgramApprovalForm.propTypes = {
  program: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired
};

export default ProgramApprovalForm;