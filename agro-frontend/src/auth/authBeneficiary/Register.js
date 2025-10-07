import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Sprout } from 'lucide-react';
import {
  InputField,
  PasswordField,
  CheckboxField,
  InputGroup,
  FormStep,
  ProgressIndicator,
  Alert
} from './InputComponents';
import './auth.css';
import useRegisterBeneficiary from '../../hooks-auth/hooks-auth-beneficiary/useRegisterBeneficiary';

export default function RegisterBeneficiary() {
  const {
    formData,
    handleChange,
    handleRegister,
    formErrors,
    error,
    success,
    isLoading,
    isCheckingUsername,
    isCheckingEmail
  } = useRegisterBeneficiary();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  // Standard Terms and Conditions Text
  const termsAndConditionsText = `
TERMS AND CONDITIONS FOR MUNICIPAL AGRICULTURAL OFFICE BENEFICIARY PROGRAM

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By registering as a beneficiary, you agree to be bound by these Terms and Conditions and acknowledge your responsibilities as a participant in the Municipal Agricultural Office assistance program.

2. ELIGIBILITY AND REQUIREMENTS
- You must be a legitimate farmer or agricultural worker within the municipality
- You must be at least 18 years old or have legal guardian consent
- You must provide accurate and complete information during registration
- You must maintain active farming operations to remain eligible for assistance

3. BENEFICIARY RESPONSIBILITIES
- Use agricultural inputs (seeds, fertilizers, tools, etc.) solely for legitimate farming purposes
- Maintain accurate records of distributed assistance and crop production
- Report crop progress and harvest results as requested by coordinators
- Participate in training programs and agricultural seminars when required
- Allow periodic inspections of farming operations by authorized personnel

4. ASSISTANCE PROGRAM BENEFITS
The Municipal Agricultural Office may provide:
- Free or subsidized seeds and planting materials
- Agricultural tools and equipment
- Fertilizers and soil amendments
- Technical assistance and training
- Market linkage support
- Crop insurance enrollment assistance

5. OBLIGATIONS AND COMPLIANCE
- Use provided inputs within the specified timeframe
- Follow recommended agricultural practices and guidelines
- Not sell, transfer, or misuse distributed agricultural inputs
- Maintain the intended purpose of cultivated land
- Comply with all local agricultural regulations and environmental policies

6. DATA COLLECTION AND PRIVACY
We collect personal and farming information to:
- Verify eligibility for assistance programs
- Monitor distribution of agricultural inputs
- Track program effectiveness and crop productivity
- Comply with government reporting requirements

7. PROGRAM LIMITATIONS
- Assistance is subject to budget availability and program guidelines
- Priority may be given based on farm size, crop type, or community needs
- The municipality reserves the right to modify or discontinue programs
- Individual assistance amounts may vary based on assessment and availability

8. TERMINATION OF BENEFITS
Your participation may be terminated if you:
- Provide false information or documentation
- Misuse agricultural inputs or assistance
- Fail to comply with program requirements
- Cease active farming operations
- Violate local agricultural or environmental regulations

9. CONTACT AND SUPPORT
For questions about this program or these terms, contact:
Municipal Agricultural Office
Email: agri.office@municipality.gov.ph
Phone: [Municipal Contact Number]

By checking the box below, you acknowledge that you have read, understood, and agree to comply with these Terms and Conditions as a beneficiary of the Municipal Agricultural Office assistance program.
  `;

  // Validation functions
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (formErrors.email) {
      // Include backend validation errors (like email taken)
      errors.email = formErrors.email;
    }
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (formErrors.username) {
      // Include backend validation errors (like username taken)
      errors.username = formErrors.username;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    } else if (formErrors.password) {
      // Include the password/username matching error from the hook
      errors.password = formErrors.password;
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    } else if (formErrors.confirmPassword) {
      // Include password confirmation errors from the hook
      errors.confirmPassword = formErrors.confirmPassword;
    }
    
    return errors;
  };

  const validateStep3 = () => {
    const errors = {};
    
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and conditions to create an account';
    }
    
    return errors;
  };

  const validateCurrentStep = () => {
    let errors = {};
    
    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      case 3:
        errors = validateStep3();
        break;
      default:
        errors = {};
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      setValidationErrors({}); // Clear errors when moving to next step
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setValidationErrors({}); // Clear errors when going back
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      nextStep();
    }
    if (currentStep === 3 && validateCurrentStep()) {
      handleRegister();
    }
  };

  // Enhanced input change handler to clear validation errors
  const handleInputChange = (e) => {
    const { name } = e.target;
    handleChange(e); // This will trigger username check in the hook
    
    // Clear local validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderStep1 = () => (
    <FormStep
      title="Welcome!"
      subtitle="Let's start with your personal information"
    >
      <InputGroup>
        <div>
          <InputField
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            icon={User}
            required
            error={validationErrors.firstName}
          />
          {validationErrors.firstName && (
            <span className="error-message">{validationErrors.firstName}</span>
          )}
        </div>
        <InputField
          type="text"
          name="middleName"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={handleInputChange}
          icon={User}
        />
      </InputGroup>

      <InputGroup>
        <div>
          <InputField
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            icon={User}
            required
            error={validationErrors.lastName}
          />
          {validationErrors.lastName && (
            <span className="error-message">{validationErrors.lastName}</span>
          )}
        </div>
        <InputField
          type="text"
          name="extensionName"
          placeholder="Suffix (e.g., Jr., Sr., III)"
          value={formData.extensionName}
          onChange={handleInputChange}
          icon={User}
        />
      </InputGroup>

      <div>
        <div className="relative">
          <InputField
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            icon={Mail}
            error={validationErrors.email || formErrors.email}
          />
          {isCheckingEmail && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
            </div>
          )}
        </div>
        {(validationErrors.email || formErrors.email) && (
          <span className="error-message">
            {validationErrors.email || formErrors.email}
          </span>
        )}
        {formData.email && !formErrors.email && !validationErrors.email && !isCheckingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
          <span className="success-message">✓ Email is available</span>
        )}
      </div>
    </FormStep>
  );

  const renderStep2 = () => (
    <FormStep
      title="Account Setup"
      subtitle="Choose your username and secure password"
    >
      <div>
        <div className="relative">
          <InputField
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            icon={User}
            required
            error={validationErrors.username || formErrors.username}
          />
          {isCheckingUsername && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
            </div>
          )}
        </div>
        {(validationErrors.username || formErrors.username) && (
          <span className="error-message">
            {validationErrors.username || formErrors.username}
          </span>
        )}
        {formData.username && !formErrors.username && !validationErrors.username && !isCheckingUsername && formData.username.length >= 3 && (
          <span className="success-message">✓ Username is available</span>
        )}
      </div>
      
      <div>
        <PasswordField
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          icon={Lock}
          required
          error={validationErrors.password || formErrors.password}
        />
        {(validationErrors.password || formErrors.password) && (
          <span className="error-message">
            {validationErrors.password || formErrors.password}
          </span>
        )}
      </div>
      
      <div>
        <PasswordField
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          icon={Lock}
          required
          error={validationErrors.confirmPassword || formErrors.confirmPassword}
        />
        {(validationErrors.confirmPassword || formErrors.confirmPassword) && (
          <span className="error-message">
            {validationErrors.confirmPassword || formErrors.confirmPassword}
          </span>
        )}
      </div>
    </FormStep>
  );

  const renderStep3 = () => (
    <FormStep
      title="Almost There!"
      subtitle="Review and accept the beneficiary program terms"
    >
      {/* Terms and Conditions Section */}
      <div className="terms-section">
        <div className="terms-container">
          <h3 className="terms-title">Municipal Agricultural Office Beneficiary Agreement</h3>
          <div className="terms-content">
            <pre className="terms-text">{termsAndConditionsText}</pre>
          </div>
        </div>
        
        <div className="terms-checkbox">
          <CheckboxField
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              // Clear terms error when user agrees
              if (e.target.checked && validationErrors.terms) {
                setValidationErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.terms;
                  return newErrors;
                });
              }
            }}
            required
            error={validationErrors.terms}
          >
            I have read and agree to the Terms and Conditions of the Municipal Agricultural Office Beneficiary Program
          </CheckboxField>
          {validationErrors.terms && (
            <span className="error-message">{validationErrors.terms}</span>
          )}
        </div>
      </div>
    </FormStep>
  );

  return (
    <div className="registration-container">
      {/* Animated background elements */}
      <div className="background-blob blob-1" />
      <div className="background-blob blob-2" />
      <div className="background-blob blob-3" />

      {/* Subtle texture overlay */}
      <div className="texture-overlay" />

      <div className="main-container">
        {/* Left side - Hero section */}
        <div className="hero-section">
          <div className="brand-header">
            <Sprout className="brand-icon" />
            <span className="brand-name">AgroConnect</span>
          </div>
          <div>
            <h1 className="hero-title">
              Cultivate Your
              <span className="hero-title-accent">Future</span>
            </h1>
            <p className="hero-description">
              Connect with agricultural coordinators, manage your farming tasks, and track your crop progress with our comprehensive platform.
            </p>
          </div>
          <div className="feature-list">
            {[
              "Smart farm management tools",
              "Direct coordinator support",
              "Real-time crop monitoring",
              "Harvest planning & analytics"
            ].map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-dot" />
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="form-section">
          <div className="w-full max-w-md">
            {/* Progress indicator */}
            <ProgressIndicator currentStep={currentStep} totalSteps={3} />

            <div className="form-container">
              {error && <Alert type="error">{error}</Alert>}
              {success && <Alert type="success">{success}</Alert>}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                <div className="form-navigation">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn btn-secondary"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isLoading || (currentStep === 3 && !agreedToTerms)}
                    className={`btn btn-primary ${isLoading ? 'loading' : ''} ${
                      currentStep === 3 && !agreedToTerms ? 'disabled' : ''
                    }`}
                  >
                    <span>
                      {isLoading ? 'Creating Account...' : currentStep < 3 ? 'Next' : 'Create Account'}
                    </span>
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              <div className="login-link">
                <p className="login-text">
                  Already have an account?{' '}
                  <a href="beneficiary-login" className="login-link-text">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}