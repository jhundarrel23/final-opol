import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import AdminSidebarLayout from 'src/layouts/AdminSidebarLayout';
import CoordinatorSidebarLayout from 'src/layouts/CoordinatorSidebarLayout';
import BeneficiarySidebarLayout from 'src/layouts/BeneficiarySidebarLayout';

import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import ProtectedRoute from 'src/hooks-auth/components/ProtectedRoute';

const Loader = (Component) => (props) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);


const AdminLogin = Loader(lazy(() => import('src/auth/authAdmin/Login')));
const CoordinatorLogin = Loader(lazy(() => import('src/auth/authCoordinator/Login')));
const BeneficiaryLogin = Loader(lazy(() => import('src/auth/authBeneficiary/Login')));
const CoordinatorRegister = Loader(lazy(() => import('src/auth/authCoordinator/Register')));
const BeneficiaryRegister = Loader(lazy(() => import('src/auth/authBeneficiary/Register')));
const BeneficiaryPasswordReset = Loader(lazy(() => import('src/auth/authBeneficiary/resetpassword')));

const CoordinatorForcePasswordReset = Loader(lazy(() => import('src/auth/authCoordinator/ForcePasswordReset')));
const CoordinatorPasswordReset = Loader(lazy(() => import('src/auth/authCoordinator/PasswordResetForm')));


const Admin = Loader(lazy(() => import('src/content/dashboards/Admin')));
const Transactions = Loader(lazy(() => import('src/content/applications/Transactions')));
const AdminUserProfile = Loader(lazy(() => import('src/content/applications/Users/profile')));
const AdminUserSettings = Loader(lazy(() => import('src/content/applications/Users/settings')));
const Sector = Loader(lazy(() => import('src/content/applications/Sector')));
const EnrollementBeneficiariesManagement = Loader(lazy(() => import('src/content/applications/Enrollement_Beneficiary_Management')));
const CoordinatorSettings = Loader(lazy(() => import('src/content/applications/Coordinator')));
const EnrollmentHistory = Loader(lazy(() => import('src/content/applications/Enrollement_Beneficiary_Management/EnrollmentHistory')));
const AdminProgramManagement = Loader(lazy(() => import('src/content/applications/Program_Management')));
const ProgramHistory = Loader(lazy(() => import('src/content/applications/Program_Management/ProgramHistory'))); 
const MaoInventory = Loader(lazy(() => import('src/content/applications/MaoInventory'))); 
const BeneficaryManagement  = Loader(lazy(() => import('src/content/applications/Beneficiary_Management')));



const Coordinator = Loader(lazy(() => import('src/coordinator_contents/dashboards/Coordinator')));
const BeneficiaryList = Loader(lazy(() => import('src/coordinator_contents/applications/BeneficiaryList')));
const EnrollmentInterviewManagement = Loader(lazy(() => import('src/coordinator_contents/applications/EnrollmentInterview')));
const ProgramManagement = Loader(lazy(() => import('src/coordinator_contents/applications/Program'))); 
const ServicesManagement = Loader(lazy(() => import('src/coordinator_contents/applications/Services')));
const InventoryManagement = Loader(lazy(() => import('src/coordinator_contents/applications/Inventory')));
const CoordiantorUserProfile = Loader(lazy(() => import('src/coordinator_contents/applications/Users/profile')));

const BeneficiaryDashboard = Loader(lazy(() => import('src/beneficiary_contents/dashboards/Beneficiary')));
const BeneficiaryUserProfile = Loader(lazy(() => import('src/beneficiary_contents/applications/Users/profile')));

const RSBSAForm = Loader(lazy(() => import('src/beneficiary_contents/applications/RSBSA_FORM')));
const FarmInformationPage = Loader(lazy(() => import('src/beneficiary_contents/applications/Users/farmInformation'))); 
const UpcomingDistribution = Loader(lazy(() => import('src/beneficiary_contents/applications/MySubsidy'))); 
const BeneficiarySubsidyHistory = Loader(lazy(() => import('src/beneficiary_contents/applications/MySubsidy/BeneficiarySubsidyHistory'))); 
const AccountSettings = Loader(lazy(() => import('src/beneficiary_contents/applications/AccountSettings'))); 




const HomePage = Loader(lazy(() => import('src/pages/Status/HomePage')));
const Status404 = Loader(lazy(() => import('src/pages/Status/Status404')));
const Status500 = Loader(lazy(() => import('src/pages/Status/Status500')));
const StatusComingSoon = Loader(lazy(() => import('src/pages/Status/ComingSoon')));
const StatusMaintenance = Loader(lazy(() => import('src/pages/Status/Maintenance')));


const CoordinatorDashboardWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
     
        if (user.must_reset_password) {
          navigate('/coordinator/force-reset-password');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [navigate]);

  return <Coordinator />;
};

const routes = [
  {
    path: '',
    element: <BaseLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'admin-login', element: <AdminLogin /> },
      { path: 'coordinator-login', element: <CoordinatorLogin /> },
      { path: 'coordinator/force-reset-password', element: <CoordinatorForcePasswordReset /> },
      { path: 'coordinator/reset-password', element: <CoordinatorPasswordReset /> },
      { path: 'beneficiary-login', element: <BeneficiaryLogin /> },
      { path: 'register', element: <CoordinatorRegister /> },
      { path: 'beneficiary-register', element: <BeneficiaryRegister /> },
      { path: 'beneficiary-password-reset', element: <BeneficiaryPasswordReset /> },
      

      {
        path: 'status',
        children: [
          { path: '', element: <Navigate to="404" replace /> },
          { path: '404', element: <Status404 /> },
          { path: '500', element: <Status500 /> },
          { path: 'maintenance', element: <StatusMaintenance /> },
          { path: 'coming-soon', element: <StatusComingSoon /> }
        ]
      },
      { path: '*', element: <Status404 /> }
    ]
  },

  // 🔴 Admin Routes
  {
    path: 'dashboards',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="Admin" replace /> },
      { path: 'Admin', element: <Admin /> },

    ]
  },
  {
    path: 'management',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="transactions" replace /> },
      { path: 'Sector', element: <Sector /> },
      { path: 'Coordinator', element: <CoordinatorSettings /> },
      { path: 'enrollement-beneficary-management', element: <EnrollementBeneficiariesManagement /> },
      { path: 'enrollment-history', element: <EnrollmentHistory /> },
      { path: 'Program', element: <AdminProgramManagement /> },
      { path: 'program-history', element: <ProgramHistory /> },
      { path: 'mao-inventory', element: <MaoInventory /> },
      { path: 'beneficiary-management', element: <BeneficaryManagement /> },

      {
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <AdminUserProfile /> },
          { path: 'settings', element: <AdminUserSettings /> }
        ]
      }
    ]
  },

  // 🟣 Coordinator Routes
  {
    path: 'coordinator',
    element: (
      <ProtectedRoute allowedRoles={['coordinator']}>
        <CoordinatorSidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <CoordinatorDashboardWrapper /> },
      { path: 'Beneficiary-list', element: <BeneficiaryList /> },
      { path: 'interviews', element: <EnrollmentInterviewManagement /> },
      { path: 'program-management', element: <ProgramManagement /> },
      { path: 'services-management', element: <ServicesManagement /> },
      { path: 'inventory-management', element: <InventoryManagement /> },


      {
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <CoordiantorUserProfile /> },
  
        ]
      },
      { path: '*', element: <Status404 /> }
    ]
  },

  // 🟢 Beneficiary Routes
  {
    path: 'beneficiary',
    element: (
      <ProtectedRoute allowedRoles={['beneficiary']}>
        <BeneficiarySidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <BeneficiaryDashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'upcoming-distribution', element: <UpcomingDistribution /> },
      { path: 'beneficiary-subsidy-history', element: <BeneficiarySubsidyHistory /> },
     { path: 'account-settings', element: <AccountSettings /> },

      {
        path: 'profile',
        children: [
          { path: '', element: <Navigate to="details" replace /> },
          { path: 'details', element: <BeneficiaryUserProfile /> },

        ]
      },
     { path: 'RSBSA_FORM', element: <RSBSAForm /> },
     { path: 'farm-information', element: <FarmInformationPage /> }, // ✅ Add this line
      {
        path: 'rsbsa',
        children: [{ path: '', element: <Navigate to="status" replace /> }]
      },
      { path: '*', element: <Status404 /> }
    ]
  },


  // 🌐 Global Catch-All
  { path: '*', element: <Status404 /> }
];

export default routes;
