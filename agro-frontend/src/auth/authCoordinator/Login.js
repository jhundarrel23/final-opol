/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Sprout, Mail } from 'lucide-react';
import {
  InputField,
  PasswordField,
  CheckboxField,
  FormStep,
  Alert
} from '../authBeneficiary/InputComponents';
import '../authBeneficiary/auth.css';
import useLoginCoordinator from '../../hooks-auth/hooks-auth-coordinator/useLogin';
import usePasswordRecovery from '../../hooks-auth/hooks-auth-coordinator/usePasswordRecovery';
import { useNavigate } from 'react-router-dom';

export default function LoginCoordinator() {
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();

  // Login hook
  const {
    formData,
    handleChange,
    handleLogin,
    error: loginError,
    success: loginSuccess,
    isLoading: loginIsLoading,
    clearMessages: clearLoginMessages
  } = useLoginCoordinator();

  // Password recovery hook
  const {
    resetEmail,
    setResetEmail,
    handleForgotPassword,
    error: recoveryError,
    success: recoverySuccess,
    isLoading: recoveryIsLoading,
    clearMessages: clearRecoveryMessages
  } = usePasswordRecovery();

  // Derived state
  const error = showForgotPassword ? recoveryError : loginError;
  const success = showForgotPassword ? recoverySuccess : loginSuccess;
  const isLoading = showForgotPassword ? recoveryIsLoading : loginIsLoading;

  // ✅ Redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        navigate('/coordinator/dashboard', { replace: true });
      }, 1200); // give a short delay to show success message
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loginSuccess, navigate]);

  // Validation
  const validateLoginForm = () => {
    const errors = {};
    if (!formData.emailOrUsername?.trim()) {
      errors.emailOrUsername = 'Email or username is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const errors = {};
    if (!resetEmail?.trim()) {
      errors.resetEmail = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetEmail)) {
        errors.resetEmail = 'Please enter a valid email address';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handlers
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateLoginForm()) {
      handleLogin({ ...formData, rememberMe });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (validateForgotPasswordForm()) {
      await handleForgotPassword(resetEmail);
    }
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (showForgotPassword && name === 'resetEmail') {
      setResetEmail(value);
    } else {
      handleChange(e);
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Switch forms
  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setValidationErrors({});
    clearLoginMessages();
    clearRecoveryMessages();
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setValidationErrors({});
    clearLoginMessages();
    clearRecoveryMessages();
    setResetEmail('');
  };

  // Render login form
  const renderLoginForm = () => (
    <FormStep
      title="Welcome Back, Coordinator!"
      subtitle="Sign in to manage your agricultural operations"
    >
      <InputField
        type="text"
        name="emailOrUsername"
        placeholder="Email or Username"
        value={formData.emailOrUsername}
        onChange={handleInputChange}
        icon={User}
        required
        error={validationErrors.emailOrUsername}
      />
      {validationErrors.emailOrUsername && (
        <span className="error-message">{validationErrors.emailOrUsername}</span>
      )}

      <PasswordField
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        icon={Lock}
        required
        error={validationErrors.password}
      />
      {validationErrors.password && (
        <span className="error-message">{validationErrors.password}</span>
      )}

      <div className="login-options">
        <CheckboxField
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        >
          Remember me
        </CheckboxField>

        <button
          type="button"
          onClick={handleShowForgotPassword}
          className="forgot-password-link"
        >
          Forgot Password?
        </button>
      </div>
    </FormStep>
  );

  // Render forgot password form
  const renderForgotPasswordForm = () => (
    <FormStep
      title="Reset Password"
      subtitle="Enter your email to receive password reset instructions"
    >
      <InputField
        type="email"
        name="resetEmail"
        placeholder="Email Address"
        value={resetEmail}
        onChange={handleInputChange}
        icon={Mail}
        required
        disabled={!!recoverySuccess}
        error={validationErrors.resetEmail}
      />
      {validationErrors.resetEmail && (
        <span className="error-message">{validationErrors.resetEmail}</span>
      )}

      {!recoverySuccess && (
        <div className="forgot-password-actions">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Back to Login
          </button>

          <button
            type="submit"
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </FormStep>
  );

  return (
    <div className="registration-container">
      {/* Background */}
      <div className="background-blob blob-1" />
      <div className="background-blob blob-2" />
      <div className="background-blob blob-3" />
      <div className="texture-overlay" />

      <div className="main-container">
        {/* Left side - Hero */}
        <div className="hero-section">
          <div className="brand-header">
            <Sprout className="brand-icon" />
            <span className="brand-name">AgroConnect</span>
          </div>
          <h1 className="hero-title">
            Coordinator Portal
            <span className="hero-title-accent">AgroConnect</span>
          </h1>
          <p className="hero-description">
            Manage agricultural operations, oversee farming activities, and coordinate with beneficiaries effectively.
          </p>
          <div className="feature-list">
            {[
              "Manage sector operations",
              "Oversee farmer activities",
              "Track agricultural progress",
              "Generate reports & insights"
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
            <div className="form-container">
              {/* Alerts */}
              {error && <Alert type="error">{error}</Alert>}
              {!error && success && <Alert type="success">{success}</Alert>}

              <form onSubmit={showForgotPassword ? handleForgotPasswordSubmit : handleLoginSubmit}>
                {!showForgotPassword ? renderLoginForm() : renderForgotPasswordForm()}

                {!showForgotPassword && (
                  <div className="form-navigation">
                    <div />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                    >
                      <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </form>

              {/* Links */}
              {!showForgotPassword && (
                <div className="login-link">
                  <p className="login-text">
                    Don't have an account?{' '}
                    <a href="/coordinator-register" className="login-link-text">
                      Register here
                    </a>
                  </p>
                </div>
              )}

              {showForgotPassword && !recoverySuccess && (
                <div className="login-link">
                  <p className="login-text">
                    Remember your password?{' '}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={handleBackToLogin}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleBackToLogin();
                        }
                      }}
                      className="login-link-text"
                      style={{ cursor: 'pointer' }}
                    >
                      Sign in
                    </span>
                  </p>
                </div>
              )}

              {showForgotPassword && recoverySuccess && (
                <div className="login-link">
                  <p className="login-text">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={handleBackToLogin}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleBackToLogin();
                        }
                      }}
                      className="login-link-text"
                      style={{ cursor: 'pointer' }}
                    >
                      Back to Login
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}