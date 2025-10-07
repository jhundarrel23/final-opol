/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const SubmissionSection = ({
  formData,
  isSubmitting,
  onSubmit,
  canSubmit,
  submissionResult = null,
  buildPayload,
  referenceNumber = null
}) => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Helper to check if parcels are required based on livelihood category
  const requiresFarmParcels = useMemo(() => {
    const livelihoodCategoryId = formData?.farmProfile?.livelihood_category_id;
    // Category IDs: 1=Farmer, 2=Farm Worker, 3=Fisherfolk, 4=Agri-Youth
    // Farm Worker (2) and Agri-Youth (4) don't require parcels
    const noParcelCategories = [2, 4];
    return !noParcelCategories.includes(Number(livelihoodCategoryId));
  }, [formData?.farmProfile?.livelihood_category_id]);

  // Get livelihood category name for display
  const getLivelihoodCategoryName = useMemo(() => {
    const categoryId = formData?.farmProfile?.livelihood_category_id;
    const categoryNames = {
      1: 'Farmer',
      2: 'Farm Worker',
      3: 'Fisherfolk',
      4: 'Agri-Youth'
    };
    return categoryNames[categoryId] || 'Unknown';
  }, [formData?.farmProfile?.livelihood_category_id]);

  // Summary calculations
  const commoditySummary = useMemo(() => {
    const summary = { rice: 0, corn: 0, hvc: 0, livestock: 0, poultry: 0, agri_fisher: 0 };
    (formData?.farmParcels || []).forEach(parcel => {
      (parcel.commodities || []).forEach(commodity => {
        if (commodity?.commodity_type && Object.prototype.hasOwnProperty.call(summary, commodity.commodity_type)) {
          summary[commodity.commodity_type]++;
        }
      });
    });
    return summary;
  }, [formData?.farmParcels]);

  const totalFarmArea = useMemo(() => {
    return (formData?.farmParcels || []).reduce((sum, p) => sum + (p.total_farm_area || 0), 0);
  }, [formData?.farmParcels]);

  // Form completeness validation - considers optional parcels
  const formCompleteness = useMemo(() => {
    const issues = [];
    
    // Basic validation checks
    if (!formData?.beneficiaryDetails?.contact_number) issues.push('Contact number is required');
    if (!formData?.beneficiaryDetails?.barangay) issues.push('Barangay is required');
    if (!formData?.farmProfile?.livelihood_category_id) issues.push('Livelihood category is required');
    
    // Only check parcels if they're required for this livelihood category
    if (requiresFarmParcels) {
      if (!(formData?.farmParcels || []).length) {
        issues.push('At least one farm parcel is required for your livelihood category');
      }
      
      // Check parcels have basic info
      (formData?.farmParcels || []).forEach((parcel, index) => {
        if (!parcel.barangay || !parcel.tenure_type || !parcel.total_farm_area) {
          issues.push(`Parcel ${index + 1} is missing basic information`);
        }
        if (!(parcel.commodities || []).length) {
          issues.push(`Parcel ${index + 1} has no commodities`);
        }
      });
    }

    return { issues };
  }, [formData, requiresFarmParcels]);

  // Result handling - only show error dialog for failures
  useEffect(() => {
    if (!submissionResult) return;
    if (!submissionResult.success) {
      setShowErrorDialog(true);
    }
  }, [submissionResult]);

  if (!formData?.beneficiaryDetails) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Loading Application Data</Typography>
          <Typography variant="body2">
            Please wait while we load your application data...
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Error dialog - simplified
  const ErrorDialog = () => (
    <Dialog open={showErrorDialog} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', color: 'error.main' }}>
        <ErrorIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">Submission Failed</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Your application could not be submitted at this time. Please try again.
        </Typography>

        {submissionResult?.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{submissionResult.error}</Typography>
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          If the problem continues, please contact your Municipal Agriculture Office for assistance.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="outlined" onClick={() => setShowErrorDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const submissionSteps = [
    { title: 'Review & Validate', desc: 'Your application data will be checked for completeness' },
    { title: 'Submit to System', desc: 'Your application will be sent to the municipal database' },
    { title: 'Queue for Review', desc: 'Municipal staff will review your application' },
    { title: 'Receive Reference', desc: 'You\'ll get a tracking number for follow-up' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" color="primary">Submit Application</Typography>
          <Typography variant="body1" color="text.secondary">Review and submit your registration to the Municipal Agriculture Office</Typography>
        </Box>
      </Box>

      {/* Show info alert for Farm Workers/Agri-Youth about optional parcels */}
      {!requiresFarmParcels && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {getLivelihoodCategoryName} Application
          </Typography>
          <Typography variant="body2">
            As a {getLivelihoodCategoryName}, farm parcel information is optional for your application. 
            {(formData?.farmParcels || []).length > 0 
              ? ` You have provided ${formData.farmParcels.length} farm parcel(s).`
              : ' You have not provided farm parcel information.'}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main submission area */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">Submission Process</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                {submissionSteps.map((step, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="600">{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Application Status */}
              {isSubmitting && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Submitting Application</Typography>
                      <Typography variant="body2">Please wait while we process your submission...</Typography>
                    </Box>
                  </Box>
                  <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
                </Alert>
              )}

              {!canSubmit && !isSubmitting && formCompleteness.issues.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Complete the following to proceed:
                  </Typography>
                  <List dense>
                    {formCompleteness.issues.slice(0, 5).map((issue, index) => (
                      <ListItem key={index} sx={{ py: 0.25, pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Typography variant="body2" color="warning.main">•</Typography>
                        </ListItemIcon>
                        <ListItemText 
                          primary={issue} 
                          primaryTypographyProps={{ variant: 'body2' }} 
                        />
                      </ListItem>
                    ))}
                    {formCompleteness.issues.length > 5 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        ...and {formCompleteness.issues.length - 5} more items
                      </Typography>
                    )}
                  </List>
                </Alert>
              )}

              {canSubmit && !isSubmitting && !referenceNumber && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Ready for Submission
                  </Typography>
                  <Typography variant="body2">
                    All required information is complete. Use the Submit button at the bottom to proceed.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Application Summary */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, backgroundColor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">Application Summary</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Livelihood:</strong> {getLivelihoodCategoryName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Contact:</strong> {formData?.beneficiaryDetails?.contact_number || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Location:</strong> {formData?.beneficiaryDetails?.barangay || 'Not provided'}, {formData?.beneficiaryDetails?.municipality || 'Not provided'}
                </Typography>
                
                {/* Only show parcel info if they exist or are required */}
                {(requiresFarmParcels || (formData?.farmParcels || []).length > 0) && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Farm Parcels:</strong> {formData?.farmParcels?.length || 0}
                      {!requiresFarmParcels && ' (optional)'}
                    </Typography>
                    {totalFarmArea > 0 && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Total Area:</strong> {totalFarmArea.toFixed(2)} hectares
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              {Object.values(commoditySummary).some(count => count > 0) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
                    Commodities:
                  </Typography>
                  <Box sx={{ ml: 1 }}>
                    {Object.entries(commoditySummary).map(([key, count]) =>
                      count > 0 && (
                        <Typography key={key} variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          • {key.replace('_', ' ').toUpperCase()}: {count}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={canSubmit ? 'Ready to Submit' : 'Needs Completion'}
                  color={canSubmit ? 'success' : 'warning'}
                  variant={canSubmit ? 'filled' : 'outlined'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* What happens after submission */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                After Submission
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Processing Steps:</Typography>
                  <List dense>
                    {[
                      'Application review by municipal staff',
                      'Document verification process',
                      requiresFarmParcels ? 'Farm site validation (if required)' : 'Activity verification',
                      'Final approval and RSBSA assignment'
                    ].map((step, index) => (
                      <ListItem key={index} sx={{ py: 0.25, pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Typography variant="body2" color="primary">{index + 1}.</Typography>
                        </ListItemIcon>
                        <ListItemText 
                          primary={step} 
                          primaryTypographyProps={{ variant: 'body2' }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Important Notes:</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Keep your reference number for tracking<br />
                    • Visit the Municipal Agriculture Office if needed<br />
                    • You may be contacted for additional information<br />
                    • Processing time varies by municipality
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ErrorDialog />
    </Box>
  );
};

export default SubmissionSection;