/* eslint-disable no-unused-vars */
import { Typography, Button, Grid, Box } from '@mui/material';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
import HistoryIcon from '@mui/icons-material/History';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PageHeader({ onRefresh }) {
  const [userName, setUserName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.fname || parsedUser.name || 'Beneficiary');
        setUserInfo(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
        setUserName('Beneficiary');
      }
    } else {
      setUserName('Beneficiary');
    }
  }, []);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    window.location.reload();
  };

  const handleViewHistory = () => {
    navigate('/beneficiary/beneficiary-subsidy-history');
  };

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          My Subsidy Programs
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Hello {userName}, here you can check your subsidy program status and benefits.
        </Typography>
      </Grid>
      <Grid item>
        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon fontSize="small" />}
            onClick={handleViewHistory}
            size="small"
          >
            View History
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshTwoToneIcon fontSize="small" />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default PageHeader;