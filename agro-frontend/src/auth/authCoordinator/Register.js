import React from 'react';
import { Link } from 'react-router-dom';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBCheckbox,
  MDBIcon
} from 'mdb-react-ui-kit';
import useRegister from '../../hooks-auth/hooks-auth-admin/useRegister';
import './Registration.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register() {
  const {
    form,
    error,
    successMessage,
    loading,
    fieldError,
    handleChange,
    handleSubmit
  } = useRegister();

  return (
    <MDBContainer fluid className='p-4 background-radial-gradient overflow-hidden'>
      <MDBRow>
        <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
          <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: 'hsl(218, 81%, 95%)' }}>
            Join Us <br />
            <span style={{ color: 'hsl(218, 81%, 75%)' }}>Create your account</span>
          </h1>
          <p className='px-3' style={{ color: 'hsl(218, 81%, 85%)' }}>
            Get started with your new dashboard, collaborate with your team, and enjoy our tools.
          </p>
        </MDBCol>

        <MDBCol md='6' className='position-relative'>
          <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong" />
          <div id="radius-shape-2" className="position-absolute shadow-5-strong" />

          <MDBCard className='my-5 bg-glass'>
            <MDBCardBody className='p-5'>

              <h3 className="text-center mb-4">Register</h3>

              {/* Global error and success alerts */}
              {error && <div className="alert alert-danger text-center py-2">{error}</div>}
              {successMessage && <div className="alert alert-success text-center py-2">{successMessage}</div>}

              <form onSubmit={handleSubmit}>
                <MDBInput
                  wrapperClass='mb-3'
                  label='Username'
                  id='username'
                  name='username'
                  type='text'
                  value={form.username}
                  onChange={handleChange}
                  className={fieldError.username ? 'is-invalid' : ''}
                />
                <MDBInput
                  wrapperClass='mb-3'
                  label='Email'
                  id='email'
                  name='email'
                  type='email'
                  value={form.email}
                  onChange={handleChange}
                  className={fieldError.email ? 'is-invalid' : ''}
                />
                <MDBInput
                  wrapperClass='mb-3'
                  label='Password'
                  id='password'
                  name='password'
                  type='password'
                  value={form.password}
                  onChange={handleChange}
                  className={fieldError.password ? 'is-invalid' : ''}
                />
                <MDBInput
                  wrapperClass='mb-3'
                  label='Confirm Password'
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={fieldError.confirmPassword ? 'is-invalid' : ''}
                />

                <MDBCheckbox
                  wrapperClass='d-flex justify-content-center mb-4'
                  label='I agree to the terms and conditions'
                  id='registerAgree'
                />

                {/* Submit button */}
                <button
                  className="btn btn-primary w-100 mb-4 register-btn-fixed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Registering...
                    </>
                  ) : 'Register'}
                </button>
              </form>

              <div className="text-center">
                <p>or sign up with:</p>

                {/* Social buttons */}
                <button className="btn btn-link mx-1 p-0" type="button" style={{ color: '#1266f1' }}>
                  <MDBIcon fab icon='facebook-f' size="sm" />
                </button>
                <button className="btn btn-link mx-1 p-0" type="button" style={{ color: '#1266f1' }}>
                  <MDBIcon fab icon='twitter' size="sm" />
                </button>
                <button className="btn btn-link mx-1 p-0" type="button" style={{ color: '#1266f1' }}>
                  <MDBIcon fab icon='google' size="sm" />
                </button>
                <button className="btn btn-link mx-1 p-0" type="button" style={{ color: '#1266f1' }}>
                  <MDBIcon fab icon='github' size="sm" />
                </button>

                <p className="mt-4">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>

            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Register;
