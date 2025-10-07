import React, { useState } from 'react';
import { User, Lock, ArrowRight, Sprout, Mail } from 'lucide-react';
import {
  InputField,
  PasswordField,
  CheckboxField,
  FormStep,
  Alert
} from './InputComponents';
import './auth.css';
import useLoginBeneficiary from '../../hooks-auth/hooks-auth-beneficiary/useLoginBeneficiary';
import useForgotPasswordBeneficiary from '../../hooks-auth/hooks-auth-beneficiary/useForgotPassword';

export default function LoginBeneficiary() {
  const {
    formData,
    handleChange,
    handleLogin,
    error: loginError,
    success: loginSuccess,
    isLoading
  } = useLoginBeneficiary();

  const {
    handleForgotPassword,
    loading: resetLoading,
    error: resetError,
    success: resetSuccess
  } = useForgotPasswordBeneficiary();

  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Validation for login form
  const validateForm = () => {
    const errors = {};
    if (!formData.username?.trim()) {
      errors.username = 'Username or email is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleLogin({ ...formData, rememberMe });
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!formData.resetEmail?.trim()) {
      setValidationErrors({ resetEmail: 'Email is required' });
      return;
    }
    handleForgotPassword(formData.resetEmail.trim());
  };

  // Clear validation errors when typing
  const handleInputChange = (e) => {
    const { name } = e.target;
    handleChange(e);
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderLoginForm = () => (
    <FormStep
      title="Welcome Back!"
      subtitle="Sign in to access your agricultural dashboard"
    >
      <div>
        <InputField
          type="text"
          name="username"
          placeholder="Username or Email"
          value={formData.username}
          onChange={handleInputChange}
          icon={User}
          required
          error={validationErrors.username}
        />
        {validationErrors.username && (
          <span className="error-message">{validationErrors.username}</span>
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
          error={validationErrors.password}
        />
        {validationErrors.password && (
          <span className="error-message">{validationErrors.password}</span>
        )}
      </div>

      <div className="login-options">
        <CheckboxField
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        >
          Remember me
        </CheckboxField>

        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="forgot-password-link"
        >
          Forgot Password?
        </button>
      </div>
    </FormStep>
  );

  const renderForgotPasswordForm = () => (
    <FormStep
      title="Reset Password"
      subtitle="Enter your email to receive password reset instructions"
    >
      <div>
        <InputField
          type="email"
          name="resetEmail"
          placeholder="Email Address"
          value={formData.resetEmail || ''}
          onChange={handleInputChange}
          icon={Mail}
          required
          error={validationErrors.resetEmail}
        />
        {validationErrors.resetEmail && (
          <span className="error-message">{validationErrors.resetEmail}</span>
        )}
      </div>

      <div className="forgot-password-actions">
        <button
          type="button"
          onClick={() => setShowForgotPassword(false)}
          className="btn btn-secondary"
        >
          Back to Login
        </button>

        <button
          type="submit"
          className={`btn btn-primary ${resetLoading ? 'loading' : ''}`}
          disabled={resetLoading}
        >
          <span>{resetLoading ? 'Sending...' : 'Send Reset Link'}</span>
          {!resetLoading && <ArrowRight className="w-4 h-4" />}
        </button>
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
              Welcome Back to
              <span className="hero-title-accent">AgroConnect</span>
            </h1>
            <p className="hero-description">
              Continue managing your farming operations, connect with coordinators,
              and track your agricultural progress.
            </p>
          </div>
          <div className="feature-list">
            {[
              'Access your farm dashboard',
              'View task assignments',
              'Track crop progress',
              'Connect with coordinators'
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
              {/* Alerts for login */}
              {loginError && !showForgotPassword && (
                <Alert type="error">{loginError}</Alert>
              )}
              {loginSuccess && !showForgotPassword && (
                <Alert type="success">{loginSuccess}</Alert>
              )}

              {/* Alerts for reset password */}
              {resetError && showForgotPassword && (
                <Alert type="error">{resetError}</Alert>
              )}
              {resetSuccess && showForgotPassword && (
                <Alert type="success">{resetSuccess}</Alert>
              )}

              <form
                onSubmit={
                  !showForgotPassword ? handleLoginSubmit : handleForgotPasswordSubmit
                }
              >
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

              {!showForgotPassword && (
                <div className="login-link">
                  <p className="login-text">
                    Don't have an account?{' '}
                    <a href="/beneficiary-register" className="login-link-text">
                      Create one here
                    </a>
                  </p>
                </div>
              )}

              {showForgotPassword && (
                <div className="login-link">
                  <p className="login-text">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="login-link-text"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Sign in here
                    </button>
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
