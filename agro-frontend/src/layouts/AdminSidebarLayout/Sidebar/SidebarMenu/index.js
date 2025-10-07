/* eslint-disable no-unused-vars */
import { useContext } from 'react';

import {
  ListSubheader,
  alpha,
  Box,
  List,
  styled,
  Button,
  ListItem
} from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/SidebarContext';

// Updated Agriculture-Themed Icons
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import AgricultureTwoToneIcon from '@mui/icons-material/AgricultureTwoTone';
import GroupAddTwoToneIcon from '@mui/icons-material/GroupAddTwoTone';
import WarehouseTwoToneIcon from '@mui/icons-material/WarehouseTwoTone';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
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

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(1, 3)};
              font-size: ${theme.typography.pxToRem(13)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: #10b981;
                opacity: 0;
                transition: ${theme.transitions.create([
    'transform',
    'opacity'
  ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {
                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);

  return (
    <>
      <MenuWrapper>
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Dashboards
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
                  to="/dashboards/Admin"
                  startIcon={<DashboardTwoToneIcon />}
                >
                  Dashboard
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Management
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
                  to="/management/beneficiary-management"
                  startIcon={<PeopleAltTwoToneIcon />}
                >
                  Users
                </Button>
              </ListItem>

              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/program"
                  startIcon={<DescriptionTwoToneIcon />}
                >
                  Programs
                </Button>
              </ListItem>

              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/Sector"
                  startIcon={<AgricultureTwoToneIcon />}
                >
                  Agricultural Sectors
                </Button>
              </ListItem>

              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/enrollement-beneficary-management"
                  startIcon={<GroupAddTwoToneIcon />}
                >
                  Enrollment Beneficiaries
                </Button>
              </ListItem>

              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/mao-inventory"
                  startIcon={<WarehouseTwoToneIcon />}
                >
                  Monitor Inventory
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Accounts
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
                  to="/management/Coordinator"
                  startIcon={<AdminPanelSettingsTwoToneIcon />}
                >
                  Coordinator
                </Button>
              </ListItem>
              
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/profile/details"
                  startIcon={<AccountCircleTwoToneIcon />}
                >
                  User Profile
                </Button>
              </ListItem>
              
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/management/profile/settings"
                  startIcon={<SettingsTwoToneIcon />}
                >
                  Account Settings
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>
      </MenuWrapper>
    </>
  );
}

export default SidebarMenu;