/* eslint-disable no-unused-vars */
import {
  Box,
  Tooltip,
  tooltipClasses,
  styled,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

// Handle dashboard path based on role
function getDashboardPath() {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toLowerCase();
  
  switch (role) {
    case 'admin':
      return '/admin/overview';
    case 'coordinator':
      return '/coordinator/overview';
    case 'beneficiary':
      return '/beneficiary/overview';
    default:
      return '/login';
  }
}

const LogoWrapper = styled(Link)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: 280px;
    height: 280px;
    margin: 0 auto;
    position: relative;
`
);

const LogoImage = styled('img')(
  () => `
    width: 240px;
    height: 240px;
    object-fit: contain;
    border-radius: 28px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
    
    &:hover {
      transform: scale(1.1) rotate(2deg);
      filter: drop-shadow(0 12px 24px rgba(16, 185, 129, 0.3));
    }
`
);

const GrowthRing = styled(Box)(
  ({ size, opacity, delay }) => `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border: 2px solid rgba(255, 255, 255, ${opacity});
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulseRing 4s ease-in-out infinite;
    animation-delay: ${delay}s;

    @keyframes pulseRing {
      0%, 100% {
        opacity: ${opacity};
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        opacity: ${opacity * 0.3};
        transform: translate(-50%, -50%) scale(1.15);
      }
    }
`
);

const TooltipWrapper = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(6, 95, 70, 0.98)',
    color: '#ffffff',
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 600,
    borderRadius: '12px',
    padding: '12px 16px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 8px 32px rgba(6, 95, 70, 0.4), 0 2px 8px rgba(0,0,0,0.2)'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(6, 95, 70, 0.98)'
  }
}));

function Logo() {
  const theme = useTheme();
  const dashboardPath = getDashboardPath();

  return (
    <TooltipWrapper
      title="Agricultural Management System"
      arrow
      placement="right"
    >
      <LogoWrapper to={dashboardPath}>
        {/* Animated Growth Rings with White color for visibility */}
        <GrowthRing size={270} opacity={0.5} delay={0} />
        <GrowthRing size={310} opacity={0.35} delay={0.8} />
        <GrowthRing size={350} opacity={0.2} delay={1.6} />

        {/* Logo Image */}
        <LogoImage 
          src="/static/images/logo/logo.png" 
          alt="Agricultural Management Logo"
          onError={(e) => {
            console.warn('Logo image failed to load');
            e.target.style.display = 'none';
          }}
        />
      </LogoWrapper>
    </TooltipWrapper>
  );
}

export default Logo;