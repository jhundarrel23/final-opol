# Beneficiary Authentication Hooks

This directory contains React hooks for managing beneficiary authentication and data in the OPOL-AGRISYS system.

## Hooks Overview

### 1. `useLoginBeneficiary`

The main hook for handling beneficiary login. It now integrates with the `rsbsaService` to automatically fetch and store beneficiary details after successful login.

**Features:**
- Handles login form state and validation
- Integrates with backend authentication API
- Automatically fetches beneficiary details using `rsbsaService`
- Stores beneficiary ID and RSBSA information in localStorage
- Redirects to dashboard after successful login

**Usage:**
```jsx
import useLoginBeneficiary from 'src/hooks-auth/hooks-auth-beneficiary/useLoginBeneficiary';

const LoginComponent = () => {
  const {
    formData,
    handleChange,
    handleLogin,
    error,
    success,
    isLoading
  } = useLoginBeneficiary();

  return (
    <form onSubmit={handleLogin}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username or Email"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
};
```

### 2. `useBeneficiaryData`

A utility hook for accessing beneficiary data stored in localStorage after login.

**Features:**
- Provides easy access to beneficiary ID, RSBSA number, and full details
- Automatically loads data from localStorage
- Includes utility functions for data management
- Handles data clearing for logout scenarios

**Usage:**
```jsx
import useBeneficiaryData from 'src/hooks-auth/hooks-auth-beneficiary/useBeneficiaryData';

const BeneficiaryProfile = () => {
  const {
    beneficiaryId,
    rsbsaNumber,
    beneficiaryDetails,
    hasBeneficiaryData,
    getRSBSANumber,
    refreshBeneficiaryData
  } = useBeneficiaryData();

  if (!hasBeneficiaryData()) {
    return <div>Loading beneficiary data...</div>;
  }

  return (
    <div>
      <h2>Beneficiary Profile</h2>
      <p>Beneficiary ID: {beneficiaryId}</p>
      <p>RSBSA Number: {getRSBSANumber()}</p>
      <p>Name: {beneficiaryDetails?.fname} {beneficiaryDetails?.lname}</p>
      <p>Contact: {beneficiaryDetails?.contact_number}</p>
      
      <button onClick={refreshBeneficiaryData}>
        Refresh Data
      </button>
    </div>
  );
};
```

## Data Flow

1. **Login Process:**
   - User submits login credentials
   - Backend validates and returns user data + token
   - `useLoginBeneficiary` stores authentication data
   - Automatically calls `rsbsaService.beneficiaryDetailsService.getDetailsByUserId()`
   - Stores beneficiary ID, RSBSA number, and full details in localStorage

2. **Data Access:**
   - Other components use `useBeneficiaryData` hook
   - Hook automatically loads data from localStorage
   - Provides reactive access to beneficiary information

3. **Logout Process:**
   - `HeaderUserbox` component handles logout
   - Clears all authentication and beneficiary data
   - Redirects to login page

## Stored Data

The following data is stored in localStorage after successful login:

- `beneficiaryId`: The unique identifier for the beneficiary
- `rsbsaNumber`: The RSBSA number (system generated or manual)
- `beneficiaryDetails`: Complete beneficiary profile information
- `token`: Authentication token
- `user`: User authentication data
- `userRole`: User role (beneficiary)

## Integration with rsbsaService

The login hook now automatically integrates with the existing `rsbsaService` to:

- Fetch beneficiary details after successful authentication
- Retrieve RSBSA numbers and enrollment information
- Store comprehensive beneficiary data for use throughout the application

This eliminates the need to make separate API calls in other components and ensures data consistency across the application.

## Error Handling

Both hooks include comprehensive error handling:

- Network errors are caught and logged
- Invalid data is handled gracefully
- Fallback values are provided when data is unavailable
- Console logging for debugging purposes

## Best Practices

1. **Always check data availability** using `hasBeneficiaryData()` before rendering
2. **Use the provided utility functions** like `getRSBSANumber()` and `getBeneficiaryId()` for consistent data access
3. **Handle loading states** appropriately in your components
4. **Clear data on logout** to prevent data leakage
5. **Refresh data when needed** using `refreshBeneficiaryData()`

## Troubleshooting

### Common Issues

#### 1. Beneficiary ID is null when submitting RSBSA form

**Problem:** The RSBSA form shows "beneficiary ID is null" error when submitting.

**Solution:** The system now automatically handles this by:
- Setting the user ID as beneficiary ID if no beneficiary details exist yet
- Automatically initializing the RSBSA form with the correct beneficiary ID
- Providing fallback mechanisms to ensure the form can be submitted

**Debug Steps:**
1. Use the `DebugBeneficiaryData` component to check the current state
2. Verify that the user is logged in and has a valid token
3. Check if beneficiary details exist in the RSBSA system
4. Ensure the RSBSA form is using the `useBeneficiaryData` hook

#### 2. RSBSA form not getting beneficiary ID

**Problem:** The RSBSA form doesn't automatically populate the beneficiary ID field.

**Solution:** The RSBSA form hook now includes a `useEffect` that:
- Automatically reads the beneficiary ID from localStorage
- Sets the form data with the correct beneficiary ID
- Falls back to user ID if no beneficiary details exist

### Debug Component

Use the `DebugBeneficiaryData` component to troubleshoot issues:

```jsx
import DebugBeneficiaryData from 'src/hooks-auth/hooks-auth-beneficiary/DebugBeneficiaryData';

// Add this to your component to see the current state
<DebugBeneficiaryData />
```

This component shows:
- Current hook state
- LocalStorage contents
- Raw data for debugging
- Refresh functionality
