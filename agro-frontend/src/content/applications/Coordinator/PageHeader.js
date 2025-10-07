import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Grid
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import AddCoordinatorModal from './AddCoordinatorModal';
import axiosInstance from '../../../api/axiosInstance';

function PageHeader() {
  const [open, setOpen] = useState(false);
  const [sectorOptions, setSectorOptions] = useState([]);

  const user = {
    name: 'Hi',
    avatar: '/static/images/avatars/1.jpg'
  };

  const fetchSectors = async () => {
    try {
      const res = await axiosInstance.get('/api/sectors');
      const options = res.data.map(sector => ({
        value: sector.id,
        label: sector.sector_name
      }));
      setSectorOptions(options);
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleAddCoordinator = (formData) => {
    console.log('Coordinator Created:', formData);
    // Refresh list or show a snackbar if needed
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            Manage Coordinator
          </Typography>
          <Typography variant="subtitle2">
            {user.name}!, these are your current Coordinators
          </Typography>
        </Grid>
        <Grid item>
          <Button
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            onClick={() => setOpen(true)}
          >
            Create new Coordinator
          </Button>
        </Grid>
      </Grid>

      <AddCoordinatorModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAddCoordinator}
        sectorOptions={sectorOptions} // ✅ renamed
      />
    </>
  );
}

export default PageHeader;
