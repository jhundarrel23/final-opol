import { Typography, Avatar, Grid, useTheme } from '@mui/material';

function PageHeader() {
  console.log('PageHeader: Rendering coordinator page header');
  
  // ✅ Look for user in sessionStorage first, then localStorage
  const storedUser =
    JSON.parse(sessionStorage.getItem('user')) ||
    JSON.parse(localStorage.getItem('user')) ||
    {};

  const user = {
    name:
      (storedUser.fname && storedUser.lname
        ? `${storedUser.fname} ${storedUser.lname}`
        : storedUser.username || storedUser.email) || 'User',
    avatar: storedUser.avatar || '/static/images/avatars/coordinator.png'
  };

  const theme = useTheme();

  return (
    <Grid container alignItems="center">
      <Grid item>
        <Avatar
          sx={{
            mr: 2,
            width: theme.spacing(8),
            height: theme.spacing(8)
          }}
          variant="rounded"
          alt={user.name}
          src={user.avatar}
        />
      </Grid>
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="subtitle2">
          Manage farmer profiles, inventories, and subsidies efficiently
        </Typography>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
