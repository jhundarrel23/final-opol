import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Button } from '@mui/material';
import { Phone, Email, LocationOn, AccessTime, Facebook, YouTube } from '@mui/icons-material';

const ContactInformation = () => {
  const contactMethods = [
    {
      title: 'Phone Support',
      details: ['+63 (062) 991-1234', '+63 (062) 991-5678'],
      icon: <Phone sx={{ fontSize: 48 }} />,
      color: 'primary',
      action: 'Call Now'
    },
    {
      title: 'Email Support',
      details: ['info@opol-agrisys.gov.ph', 'support@opol-agrisys.gov.ph'],
      icon: <Email sx={{ fontSize: 48 }} />,
      color: 'secondary',
      action: 'Send Email'
    },
    {
      title: 'Visit Our Office',
      details: ['Municipal Agriculture Office', 'Opol, Misamis Oriental', 'Philippines 9016'],
      icon: <LocationOn sx={{ fontSize: 48 }} />,
      color: 'success',
      action: 'Get Directions'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 5:00 PM' },
    { day: 'Saturday', hours: '8:00 AM - 12:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
    { day: 'Holidays', hours: 'Closed' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook />, url: '#', color: '#1877f2' },
    { name: 'YouTube', icon: <YouTube />, url: '#', color: '#ff0000' }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom fontWeight={600}>
          Contact Information
        </Typography>
        
        <Typography 
          variant="body1" 
          textAlign="center" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}
        >
          Have questions about our programs? Need assistance with your application? We're here to help!
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Methods */}
          {contactMethods.map((method, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: `${method.color}.main`, mb: 3 }}>
                    {method.icon}
                  </Box>
                  
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {method.title}
                  </Typography>
                  
                  {method.details.map((detail, idx) => (
                    <Typography 
                      key={idx}
                      color="text.secondary" 
                      sx={{ mb: 1, fontSize: '0.95rem' }}
                    >
                      {detail}
                    </Typography>
                  ))}
                  
                  <Button
                    variant="contained"
                    color={method.color}
                    sx={{ mt: 3 }}
                    fullWidth
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Office Hours */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccessTime sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Office Hours
                  </Typography>
                </Box>

                {officeHours.map((schedule, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      py: 1.5,
                      borderBottom: index < officeHours.length - 1 ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {schedule.day}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color={schedule.hours === 'Closed' ? 'error.main' : 'text.primary'}
                    >
                      {schedule.hours}
                    </Typography>
                  </Box>
                ))}

                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 3, display: 'block', fontStyle: 'italic' }}
                >
                  * Emergency services available 24/7 through our hotline
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Social Media & Additional Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Follow Us
                </Typography>
                
                <Typography color="text.secondary" paragraph>
                  Stay connected with us on social media for the latest updates, program announcements, and agricultural tips.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  {socialLinks.map((social, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      startIcon={social.icon}
                      sx={{
                        borderColor: social.color,
                        color: social.color,
                        '&:hover': {
                          bgcolor: social.color,
                          color: 'white'
                        }
                      }}
                    >
                      {social.name}
                    </Button>
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Emergency Contacts
                </Typography>
                
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Agricultural Emergency: <strong>+63 (062) 911-FARM</strong>
                </Typography>
                
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Disaster Response: <strong>+63 (062) 911-HELP</strong>
                </Typography>

                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}
                >
                  Available 24/7 for urgent agricultural concerns and disaster-related assistance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ContactInformation;