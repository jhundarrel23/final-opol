import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

// Base Input Component
export const InputField = ({ 
  type = "text", 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  icon: Icon, 
  className = "",
  ...props 
}) => {
  return (
    <div className="input-field-container">
      {Icon && (
        <Icon className="input-icon" />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`input-field ${Icon ? 'has-icon' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};

// Password Input Component with Toggle
export const PasswordField = ({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  icon: Icon,
  className = "",
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="input-field-container">
      {Icon && (
        <Icon className="input-icon" />
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`input-field ${Icon ? 'has-icon' : ''} has-toggle ${className}`}
        {...props}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
      >
        {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
      </button>
    </div>
  );
};

// Textarea Component
export const TextareaField = ({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  icon: Icon,
  rows = 3,
  className = "",
  ...props 
}) => {
  return (
    <div className="input-field-container">
      {Icon && (
        <Icon className="textarea-icon" />
      )}
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className={`textarea-field ${Icon ? 'has-icon' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};

// Custom Checkbox Component
export const CheckboxField = ({ 
  checked, 
  onChange, 
  required = false, 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div className={`checkbox-container ${className}`}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          className="checkbox-input"
          {...props}
        />
        <div className={`checkbox-custom ${checked ? 'checked' : ''}`}>
          {checked && <CheckCircle className="checkbox-icon" />}
        </div>
      </label>
      {children && (
        <div className="checkbox-text">
          {children}
        </div>
      )}
    </div>
  );
};

// Input Group Component (for side-by-side inputs)
export const InputGroup = ({ children, className = "" }) => {
  return (
    <div className={`input-grid ${className}`}>
      {children}
    </div>
  );
};

// Form Step Component
export const FormStep = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`step-container ${className}`}>
      <div className="step-header">
        <h2 className="step-title">{title}</h2>
        {subtitle && <p className="step-subtitle">{subtitle}</p>}
      </div>
      <div className="step-content">
        {children}
      </div>
    </div>
  );
};

// Progress Indicator Component
export const ProgressIndicator = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isActive = currentStep >= step;
          const isLast = step === totalSteps;
          
          return (
            <div key={step} className="step-indicator">
              <div className={`step-circle ${isActive ? 'active' : 'inactive'}`}>
                {step}
              </div>
              {!isLast && (
                <div className={`step-connector ${currentStep > step ? 'active' : 'inactive'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="progress-text">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
};

// Alert Component
export const Alert = ({ type = 'info', children, className = "" }) => {
  const alertClass = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : '';
  
  return (
    <div className={`alert ${alertClass} ${className}`}>
      {children}
    </div>
  );
};