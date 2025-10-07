import {
  Typography,
  Grid,
  Box
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

function PageHeader() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Box display="flex" alignItems="center" gap={2}>
          <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h3" gutterBottom>
              Inventory Management
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Monitor and manage all inventory items and stock transactions
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default PageHeader;