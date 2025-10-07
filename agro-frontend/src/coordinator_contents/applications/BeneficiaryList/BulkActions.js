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
  Divider,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';

import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import PendingTwoToneIcon from '@mui/icons-material/PendingTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import FileDownloadTwoToneIcon from '@mui/icons-material/FileDownloadTwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';

const ButtonError = styled(Button)(
  ({ theme }) => `
     background: ${theme.colors?.error?.main || theme.palette.error.main};
     color: ${theme.palette.error.contrastText};
     
     &:hover {
       background: ${theme.colors?.error?.dark || theme.palette.error.dark};
     }
    `
);

const ButtonSuccess = styled(Button)(
  ({ theme }) => `
     background: ${theme.colors?.success?.main || theme.palette.success.main};
     color: ${theme.palette.success.contrastText};
     
     &:hover {
       background: ${theme.colors?.success?.dark || theme.palette.success.dark};
     }
    `
);

const ButtonWarning = styled(Button)(
  ({ theme }) => `
     background: ${theme.colors?.warning?.main || theme.palette.warning.main};
     color: ${theme.palette.warning.contrastText};
     
     &:hover {
       background: ${theme.colors?.warning?.dark || theme.palette.warning.dark};
     }
    `
);

function BulkActions({ selectedCount = 0, onBulkAction }) {
  const [onMenuOpen, menuOpen] = useState(false);
  const moreRef = useRef(null);

  const openMenu = () => {
    menuOpen(true);
  };

  const closeMenu = () => {
    menuOpen(false);
  };

  const handleBulkAction = (action) => {
    if (onBulkAction) {
      onBulkAction(action);
    }
    closeMenu();
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: '14px' }}>
            {selectedCount} beneficiar{selectedCount === 1 ? 'y' : 'ies'} selected:
          </Typography>
          
          <ButtonSuccess
            size="small"
            startIcon={<CheckCircleTwoToneIcon />}
            variant="contained"
            onClick={() => handleBulkAction('approve')}
          >
            Approve
          </ButtonSuccess>
          
          <ButtonWarning
            size="small"
            startIcon={<PendingTwoToneIcon />}
            variant="contained"
            onClick={() => handleBulkAction('pending')}
          >
            Set Pending
          </ButtonWarning>
          
          <ButtonError
            size="small"
            startIcon={<CancelTwoToneIcon />}
            variant="contained"
            onClick={() => handleBulkAction('reject')}
          >
            Reject
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <List sx={{ p: 1 }} component="nav">
          <ListItem 
            button 
            onClick={() => handleBulkAction('edit')}
          >
            <ListItemIcon>
              <EditTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Bulk Edit Information" 
              secondary="Update multiple beneficiaries"
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => handleBulkAction('generate-rsbsa')}
          >
            <ListItemIcon>
              <AssignmentTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Generate RSBSA Numbers" 
              secondary="Auto-assign RSBSA numbers"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem 
            button 
            onClick={() => handleBulkAction('export')}
          >
            <ListItemIcon>
              <FileDownloadTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Export to Excel" 
              secondary="Download selected records"
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => handleBulkAction('export-pdf')}
          >
            <ListItemIcon>
              <FileDownloadTwoToneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Export to PDF" 
              secondary="Generate PDF report"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem 
            button 
            onClick={() => handleBulkAction('delete')}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteTwoToneIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Delete Selected" 
              secondary="Permanently remove records"
            />
          </ListItem>
        </List>
      </Menu>
    </>
  );
}

export default BulkActions;