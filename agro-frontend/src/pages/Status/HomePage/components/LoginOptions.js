/* eslint-disable no-unused-vars */
import React from 'react';
import { Box, Typography, Button, Container, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Wheat, Shield, Award, FileText, Bell, TrendingUp } from 'lucide-react';

const BeneficiaryPortal = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Wheat size={24} />,
      title: "Agricultural Benefits",
      description: "Track your farming subsidies and support programs"
    },
    {
      icon: <Shield size={24} />,
      title: "Secure Access",
      description: "Your data is protected with advanced security"
    },  
    {
      icon: <Bell size={24} />,
      title: "Real-time Updates",
      description: "Get notified about program changes instantly"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 25%, #ffffff 50%, #e8f5e8 75%, #c8e6c8 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(46, 125, 50, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          
          {/* Floating Badge */}
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Chip
              label="🌾 Para sa mga Magsasakang Pilipino"
              sx={{
                fontSize: '1.1rem',
                py: 2.5,
                px: 3,
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.15) 100%)',
                border: '2px solid rgba(76, 175, 80, 0.3)',
                color: '#2e7d32',
                fontWeight: 600,
                borderRadius: '50px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-8px)' }
                }
              }}
            />
          </Box>

          {/* Hero Icon with Animation */}
          <Box 
            sx={{ 
              mb: 4,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(76, 175, 80, 0.3)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  padding: 4,
                  background: 'linear-gradient(135deg, #4caf50, #81c784, #4caf50)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMaskComposite: 'xor',
                  animation: 'rotate 4s linear infinite',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 8,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  animation: 'pulse 2s ease-in-out infinite',
                },
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                },
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                  '50%': { opacity: 0.1, transform: 'scale(1.1)' }
                }
              }}
            >
              <User size={48} color="white" style={{ zIndex: 1, position: 'relative' }} />
            </Box>
          </Box>

          {/* Main Title */}
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(46, 125, 50, 0.1)',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2
            }}
          >
            Beneficiary Portal
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 6,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              color: '#546e7a'
            }}
          >
            Manage your agricultural benefits, track subsidies, and stay updated with government programs
            all in one secure, easy-to-use platform
          </Typography>

          {/* Feature Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 8,
              maxWidth: '900px',
              mx: 'auto'
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(76, 175, 80, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(76, 175, 80, 0.2)',
                    background: 'rgba(255, 255, 255, 0.95)',
                  }
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(46, 125, 50, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    mx: 'auto',
                    color: '#4caf50'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} color="#2e7d32" mb={1}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* CTA Button */}
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={20} />}
              onClick={() => navigate('/beneficiary-register')}
              sx={{
                py: 3.5,
                px: 10,
                fontSize: '1.3rem',
                fontWeight: 700,
                borderRadius: '60px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 30%, #66bb6a 60%, #81c784 100%)',
                boxShadow: '0 12px 40px rgba(46, 125, 50, 0.4)',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '320px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transition: 'left 0.6s ease',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 2,
                  borderRadius: '58px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 30%, #4caf50 60%, #66bb6a 100%)',
                  boxShadow: '0 20px 60px rgba(46, 125, 50, 0.5)',
                  transform: 'translateY(-4px) scale(1.05)',
                  '&::before': {
                    left: '100%',
                  },
                  '&::after': {
                    opacity: 1,
                  }
                },
                '&:active': {
                  transform: 'translateY(-2px) scale(1.02)',
                }
              }}
            >
              Get Started Today
            </Button>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #81c784, #4caf50)',
                opacity: 0.3,
                animation: 'bounce 2s ease-in-out infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0) scale(1)' },
                  '50%': { transform: 'translateY(-10px) scale(1.1)' }
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -15,
                left: -15,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                opacity: 0.2,
                animation: 'bounce 2.5s ease-in-out infinite reverse',
              }}
            />
          </Box>

          {/* Additional Info */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={20} color="#4caf50" />
              <Typography variant="body2" color="text.secondary">
                Secure & Protected
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Award size={20} color="#4caf50" />
              <Typography variant="body2" color="text.secondary">
                Government Verified
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} color="#4caf50" />
              <Typography variant="body2" color="text.secondary">
                Real-time Tracking
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BeneficiaryPortal;