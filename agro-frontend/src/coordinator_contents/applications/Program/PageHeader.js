import { useState } from 'react';
import {
  Typography,
  Button,
  Grid
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import AddProgramModal from './AddProgram';

function PageHeader({ onProgramAdded }) {
  // ✅ State for controlling the Add Program modal
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Static user data - replace with actual user context/auth in production
  const user = {
    name: 'Coordinator',
    avatar: '/static/images/avatars/1.jpg'
  };

  // ✅ Handle successful program creation from modal
  const handleProgramCreated = (newProgram) => {
    console.log('Program created successfully:', newProgram);
    
    // ✅ Close the modal after successful creation
    setModalOpen(false);
    
    // ✅ Notify parent component to refresh list and show notification
    if (onProgramAdded) {
      onProgramAdded(newProgram);
    }
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            Subsidy Program Management
          </Typography>
          <Typography variant="subtitle2">
            {user.name}!, manage your subsidy programs and track distributions
          </Typography>
        </Grid>
        <Grid item>
          <Button
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            onClick={() => setModalOpen(true)}
          >
            Create New Program
          </Button>
        </Grid>
      </Grid>   

      {/* ✅ Add Program Modal - controlled by local state */}
      <AddProgramModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleProgramCreated}
      />
    </>
  );
}

export default PageHeader;