/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Sprout, Mail, Shield } from 'lucide-react';
import {
  InputField,
  PasswordField,
  CheckboxField,
  FormStep,
  Alert
} from '../authBeneficiary/InputComponents';
import '../authBeneficiary/auth.css';
import useLogin from '../../hooks-auth/hooks-auth-admin/useLogin';

export default function LoginAdmin() {
  const [, setIsLoggedIn] = useState(false);
  const [, setUser] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    formData,
    error,
    isLoading,
    handleChange,
    handleLogin
  } = useLogin(setIsLoggedIn, setUser, 'admin');

  // Validation functions
  const validateForm = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      handleLogin({ ...formData, rememberMe });
    }
  };

  // Enhanced input change handler to clear validation errors
  const handleInputChange = (e) => {
    const { name } = e.target;
    handleChange(e);
    
    // Clear local validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderLoginForm = () => (
    <FormStep
      title="Admin Portal"
      subtitle="Sign in with your administrator credentials"
    >
      <div>
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
        />
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
          className="btn btn-primary"
        >
          Send Reset Link
          <ArrowRight className="w-4 h-4" />
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
              Administrator
              <span className="hero-title-accent"> Control Center</span>
            </h1>
            <p className="hero-description">
              Manage system operations, oversee all users, configure settings, and maintain the agricultural platform.
            </p>
          </div>
          <div className="feature-list">
            {[
              "System administration",
              "User management",
              "Platform configuration",
              "Analytics & reporting"
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
              {error && <Alert type="error">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                {!showForgotPassword ? renderLoginForm() : renderForgotPasswordForm()}

                {!showForgotPassword && (
                  <div className="form-navigation">
                    <div />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                    >
                      <span>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </form>

              {!showForgotPassword && (
                <div className="login-link">
                  <p className="login-text">
                    Don't have an account?{' '}
                    <a href="/admin-register" className="login-link-text">
                      Register here
                    </a>
                  </p>
                </div>
              )}

              {showForgotPassword && (
                <div className="login-link">
                  <p className="login-text">
                    Remember yourdddddddddddd password?{' '}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="login-link-text"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
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