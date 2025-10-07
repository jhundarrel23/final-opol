import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Sprout } from 'lucide-react';
import { PasswordField, FormStep, Alert } from '../authBeneficiary/InputComponents';
import '../authBeneficiary/auth.css';
import usePasswordRecovery from '../../hooks-auth/hooks-auth-coordinator/usePasswordRecovery';

export default function PasswordResetForm() {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const {
    handleResetPasswordWithToken,
    error,
    success,
    isLoading,
    clearMessages,
  } = usePasswordRecovery();

  // Extract token and email from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear messages and validation errors
    clearMessages();
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (!token || !email) {
      setValidationErrors({ token: 'Invalid reset link. Please request a new password reset.' });
      return;
    }

    const success = await handleResetPasswordWithToken({
      token,
      email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    });

    if (success) {
      setFormData({ password: '', password_confirmation: '' });
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/coordinator/login';
      }, 3000);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    
    return checks;
  };

  const passwordChecks = getPasswordStrength(formData.password);

  return (
    <div className="registration-container">
      {/* Animated background */}
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
          <div>
            <h1 className="hero-title">
              Reset Password
              <span className="hero-title-accent"> Secure Access</span>
            </h1>
            <p className="hero-description">
              Create a new secure password for your coordinator account to continue managing your agricultural operations.
            </p>
          </div>
          <div className="feature-list">
            {[
              "Secure password reset",
              "Enhanced account protection",
              "Quick access restoration",
              "Safe & encrypted process",
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

              {!success && (
                <form onSubmit={handleSubmit}>
                  <FormStep
                    title="Create New Password"
                    subtitle={email ? `Reset password for ${email}` : "Enter your new password"}
                  >
                    <div>
                      <PasswordField
                        name="password"
                        placeholder="New Password"
                        value={formData.password}
                        onChange={handleChange}
                        icon={Lock}
                        required
                        error={validationErrors.password}
                      />
                      {validationErrors.password && (
                        <span className="error-message">{validationErrors.password}</span>
                      )}
                    </div>

                    <div>
                      <PasswordField
                        name="password_confirmation"
                        placeholder="Confirm New Password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        icon={Lock}
                        required
                        error={validationErrors.password_confirmation}
                      />
                      {validationErrors.password_confirmation && (
                        <span className="error-message">{validationErrors.password_confirmation}</span>
                      )}
                    </div>

                    {/* Password Requirements */}
                    <div className="password-requirements">
                      <p className="requirements-title">Password Requirements:</p>
                      <div className="requirements-grid">
                        <div className={`requirement-item ${passwordChecks.length ? 'valid' : ''}`}>
                          <span className="requirement-check">
                            {passwordChecks.length ? '✓' : '✗'}
                          </span>
                          <span className="requirement-text">At least 8 characters</span>
                        </div>
                        <div className={`requirement-item ${passwordChecks.uppercase ? 'valid' : ''}`}>
                          <span className="requirement-check">
                            {passwordChecks.uppercase ? '✓' : '✗'}
                          </span>
                          <span className="requirement-text">Uppercase letter</span>
                        </div>
                        <div className={`requirement-item ${passwordChecks.lowercase ? 'valid' : ''}`}>
                          <span className="requirement-check">
                            {passwordChecks.lowercase ? '✓' : '✗'}
                          </span>
                          <span className="requirement-text">Lowercase letter</span>
                        </div>
                        <div className={`requirement-item ${passwordChecks.number ? 'valid' : ''}`}>
                          <span className="requirement-check">
                            {passwordChecks.number ? '✓' : '✗'}
                          </span>
                          <span className="requirement-text">Number</span>
                        </div>
                      </div>
                    </div>
                  </FormStep>

                  <div className="form-navigation">
                    <div />
                    <button
                      type="submit"
                      disabled={isLoading || !token || !email}
                      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                    >
                      <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              )}

              {success && (
                <div className="success-container">
                  <div className="success-content">
                    <div className="success-icon">✅</div>
                    <h3 className="success-title">Password Reset Successful!</h3>
                    <p className="success-message">{success}</p>
                    <p className="redirect-notice">
                      Redirecting to login page in 3 seconds...
                    </p>
                    <a href="/coordinator/login" className="btn btn-primary">
                      Go to Login Now
                    </a>
                  </div>
                </div>
              )}

              <div className="login-link">
                <p className="login-text">
                  Remember your password?{' '}
                  <a href="/coordinator/login" className="login-link-text">
                    Back to Login
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