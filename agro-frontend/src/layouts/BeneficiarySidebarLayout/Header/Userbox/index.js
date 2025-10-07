import { useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
  styled,
  lighten
} from '@mui/material';

import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';

const UserBoxButton = styled(Button)(({ theme }) => `
  padding-left: ${theme.spacing(1)};
  padding-right: ${theme.spacing(1)};
`);

const MenuUserBox = styled(Box)(({ theme }) => `
  background: ${theme.colors.alpha.black[5]};
  padding: ${theme.spacing(2)};
`);

const UserBoxText = styled(Box)(({ theme }) => `
  text-align: left;
  padding-left: ${theme.spacing(1)};
`);

const UserBoxLabel = styled(Typography)(({ theme }) => `
  font-weight: ${theme.typography.fontWeightBold};
  color: ${theme.palette.secondary.main};
  display: block;
`);

const UserBoxDescription = styled(Typography)(({ theme }) => `
  color: ${lighten(theme.palette.secondary.main, 0.5)};
`);

function HeaderUserbox() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  // Get stored user data with error handling
  const getStoredUser = () => {
    try {
      // Check both localStorage and sessionStorage for compatibility
      let userStr = localStorage.getItem('userData') || localStorage.getItem('user');
      
      // Fallback to sessionStorage if not found in localStorage
      if (!userStr) {
        userStr = sessionStorage.getItem('userData');
      }
      
      return userStr ? JSON.parse(userStr) : {};
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return {};
    }
  };

  const storedUser = getStoredUser();

  const user = {
    name:
      storedUser.fname && storedUser.lname
        ? `${storedUser.fname} ${storedUser.lname}`
        : storedUser.username || storedUser.email || 'Unknown User',
    avatar: storedUser.avatar || '/static/images/avatars/profile.png',
    role: storedUser.role || 'beneficiary',
    sector: storedUser?.sector?.sector_name || 'Agricultural Beneficiary'
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
const handleSignOut = () => {
  // Close the popover
  setOpen(false);

  // Clear all localStorage authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Clear beneficiary-specific data
  localStorage.removeItem('beneficiaryId');
  localStorage.removeItem('rsbsaNumber');
  localStorage.removeItem('beneficiaryDetails');

  // Clear all sessionStorage authentication data
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userData');

  // Navigate to beneficiary login
  navigate('/beneficiary-login', { replace: true });
};

  return (
    <>
      <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
        <Avatar variant="rounded" alt={user.name} src={user.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.role === 'beneficiary' ? 'Beneficiary' : user.role} - {user.sector}
            </UserBoxDescription>
          </UserBoxText>
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
      </UserBoxButton>

      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          <Avatar variant="rounded" alt={user.name} src={user.avatar} />
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.role === 'beneficiary' ? 'Beneficiary' : user.role} - {user.sector}
            </UserBoxDescription>
          </UserBoxText>
        </MenuUserBox>
        <Divider sx={{ mb: 0 }} />
        <List sx={{ p: 1 }} component="nav">
          <ListItem button to="/beneficiary/profile/details" component={NavLink}>
            <AccountBoxTwoToneIcon fontSize="small" />
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem button to="/beneficiary/messenger" component={NavLink}>
            <InboxTwoToneIcon fontSize="small" />
            <ListItemText primary="Messenger" />
          </ListItem>
          <ListItem button to="/beneficiary/profile/settings" component={NavLink}>
            <AccountTreeTwoToneIcon fontSize="small" />
            <ListItemText primary="Account Settings" />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ m: 1 }}>
          <Button color="primary" fullWidth onClick={handleSignOut}>
            <LockOpenTwoToneIcon sx={{ mr: 1 }} />
            Sign out
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default HeaderUserbox;