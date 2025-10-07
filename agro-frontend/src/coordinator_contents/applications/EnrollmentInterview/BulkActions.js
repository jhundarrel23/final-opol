import { useState, useRef } from 'react';
import {
  Box,
  Menu,
  IconButton,
  Button,
  ListItemText,
  ListItem,
  List,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import axiosInstance from '../../../api/axiosInstance';

// Custom styled delete button
const ButtonError = styled(Button)(({ theme }) => `
  background: ${theme.colors.error.main};
  color: ${theme.palette.error.contrastText};
  &:hover {
    background: ${theme.colors.error.dark};
  }
`);

function BulkActions({ selectedInterviews, refreshInterviews }) {
  const [onMenuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // 'error' or 'success'

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const handleBulkDelete = async () => {
    if (selectedInterviews.length === 0) return;

    try {
      await axiosInstance.post('/api/enrollments/bulk-delete', {
        enrollment_ids: selectedInterviews
      });

      refreshInterviews();

      setSnackbarMessage('Selected interviews successfully deleted');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      closeMenu();
    } catch (error) {
      console.error('Error during bulk delete:', error);
      setSnackbarMessage('Error during bulk delete');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleBulkEdit = () => {
    if (selectedInterviews.length === 0) return;
    // 🔧 Implement bulk edit logic here if needed
    closeMenu();
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="h5" color="text.secondary">
            Bulk actions:
          </Typography>
          <ButtonError
            sx={{ ml: 1 }}
            startIcon={<DeleteTwoToneIcon />}
            variant="contained"
            onClick={handleBulkDelete}
            disabled={selectedInterviews.length === 0}
          >
            Delete
          </ButtonError>
        </Box>
        <IconButton
          color="primary"
          onClick={openMenu}
          ref={moreRef}
          sx={{ ml: 2, p: 1 }}
        >
          <MoreVertTwoToneIcon />
        </IconButton>
      </Box>

      <Menu
        keepMounted
        anchorEl={moreRef.current}
        open={onMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <List sx={{ p: 1 }} component="nav">
          <ListItem button onClick={handleBulkDelete}>
            <ListItemText primary="Bulk delete selected" />
          </ListItem>
          <ListItem button onClick={handleBulkEdit}>
            <ListItemText primary="Bulk edit selected" />
          </ListItem>
        </List>
      </Menu>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BulkActions;
