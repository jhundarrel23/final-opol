import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Sprout, Mail } from 'lucide-react';
import { InputField, PasswordField, FormStep, Alert } from './InputComponents';
import './auth.css';
import useResetPasswordBeneficiary from '../../hooks-auth/hooks-auth-beneficiary/useResetPasswordBeneficiary';

export default function ResetPassword() {
  const { handleResetPassword, loading, error, success } =
    useResetPasswordBeneficiary();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // ✅ Extract token + email from URL query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData((prev) => ({
      ...prev,
      token: params.get('token') || '',
      email: params.get('email') || '',
    }));
  }, []);

  // ✅ Redirect after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/beneficiary-login'); 
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleResetPassword(formData);
    }
  };

  return (
    <div className="registration-container">
      {/* Background blobs + overlay */}
      <div className="background-blob blob-1" />
      <div className="background-blob blob-2" />
      <div className="background-blob blob-3" />
      <div className="texture-overlay" />

      <div className="main-container">
        {/* Left Hero Section */}
        <div className="hero-section">
          <div className="brand-header">
            <Sprout className="brand-icon" />
            <span className="brand-name">AgroConnect</span>
          </div>
          <h1 className="hero-title">
            Reset Your <span className="hero-title-accent">Password</span>
          </h1>
          <p className="hero-description">
            Enter your new password and regain access to your account.
          </p>
        </div>

        {/* Right Form Section */}
        <div className="form-section">
          <div className="w-full max-w-md">
            <div className="form-container">
              {error && <Alert type="error">{error}</Alert>}
              {success && (
                <Alert type="success">
                  {success} <br />
                  Redirecting to login...
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <FormStep
                  title="Create New Password"
                  subtitle="Enter and confirm your new password"
                >
                  {/* Email field (readonly) */}
                  <InputField
                    type="email"
                    name="email"
                    value={formData.email}
                    icon={Mail}
                    disabled
                  />

                  {/* New password */}
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
                    <span className="error-message">
                      {validationErrors.password}
                    </span>
                  )}

                  {/* Confirm password */}
                  <PasswordField
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={Lock}
                    required
                    error={validationErrors.confirmPassword}
                  />
                  {validationErrors.confirmPassword && (
                    <span className="error-message">
                      {validationErrors.confirmPassword}
                    </span>
                  )}
                </FormStep>

                <div className="form-navigation">
                  <div />
                  <button
                    type="submit"
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              <div className="login-link">
                <p className="login-text">
                  Remembered your password?{' '}
                  <a href="/beneficiary-login" className="login-link-text">
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
