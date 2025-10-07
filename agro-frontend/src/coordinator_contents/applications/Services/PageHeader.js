/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
import { useState } from 'react';
import { Typography, Button, Grid, Stack } from '@mui/material';
import { Zap } from 'lucide-react';
import ComprehensiveServiceEventModal from './ComprehensiveServiceEventModal';

function PageHeader({ onEventAdded }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventCreated = (newEvent) => {
    setModalOpen(false);
    onEventAdded?.(newEvent);
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            Agricultural Service Management
          </Typography>
          <Typography variant="subtitle2">Create events, manage beneficiaries, and track inventory.</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            size="large"
            startIcon={<Zap fontSize="small" />}
            onClick={() => setModalOpen(true)}
            sx={{
              px: 4, py: 1.5,
              background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #1a3409 0%, #2d5016 100%)' },
              fontWeight: 600
            }}
          >
            Create Service Event
          </Button>
        </Grid>
      </Grid>

      <ComprehensiveServiceEventModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleEventCreated} />
    </>
  );
}

export default PageHeader;