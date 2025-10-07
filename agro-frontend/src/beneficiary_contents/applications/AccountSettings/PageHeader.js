import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  Container,
  Grid,
  Card,
  Box,
  Typography,
  Avatar,
  styled
} from '@mui/material';

import SecurityTwoToneIcon from '@mui/icons-material/SecurityTwoTone';

const AvatarPrimary = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.palette.primary.main};
    color: ${theme.palette.primary.contrastText};
    width: ${theme.spacing(8)};
    height: ${theme.spacing(8)};
    box-shadow: ${theme.colors.shadows.primary};
`
);

function PageHeader() {
  return (
    <>
      <Helmet>
        <title>Account Settings</title>
      </Helmet>
      <PageTitleWrapper>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <Box p={3}>
                  <Box display="flex" alignItems="center">
                    <AvatarPrimary>
                      <SecurityTwoToneIcon fontSize="large" />
                    </AvatarPrimary>
                    <Box ml={2}>
                      <Typography variant="h3" component="h3" gutterBottom>
                        Account Settings
                      </Typography>
                      <Typography variant="subtitle2">
                        Manage your account security and password settings
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </PageTitleWrapper>
    </>
  );
}

export default PageHeader;
