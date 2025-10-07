/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Divider,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  ContactPhone as ContactPhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Favorite as HeartIcon,
  Work as WorkIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material'; // ✅ Correct import path

import { styled, alpha } from '@mui/material/styles';

// Import the custom hook
import usePersonalDetails from './hooks/userPersonalDetail';

const brandGradient = 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #2563eb 100%)';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease-in-out'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main
  }
}));

const GradientHeader = styled(Paper)(({ theme }) => ({
  background: brandGradient,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.2)'
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  minWidth: '140px',
  fontSize: '0.875rem'
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  flex: 1
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.75rem'
}));

const PersonalDetails = () => {
  // Auth + role
  let storedUser = {};
  try { storedUser = JSON.parse(localStorage.getItem('user')) || {}; } catch { storedUser = {}; }
  const userId = storedUser.id || storedUser.user_id;

  const {
    formData,
    loading
  } = usePersonalDetails(userId);

  const formatValue = (value, defaultText = 'Not provided') => {
    if (value === null || value === undefined || value === '') {
      return defaultText;
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatYesNo = (value) => {
    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    return 'Not specified';
  };

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading personal details...</Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <>
      <GradientHeader elevation={0}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ 
            bgcolor: alpha('#ffffff', 0.15), 
            border: '2px solid rgba(255,255,255,0.6)',
            width: 56,
            height: 56
          }}>
            <PersonIcon sx={{ fontSize: '1.75rem' }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
              {formatValue(formData.first_name && formData.last_name 
                ? `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`
                : 'Personal Profile'
              )}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              View your personal information and profile details
            </Typography>
          </Box>
        </Box>
      </GradientHeader>

      <StyledCard>
        <CardContent>

          {/* RSBSA Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <BadgeIcon />
                <Typography variant="h6" fontWeight="bold">RSBSA Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>System Generated RSBSA:</InfoLabel>
                  <InfoValue>
                    {formatValue(formData.system_generated_rsbsa_number, 'Not yet assigned')}
                  </InfoValue>
                </InfoItem>
                {formData.manual_rsbsa_number && (
                  <InfoItem>
                    <InfoLabel>Manual RSBSA Number:</InfoLabel>
                    <InfoValue>
                      {formData.manual_rsbsa_number}
                    </InfoValue>
                  </InfoItem>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Location Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <LocationIcon />
                <Typography variant="h6" fontWeight="bold">Location Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Barangay:</InfoLabel>
                  <InfoValue>{formatValue(formData.barangay)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Municipality:</InfoLabel>
                  <InfoValue>{formatValue(formData.municipality)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Province:</InfoLabel>
                  <InfoValue>{formatValue(formData.province)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Region:</InfoLabel>
                  <InfoValue>{formatValue(formData.region)}</InfoValue>
                </InfoItem>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Contact Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <ContactPhoneIcon />
                <Typography variant="h6" fontWeight="bold">Contact Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Contact Number:</InfoLabel>
                  <InfoValue>{formatValue(formData.contact_number)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Emergency Contact:</InfoLabel>
                  <InfoValue>{formatValue(formData.emergency_contact_number)}</InfoValue>
                </InfoItem>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Personal Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <PersonIcon />
                <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Birth Date:</InfoLabel>
                  <InfoValue>{formatDate(formData.birth_date)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Place of Birth:</InfoLabel>
                  <InfoValue>{formatValue(formData.place_of_birth)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Sex:</InfoLabel>
                  <InfoValue>{formatValue(formData.sex)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Civil Status:</InfoLabel>
                  <InfoValue>{formatValue(formData.civil_status)}</InfoValue>
                </InfoItem>
                {formData.civil_status === 'married' && (
                  <InfoItem>
                    <InfoLabel>Spouse Name:</InfoLabel>
                    <InfoValue>{formatValue(formData.name_of_spouse)}</InfoValue>
                  </InfoItem>
                )}
                <InfoItem>
                  <InfoLabel>Mother's Maiden Name:</InfoLabel>
                  <InfoValue>{formatValue(formData.mothers_maiden_name)}</InfoValue>
                </InfoItem>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Educational & Demographic */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <SchoolIcon />
                <Typography variant="h6" fontWeight="bold">Educational & Demographic Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Highest Education:</InfoLabel>
                  <InfoValue>{formatValue(formData.highest_education)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Religion:</InfoLabel>
                  <InfoValue>{formatValue(formData.religion)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Person with Disability:</InfoLabel>
                  <InfoValue>
                    <Box display="flex" alignItems="center" gap={1}>
                      {formData.is_pwd ? 'Yes' : 'No'}
                      {formData.is_pwd && (
                        <StatusChip 
                          label="PWD" 
                          color="info" 
                          size="small" 
                          icon={<AccessibilityIcon />}
                        />
                      )}
                    </Box>
                  </InfoValue>
                </InfoItem>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Government ID */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <BadgeIcon />
                <Typography variant="h6" fontWeight="bold">Government ID Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Has Government ID:</InfoLabel>
                  <InfoValue>{formatYesNo(formData.has_government_id)}</InfoValue>
                </InfoItem>
                {formData.has_government_id === 'yes' && (
                  <>
                    <InfoItem>
                      <InfoLabel>ID Type:</InfoLabel>
                      <InfoValue>{formatValue(formData.gov_id_type)}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>ID Number:</InfoLabel>
                      <InfoValue>
                        {formData.gov_id_number 
                          ? `****${formData.gov_id_number.slice(-4)}` 
                          : 'Not provided'
                        }
                      </InfoValue>
                    </InfoItem>
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Association */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <GroupIcon />
                <Typography variant="h6" fontWeight="bold">Association & Organization Membership</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Association Member:</InfoLabel>
                  <InfoValue>
                    <Box display="flex" alignItems="center" gap={1}>
                      {formatYesNo(formData.is_association_member)}
                      {formData.is_association_member === 'yes' && (
                        <StatusChip 
                          label="Member" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </Box>
                  </InfoValue>
                </InfoItem>
                {formData.is_association_member === 'yes' && (
                  <InfoItem>
                    <InfoLabel>Association Name:</InfoLabel>
                    <InfoValue>{formatValue(formData.association_name)}</InfoValue>
                  </InfoItem>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Household */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <HomeIcon />
                <Typography variant="h6" fontWeight="bold">Household Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <InfoItem>
                  <InfoLabel>Household Head:</InfoLabel>
                  <InfoValue>
                    <Box display="flex" alignItems="center" gap={1}>
                      {formData.is_household_head ? 'Yes, I am the household head' : 'No'}
                      {formData.is_household_head && (
                        <StatusChip 
                          label="Head" 
                          color="primary" 
                          size="small"
                        />
                      )}
                    </Box>
                  </InfoValue>
                </InfoItem>
                {!formData.is_household_head && (
                  <InfoItem>
                    <InfoLabel>Household Head Name:</InfoLabel>
                    <InfoValue>{formatValue(formData.household_head_name)}</InfoValue>
                  </InfoItem>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

        </CardContent>
      </StyledCard>
    </>
  );
};

export default PersonalDetails;
