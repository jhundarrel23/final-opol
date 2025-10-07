/* eslint-disable no-unused-vars */
import {
  Typography,
  Button,
  Grid
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

function EnrollmentPageHeader({ user }) {
  const navigate = useNavigate();

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" gutterBottom>
          RSBSA Enrollment Management
        </Typography>
        {user && (
          <Typography variant="subtitle2">
            Welcome, {user.username}
          </Typography>
        )}
      </Grid>

      <Grid item>
        <Button
          sx={{ mt: { xs: 2, md: 0 } }}
          variant="contained"
          startIcon={<HistoryIcon fontSize="small" />}
          onClick={() => navigate('/management/enrollment-history')} // ✅ correct path
        >
          View History
        </Button>
      </Grid>
    </Grid>
  );
}

export default EnrollmentPageHeader;
