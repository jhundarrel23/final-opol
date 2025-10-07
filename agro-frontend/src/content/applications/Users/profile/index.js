import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';

import { Grid, Container } from '@mui/material';

import ProfileCover from './ProfileCover';
import RecentActivity from './RecentActivity';
import Feed from './Feed';
import PopularTags from './PopularTags';
import MyCards from './MyCards';
import Addresses from './Addresses';

function ManagementUserProfile() {
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};

  const user = {
    savedCards: storedUser.savedCards || 0,
    name: storedUser.name || storedUser.username || storedUser.email || 'Unknown User',
    coverImg: '/static/images/placeholders/covers/5.jpg',
    avatar: '/static/images/avatars/4.jpg',
    description:
      storedUser.description ||
      'No description provided. You can update your profile to add more info.',
    jobtitle: storedUser.jobtitle || 'N/A',
    location: storedUser.location || 'N/A',
    followers: storedUser.followers || '0'
  };

  return (
    <>
      <Helmet>
        <title>User Details - Management</title>
      </Helmet>
      <Container sx={{ mt: 3 }} maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12} md={8}>
            <ProfileCover user={user} />
          </Grid>
          <Grid item xs={12} md={4}>
            <RecentActivity />
          </Grid>
          <Grid item xs={12} md={8}>
            <Feed />
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularTags />
          </Grid>
          <Grid item xs={12} md={7}>
            <MyCards />
          </Grid>
          <Grid item xs={12} md={5}>
            <Addresses />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default ManagementUserProfile;
