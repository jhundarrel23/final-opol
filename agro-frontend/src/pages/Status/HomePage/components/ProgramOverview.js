import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { Agriculture, Nature, Pets, School, TrendingUp, People } from '@mui/icons-material';

const ProgramOverview = () => {
  const programs = [
    {
      title: 'Rice Production Enhancement',
      description: 'Supporting farmers with high-quality seeds, fertilizers, and modern farming techniques to boost rice production.',
      icon: <Agriculture sx={{ fontSize: 48 }} />,
      participants: 1250,
      target: 1500,
      color: 'primary'
    },
    {
      title: 'Sustainable Agriculture',
      description: 'Promoting eco-friendly farming practices that protect the environment while maintaining productivity.',
      icon: <Nature sx={{ fontSize: 48 }} />,
      participants: 850,
      target: 1000,
      color: 'success'
    },
    {
      title: 'Livestock Development',
      description: 'Comprehensive livestock support including veterinary care, breeding programs, and feed assistance.',
      icon: <Pets sx={{ fontSize: 48 }} />,
      participants: 650,
      target: 800,
      color: 'secondary'
    },
    {
      title: 'Farmer Education',
      description: 'Training programs and workshops to enhance farming knowledge and introduce new agricultural technologies.',
      icon: <School sx={{ fontSize: 48 }} />,
      participants: 2100,
      target: 2500,
      color: 'info'
    }
  ];

  const stats = [
    { label: 'Total beneficiary', value: '4,850', icon: <People /> },
    { label: 'Active Programs', value: '12', icon: <TrendingUp /> },
    { label: 'Communities Served', value: '45', icon: <Agriculture /> },
    { label: 'Success Rate', value: '94%', icon: <Nature /> }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={600}>
          Our Programs
        </Typography>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          We offer comprehensive agricultural support programs designed to empower farmers and strengthen rural communities.
        </Typography>

        {/* Program Statistics */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Program Details */}
        <Grid container spacing={4}>
          {programs.map((program, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ color: `${program.color}.main`, mr: 3 }}>
                      {program.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" gutterBottom fontWeight={600}>
                        {program.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography color="text.secondary" paragraph>
                    {program.description}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Participants
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {program.participants} / {program.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(program.participants / program.target) * 100}
                      color={program.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {Math.round((program.participants / program.target) * 100)}% of target reached
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProgramOverview;
