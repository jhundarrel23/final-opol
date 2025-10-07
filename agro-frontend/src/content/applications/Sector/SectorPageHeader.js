/* eslint-disable no-unused-vars */
import { Typography, Button, Grid, Box } from '@mui/material';
import { Building2, Download } from 'lucide-react';

function SectorPageHeader({ user }) {
  return (
    <Grid container justifyContent="space-between" alignItems="center" spacing={3}>
      <Grid item>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Building2 size={32} color="white" />
          </Box>
          <Box>
            <Typography variant="h3" component="h3" fontWeight="bold" gutterBottom>
              Sector Management
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Manage and organize sectors, coordinators, and beneficiaries
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item>
        <Button
          variant="outlined"
          startIcon={<Download size={20} />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Export Report
        </Button>
      </Grid>
    </Grid>
  );
}

export default SectorPageHeader;