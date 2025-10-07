/* eslint-disable no-unused-vars */
import { useContext } from 'react';
import {
  ListSubheader,
  Box,
  List,
  styled,
  Button,
  ListItem,
  Badge
} from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/SidebarContext';

import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import AssignmentIndTwoToneIcon from '@mui/icons-material/AssignmentIndTwoTone';
import CardMembershipTwoToneIcon from '@mui/icons-material/CardMembershipTwoTone';
import RedeemTwoToneIcon from '@mui/icons-material/RedeemTwoTone';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import LocalShippingTwoToneIcon from '@mui/icons-material/LocalShippingTwoTone';
import HistoryTwoToneIcon from '@mui/icons-material/HistoryTwoTone';
import ReceiptLongTwoToneIcon from '@mui/icons-material/ReceiptLongTwoTone';
import LibraryBooksTwoToneIcon from '@mui/icons-material/LibraryBooksTwoTone';
import SupportAgentTwoToneIcon from '@mui/icons-material/SupportAgentTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

  .MuiListSubheader-root {
    text-transform: uppercase;
    font-weight: 700;
    font-size: ${theme.typography.pxToRem(11)};
    color: rgba(255, 255, 255, 0.5);
    padding: ${theme.spacing(2, 2.5)};
    line-height: 1.4;
    letter-spacing: 0.8px;
    margin-top: ${theme.spacing(1)};
  }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    .MuiListItem-root {
      padding: 1px 0;

      .MuiBadge-root {
        position: absolute;
        right: ${theme.spacing(3.2)};

        .MuiBadge-standard {
          background: ${theme.colors.primary.main};
          font-size: ${theme.typography.pxToRem(10)};
          font-weight: bold;
          text-transform: uppercase;
          color: ${theme.palette.primary.contrastText};
        }
      }
  
      .MuiButton-root {
        display: flex;
        color: rgba(255, 255, 255, 0.85);
        background-color: transparent;
        width: 100%;
        justify-content: flex-start;
        padding: ${theme.spacing(1.4, 2.5)};
        border-radius: 8px;
        margin: ${theme.spacing(0.3, 0)};
        font-weight: 500;
        font-size: ${theme.typography.pxToRem(14)};
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: #10b981;
          transform: scaleY(0);
          transition: transform 0.2s ease;
        }

        .MuiButton-startIcon,
        .MuiButton-endIcon {
          transition: ${theme.transitions.create(['color', 'transform'])};

          .MuiSvgIcon-root {
            font-size: inherit;
            transition: transform 0.3s ease;
          }
        }

        .MuiButton-startIcon {
          color: rgba(255, 255, 255, 0.7);
          font-size: ${theme.typography.pxToRem(22)};
          margin-right: ${theme.spacing(1.5)};
        }
        
        .MuiButton-endIcon {
          color: rgba(255, 255, 255, 0.6);
          margin-left: auto;
          opacity: .8;
          font-size: ${theme.typography.pxToRem(20)};
        }

        &.active {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);

          &:before {
            transform: scaleY(1);
          }

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            color: #10b981;
          }

          .MuiButton-startIcon .MuiSvgIcon-root {
            transform: scale(1.15) rotate(5deg);
          }
        }

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transform: translateX(4px);

          .MuiButton-startIcon {
            color: #10b981;
          }

          .MuiButton-startIcon .MuiSvgIcon-root {
            transform: scale(1.2) rotate(-5deg);
            animation: iconBounce 0.5s ease;
          }

          .MuiButton-endIcon {
            color: rgba(255, 255, 255, 0.9);
          }
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1.2) rotate(-5deg); }
          50% { transform: scale(1.3) rotate(-8deg); }
        }
      }
    }
  }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);

  return (
    <MenuWrapper>
      {/* Dashboard */}
      <List component="div">
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/dashboard"
                startIcon={<DashboardTwoToneIcon />}
              >
                Dashboard
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* Profile Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            My Profile
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/profile/details"
                startIcon={<PersonTwoToneIcon />}
              >
                Personal Details
              </Button>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/farm-information"
                startIcon={<AssignmentIndTwoToneIcon />}
              >
                Farm Information
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* RSBSA Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            RSBSA Registration
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/RSBSA_FORM"
                startIcon={<CardMembershipTwoToneIcon />}
              >
                Apply for RSBSA
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* Benefits Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Benefits & Programs
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/benefits/available"
                startIcon={<RedeemTwoToneIcon />}
              >
                Available Programs
              </Button>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/upcoming-distribution"
                startIcon={<NotificationsActiveTwoToneIcon />}
              >
                Upcoming Distribution
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* History Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Transaction History
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/history/received"
                startIcon={<HistoryTwoToneIcon />}
              >
                Benefits Received
              </Button>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/history/documents"
                startIcon={<ReceiptLongTwoToneIcon />}
              >
                Documents & Records
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>

      {/* Support Section */}
      <List
        component="div"
        subheader={
          <ListSubheader component="div" disableSticky>
            Help & Support
          </ListSubheader>
        }
      >
        <SubMenuWrapper>
          <List component="div">
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/resources"
                startIcon={<LibraryBooksTwoToneIcon />}
              >
                Resources & Guides
              </Button>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/support"
                startIcon={<SupportAgentTwoToneIcon />}
              >
                Contact Support
              </Button>
            </ListItem>
            <ListItem component="div">
              <Button
                disableRipple
                component={RouterLink}
                onClick={closeSidebar}
                to="/beneficiary/account-settings"
                startIcon={<SettingsTwoToneIcon />}
              >
                Account Settings
              </Button>
            </ListItem>
          </List>
        </SubMenuWrapper>
      </List>
    </MenuWrapper>
  );
}

export default SidebarMenu;