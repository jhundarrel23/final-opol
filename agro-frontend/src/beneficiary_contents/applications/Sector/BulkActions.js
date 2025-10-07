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
import axios from 'axios';

// Custom styled delete button
const ButtonError = styled(Button)(({ theme }) => `
  background: ${theme.colors.error.main};
  color: ${theme.palette.error.contrastText};
  &:hover {
    background: ${theme.colors.error.dark};
  }
`);

function BulkActions({ selectedCourses, refreshCourses }) {
  const [onMenuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // 'error' or 'success'

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbarMessage('Token is missing');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      // Send the selected course IDs to the backend to mark as deleted
      await axios.post(
        'http://localhost:8000/api/course-categories/bulk-delete',
        { course_ids: selectedCourses },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        }
      );

      // Optionally, you can refresh the course list after deletion
      refreshCourses();

      setSnackbarMessage('Courses successfully deleted');
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
    if (selectedCourses.length === 0) return;
    // Implement the bulk edit logic here if needed
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
            disabled={selectedCourses.length === 0}
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
