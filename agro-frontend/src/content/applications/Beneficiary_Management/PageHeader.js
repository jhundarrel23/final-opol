import {
  Typography,
  Grid,
  Box,
  Paper
} from '@mui/material';

function PageHeader() {
  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              User Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and monitor all registered users, beneficiaries, and coordinators.
            </Typography> 
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default PageHeader;
