import { useContext } from 'react';
import {
  Box,
  alpha,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  styled,
  useTheme
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import { SidebarContext } from 'src/contexts/SidebarContext';

import HeaderUserbox from './Userbox';
import HeaderNotification from '../../../components/NotificationSystem/HeaderNotification';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: 64px; /* fixed height instead of theme.header.height */
        color: ${theme.palette.text.primary};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.palette.background.default, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: 240px; /* sidebar width, adjust if needed */
            width: auto;
        }
`
);

function Header() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();

  return (
    <HeaderWrapper
      display="flex"
      alignItems="center"
      sx={{
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 1px 0 ${alpha(theme.palette.primary.light, 0.15)},
               0px 2px 8px -3px rgba(0, 0, 0, 0.2),
               0px 5px 22px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 8px -3px ${alpha(theme.palette.common.black, 0.2)},
               0px 5px 22px -4px ${alpha(theme.palette.common.black, 0.1)}`
      }}
    >
      {/* Left section (optional) */}
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={2}
      >
        {/* Example: place logo, breadcrumbs, or title here */}
      </Stack>

      {/* Right section */}
      <Box display="flex" alignItems="center">
        <HeaderNotification />
        <HeaderUserbox />
        <Box
          component="span"
          sx={{
            ml: 2,
            display: { lg: 'none', xs: 'inline-block' }
          }}
        >
          <Tooltip arrow title="Toggle Menu">
            <IconButton color="primary" onClick={toggleSidebar}>
              {!sidebarToggle ? (
                <MenuTwoToneIcon fontSize="small" />
              ) : (
                <CloseTwoToneIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

export default Header;
