/* eslint-disable no-unused-vars */
import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  lighten,
  darken,
  Button,
  Typography
} from '@mui/material';

import SidebarMenu from './SidebarMenu';
import Logo from 'src/components/LogoSign';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
        
        /* Hide scrollbar but keep functionality - Enhanced */
        & .scrollbar-container,
        & .Scrollbar,
        & > div,
        & [class*="Scrollbar"],
        & [class*="scrollbar"] {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE and Edge */
          
          &::-webkit-scrollbar {
            display: none !important; /* Chrome, Safari, Opera */
            width: 0 !important;
            height: 0 !important;
          }
        }
        
        /* Target any scrollable element within */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          
          &::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        }
`
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      {/* Desktop Sidebar */}
      <SidebarWrapper
        sx={{
          display: { xs: 'none', lg: 'inline-block' },
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'linear-gradient(180deg, #064e3b 0%, #047857 50%, #059669 100%)',
          boxShadow: '0 0 40px rgba(5, 150, 105, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none'
          },

          /* Additional scrollbar hiding for this specific instance */
          '& *': {
            scrollbarWidth: 'none !important',
            msOverflowStyle: 'none !important',
            '&::-webkit-scrollbar': {
              display: 'none !important'
            }
          }
        }}
      >
        <Scrollbar>
          <Box 
            mt={3} 
            mb={2}
            display="flex" 
            justifyContent="center"
          >
            <Logo />
          </Box>

          <Divider
            sx={{
              mt: theme.spacing(4),
              mx: theme.spacing(2),
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              height: '1px',
              border: 'none'
            }}
          />

          <SidebarMenu />
        </Scrollbar>

        <Divider
          sx={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
            height: '1px',
            border: 'none'
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          Agricultural Management System
        </Box>
      </SidebarWrapper>

      {/* Mobile Drawer */}
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`,
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(180deg, #064e3b 0%, #047857 50%, #059669 100%)',
            overflow: 'hidden',
            
            /* Hide scrollbar in drawer */
            '& *': {
              scrollbarWidth: 'none !important',
              msOverflowStyle: 'none !important',
              '&::-webkit-scrollbar': {
                display: 'none !important'
              }
            }
          }
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background: 'transparent',
            
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
              pointerEvents: 'none'
            },

            /* Additional scrollbar hiding for mobile drawer */
            '& *': {
              scrollbarWidth: 'none !important',
              msOverflowStyle: 'none !important',
              '&::-webkit-scrollbar': {
                display: 'none !important'
              }
            }
          }}
        >
          <Scrollbar>
            <Box 
              mt={3} 
              mb={2}
              display="flex" 
              justifyContent="center"
            >
              <Logo />
            </Box>

            <Divider
              sx={{
                mt: theme.spacing(4),
                mx: theme.spacing(2),
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                height: '1px',
                border: 'none'
              }}
            />

            <SidebarMenu />
          </Scrollbar>

          <Divider
            sx={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              height: '1px',
              border: 'none'
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            Agricultural Management System
          </Box>
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;