import {
  Typography,
  Grid
} from '@mui/material';

const getStoredUser = () => {
  try {
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) return JSON.parse(sessionUser);

    const localUser = localStorage.getItem('user');
    if (localUser) return JSON.parse(localUser);

    return null;
  } catch (error) {
    console.error('Failed to parse user from storage', error);
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    return null;
  }
};

function PageHeader() {
  const user = getStoredUser();

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" gutterBottom>
          RSBSA Beneficiaries
        </Typography>
        {user && (
          <Typography variant="subtitle2">
            {user.username}, manage your beneficiaries
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

export default PageHeader;