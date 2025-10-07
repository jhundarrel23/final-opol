import {
  Typography,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import axiosInstance from '../../../api/axiosInstance';

function PageHeader() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [open, setOpen] = useState(false);
  const [sectorName, setSectorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [nameExists, setNameExists] = useState(false);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSectorName('');
    setNameExists(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const debouncedCheckName = useCallback(
    debounce(async (name) => {
      if (!name.trim()) {
        setNameExists(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/api/sectors');
        const exists = res.data.some(
          (sector) =>
            sector.sector_name.toLowerCase().trim() === name.toLowerCase().trim() &&
            !sector.deleted_at 
        );
        setNameExists(exists);
      } catch (err) {
        console.error('Error checking sector name:', err);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedCheckName(sectorName);
    return () => {
      debouncedCheckName.cancel();
    };
  }, [sectorName, debouncedCheckName]);

  const handleSaveSector = async () => {
    if (!sectorName.trim()) {
      setError('Sector name is required');
      return;
    }

    if (nameExists) {
      setError('Sector name already exists');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/sectors', {
        sector_name: sectorName,
        user_id: user.id
      });

      setOpen(false);
      setSectorName('');
      setError(null);
      setNameExists(false);

      setSnackbarMessage('Sector added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error saving sector:', err);
      let message = 'Failed to save sector';
      if (err.response && err.response.status === 409) {
        message = err.response.data.message || 'Sector name already exists.';
      }
      setError(message);
      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Agricultural Sectors
          </Typography>
          {user && (
            <Typography variant="subtitle2">
              {user.username}, Sectors
            </Typography>
          )}
        </Grid>
        <Grid item>
          <Button
            sx={{ mt: { xs: 2, md: 0 } }}
            variant="contained"
            startIcon={<AddTwoToneIcon fontSize="small" />}
            onClick={handleClickOpen}
          >
            Add Sector
          </Button>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Sector</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sector Name"
            fullWidth
            variant="outlined"
            value={sectorName}
            onChange={(e) => setSectorName(e.target.value)}
            error={!!error || nameExists}
            helperText={error || (nameExists && 'Sector name already exists') || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveSector} color="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          color={snackbarSeverity === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default PageHeader;
