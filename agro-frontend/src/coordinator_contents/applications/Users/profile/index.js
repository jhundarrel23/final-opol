/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-undef */
import React from "react";
import { Helmet } from "react-helmet-async";
import Footer from "src/components/Footer";

import {
  Grid,
  Container,
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Divider
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "src/api/axiosInstance";

function ManagementUserProfile() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
  );
  const fullName = [
    storedUser.fname,
    storedUser.mname,
    storedUser.lname,
    storedUser.extension_name
  ]
    .filter(Boolean)
    .join(" ");

  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [form, setForm] = React.useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!form.new_password) {
      newErrors.new_password = "New password is required";
    } else if (form.new_password.length < 8) {
      newErrors.new_password = "New password must be at least 8 characters";
    } else if (form.new_password === form.current_password) {
      newErrors.new_password = "New password must be different from current password";
    }
    if (!form.new_password_confirmation) {
      newErrors.new_password_confirmation = "Please confirm your new password";
    } else if (form.new_password !== form.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // stop if validation fails

    setSaving(true);
    setMessage(null);
    try {
      const res = await axiosInstance.post(
        "/api/coordinator/reset-password",
        {
          current_password: form.current_password,
          new_password: form.new_password,
          new_password_confirmation: form.new_password_confirmation
        }
      );
      setMessage({
        type: "success",
        text: res.data?.message || "Password updated successfully."
      });
      setForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
      });
      setErrors({});
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update password."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile</title>
      </Helmet>
      <Container sx={{ mt: 3 }} maxWidth="md">
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full name"
                  value={fullName || "—"}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={storedUser.email || "—"}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  value={storedUser.username || "—"}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Role"
                  value={storedUser.role || "coordinator"}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>

            <Box
              sx={{ mt: 4 }}
              component="form"
              onSubmit={submit}
            >
              <Typography variant="h5" gutterBottom>
                Change Password
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Current password"
                    name="current_password"
                    type={showCurrent ? "text" : "password"}
                    value={form.current_password}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.current_password}
                    helperText={errors.current_password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowCurrent((v) => !v)
                            }
                            edge="end"
                          >
                            {showCurrent ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6} />
                <Grid item xs={12} md={6}>
                  <TextField
                    label="New password"
                    name="new_password"
                    type={showNew ? "text" : "password"}
                    value={form.new_password}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.new_password}
                    helperText={
                      errors.new_password || "Minimum 8 characters"
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowNew((v) => !v)
                            }
                            edge="end"
                          >
                            {showNew ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Confirm new password"
                    name="new_password_confirmation"
                    type={showConfirm ? "text" : "password"}
                    value={form.new_password_confirmation}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.new_password_confirmation}
                    helperText={errors.new_password_confirmation}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirm((v) => !v)
                            }
                            edge="end"
                          >
                            {showConfirm ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center"
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  Update Password
                </Button>
                {message && (
                  <Typography
                    color={
                      message.type === "error"
                        ? "error"
                        : "primary"
                    }
                  >
                    {message.text}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}

export default ManagementUserProfile;
