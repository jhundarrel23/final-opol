import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, Avatar, Chip, TextField, InputAdornment, Button } from '@mui/material';
import { Search, LocationOn, Agriculture, Person } from '@mui/icons-material';

const BeneficiaryDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with actual API data
  const beneficiaries = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      barangay: 'Barangay San Juan',
      program: 'Rice Production',
      status: 'Active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Maria Santos',
      barangay: 'Barangay Poblacion',
      program: 'Livestock Development',
      status: 'Active',
      joinDate: '2024-02-10'
    },
    {
      id: 3,
      name: 'Pedro Gonzales',
      barangay: 'Barangay Riverside',
      program: 'Crop Diversification',
      status: 'Active',
      joinDate: '2024-03-05'
    },
    {
      id: 4,
      name: 'Ana Rodriguez',
      barangay: 'Barangay Hilltop',
      program: 'Organic Farming',
      status: 'Active',
      joinDate: '2024-01-28'
    },
    {
      id: 5,
      name: 'Carlos Mendoza',
      barangay: 'Barangay Central',
      program: 'Fishery Development',
      status: 'Active',
      joinDate: '2024-02-18'
    },
    {
      id: 6,
      name: 'Lisa Reyes',
      barangay: 'Barangay East',
      program: 'Vegetable Production',
      status: 'Active',
      joinDate: '2024-03-12'
    }
  ];

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgramColor = (program) => {
    const colors = {
      'Rice Production': 'primary',
      'Livestock Development': 'secondary',
      'Crop Diversification': 'success',
      'Organic Farming': 'warning',
      'Fishery Development': 'info',
      'Vegetable Production': 'error'
    };
    return colors[program] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={600}>
          Program Beneficiaries
        </Typography>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Meet our program participants who are making a difference in agricultural development across our communities.
        </Typography>

        <Box sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Search by name, barangay, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredBeneficiaries.map((beneficiary) => (
            <Grid item xs={12} md={6} lg={4} key={beneficiary.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {beneficiary.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Member since {new Date(beneficiary.joinDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn color="action" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {beneficiary.barangay}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Agriculture color="action" sx={{ fontSize: 20, mr: 1 }} />
                    <Chip
                      label={beneficiary.program}
                      color={getProgramColor(beneficiary.program)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Chip
                    label={beneficiary.status}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredBeneficiaries.length === 0 && (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No beneficiaries found matching your search.
            </Typography>
          </Box>
        )}

        <Box textAlign="center" sx={{ mt: 6 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredBeneficiaries.length} of {beneficiaries.length} beneficiaries
          </Typography>
          
          <Button variant="outlined">
            View Complete Directory
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BeneficiaryDirectory;