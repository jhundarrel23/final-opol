import { useState } from 'react';
import { Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import AddBeneficiaryModal from './AddBeneficiaryModal';

function PageHeader({ onAdd }) {
  const [openModal, setOpenModal] = useState(false);
  const user = { name: 'User' };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Application
          </Typography>
          <Typography variant="subtitle2">
            {user.name}, these are your Beneficiaries
          </Typography>
        </Grid>
        <Grid item>
          <Button
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            onClick={() => setOpenModal(true)}
          >
            Add Beneficiary on Your List
          </Button>
        </Grid>
      </Grid>

      <AddBeneficiaryModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        handleAdd={onAdd}
      />
    </>
  );
}

export default PageHeader;
