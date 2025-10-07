import {
  Box,
  Card,
  Typography,
  Container,
  Divider,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  styled
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { useNavigate } from 'react-router-dom';

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
);

const OutlinedInputWrapper = styled(OutlinedInput)(
  ({ theme }) => `
    background-color: ${theme.colors.alpha.white[100]};
`
);

const ButtonSearch = styled(Button)(
  ({ theme }) => `
    margin-right: -${theme.spacing(1)};
`
);

function Status404() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    // Always go to homepage
    navigate('/', { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Status - 404</title>
      </Helmet>
      <MainContent>
        <Container maxWidth="md">
          <Box textAlign="center">
            <img alt="404" height={180} src="/static/images/status/404.svg" />
            <Typography variant="h2" sx={{ my: 2 }}>
              The page you were looking for doesn't exist. PAGES
            </Typography>
            <Typography
              variant="h4"
              color="text.secondary"
              fontWeight="normal"
              sx={{ mb: 4 }}
            >
              It's on us. We moved the content to a different page.
              The search below might help.
            </Typography>
          </Box>

          <Container maxWidth="sm">
            <Card sx={{ textAlign: 'center', mt: 3, p: 4 }}>
              <FormControl variant="outlined" fullWidth>
                <OutlinedInputWrapper
                  type="text"
                  placeholder="Search terms here..."
                  endAdornment={
                    <InputAdornment position="end">
                      <ButtonSearch variant="contained" size="small">
                        Search
                      </ButtonSearch>
                    </InputAdornment>
                  }
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  }
                />
              </FormControl>

              <Divider sx={{ my: 4 }}>OR</Divider>

              <Button onClick={handleRedirect} variant="outlined">
                Go to homepage
              </Button>
            </Card>
          </Container>
        </Container>
      </MainContent>
    </>
  );
}

export default Status404;
