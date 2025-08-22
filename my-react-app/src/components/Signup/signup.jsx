import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import "./signup.css";
import axios from "axios";

export default function signup() {
  const [currentMode, setCurrentMode] = useState("login"); // "login", "signup", "forgot-password", "verify-otp", "reset-password"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success", // "success" or "error"
  });

  // Show snackbar function
  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      show: true,
      message,
      type,
    });
  };

  // Auto hide snackbar after 3 seconds
  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    if (isLoading) return; // Prevent multiple requests
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/forgot-password",
        {
          email: formData.email,
        }
      );
      console.log("OTP resent:", res.data);
      showSnackbar("OTP sent to your email again!", "success");
    } catch (err) {
      console.error("Resend OTP error:", err.response?.data || err.message);
      showSnackbar(
        err.response?.data?.message || "Failed to resend OTP",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    if (currentMode === "login") {
      // LOGIN CALL
      try {
        const res = await axios.post("http://localhost:3000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        console.log("Login success:", res.data);
        showSnackbar(res.data.message, "success");

        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = "/";
        }, 1500); // Delay to show success message
      } catch (err) {
        console.error("Login error:", err.response?.data || err.message);
        showSnackbar(err.response?.data?.message || "Login failed", "error");
      } finally {
        setIsLoading(false);
      }
    } else if (currentMode === "signup") {
      // SIGNUP CALL
      if (formData.password !== formData.confirmPassword) {
        showSnackbar("Passwords do not match!", "error");
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.post("http://localhost:3000/api/auth/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        console.log("Signup success:", res.data);
        showSnackbar(res.data.message, "success");
        setCurrentMode("login"); // switch to login after successful signup
        clearFormData();
      } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);
        showSnackbar(err.response?.data?.message || "Signup failed", "error");
      } finally {
        setIsLoading(false);
      }
    } else if (currentMode === "forgot-password") {
      // FORGOT PASSWORD - SEND OTP
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/forgot-password",
          {
            email: formData.email,
          }
        );
        console.log("OTP sent:", res.data);
        showSnackbar("OTP sent to your email!", "success");
        setCurrentMode("verify-otp");
      } catch (err) {
        console.error(
          "Forgot password error:",
          err.response?.data || err.message
        );
        showSnackbar(
          err.response?.data?.message || "Failed to send OTP",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    } else if (currentMode === "verify-otp") {
      // VERIFY OTP
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/verify-otp",
          {
            email: formData.email,
            otp: formData.otp,
          }
        );
        console.log("OTP verified:", res.data);
        showSnackbar("OTP verified! Set your new password.", "success");
        setCurrentMode("reset-password");
      } catch (err) {
        console.error(
          "OTP verification error:",
          err.response?.data || err.message
        );
        showSnackbar(err.response?.data?.message || "Invalid OTP", "error");
      } finally {
        setIsLoading(false);
      }
    } else if (currentMode === "reset-password") {
      // RESET PASSWORD
      if (formData.newPassword !== formData.confirmNewPassword) {
        showSnackbar("New passwords do not match!", "error");
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/reset-password",
          {
            email: formData.email,
            otp: formData.otp,
            newPassword: formData.newPassword,
          }
        );
        console.log("Password reset success:", res.data);
        showSnackbar("Password reset successfully!", "success");
        setCurrentMode("login");
        clearFormData();
      } catch (err) {
        console.error(
          "Password reset error:",
          err.response?.data || err.message
        );
        showSnackbar(
          err.response?.data?.message || "Password reset failed",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearFormData = () => {
    setFormData({
      name: "",
      email: currentMode === "verify-otp" ? formData.email : "", // Preserve email in OTP flow
      password: "",
      confirmPassword: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    // Only clear form data when switching between login/signup, not in forgot password flow
    if (
      (currentMode === "login" && mode === "signup") ||
      (currentMode === "signup" && mode === "login") ||
      mode === "login"
    ) {
      clearFormData();
    }
  };

  const getFormTitle = () => {
    switch (currentMode) {
      case "login":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Forgot Password";
      case "verify-otp":
        return "Enter OTP";
      case "reset-password":
        return "Reset Password";
      default:
        return "Sign In";
    }
  };

  const getFormSubtitle = () => {
    switch (currentMode) {
      case "login":
        return "Welcome back! Please enter your details.";
      case "signup":
        return "Please fill in the information below.";
      case "forgot-password":
        return "Enter your email to receive an OTP.";
      case "verify-otp":
        return "Enter the OTP sent to your email.";
      case "reset-password":
        return "Enter your new password.";
      default:
        return "Welcome back! Please enter your details.";
    }
  };

  return (
    <div className="auth-container">
      {/* Custom Snackbar */}
      {snackbar.show && (
        <div className={`snackbar ${snackbar.type}`}>
          <span className="snackbar-message">{snackbar.message}</span>
          <button
            className="snackbar-close"
            onClick={() => setSnackbar({ ...snackbar, show: false })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Left Side - Image Section */}
      <div className="left-section">
        <div className="left-overlay"></div>
        <div className="left-content">
          <div className="left-text-center">
            <div className="left-icon">
              <div className="left-inner-icon">
                <User size={40} color="white" />
              </div>
            </div>
            <h1 className="left-title">Welcome Back!</h1>
            <p className="left-subtitle">
              Join our community and discover amazing features that will enhance
              your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="right-section">
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              {/* Back button for forgot password flow */}
              {(currentMode === "forgot-password" ||
                currentMode === "verify-otp" ||
                currentMode === "reset-password") && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="back-button"
                  disabled={isLoading}
                  style={{
                    marginBottom: "1rem",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    color: isLoading ? "#ccc" : "#666",
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <ArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
                  Back to Sign In
                </button>
              )}

              <h2 className="form-title">{getFormTitle()}</h2>
              <p className="form-subtitle">{getFormSubtitle()}</p>
            </div>

            <div className="form-fields">
              {/* Name Field - Only for Signup */}
              {currentMode === "signup" && (
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field - For Login, Signup, and Forgot Password */}
              {(currentMode === "login" ||
                currentMode === "signup" ||
                currentMode === "forgot-password") && (
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Field - For Login and Signup */}
              {(currentMode === "login" || currentMode === "signup") && (
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input password-input"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password Field - Only for Signup */}
              {currentMode === "signup" && (
                <div className="field-group">
                  <label className="field-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              )}

              {/* OTP Field - For OTP Verification */}
              {currentMode === "verify-otp" && (
                <div className="field-group">
                  <label className="field-label">Enter OTP</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      marginTop: "0.5rem",
                    }}
                  >
                    OTP sent to: <strong>{formData.email}</strong>
                  </p>
                </div>
              )}

              {/* New Password Fields - For Reset Password */}
              {currentMode === "reset-password" && (
                <>
                  <div className="field-group">
                    <label className="field-label">New Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your new password"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Confirm New Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Confirm your new password"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Forgot Password Link - Only for Login */}
              {currentMode === "login" && (
                <div className="forgot-password">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="forgot-link"
                    disabled={isLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: isLoading ? "#ccc" : "#3b82f6",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="submit-button"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  "Please wait..."
                ) : (
                  <>
                    {currentMode === "login" && "Sign In"}
                    {currentMode === "signup" && "Create Account"}
                    {currentMode === "forgot-password" && "Send OTP"}
                    {currentMode === "verify-otp" && "Verify OTP"}
                    {currentMode === "reset-password" && "Reset Password"}
                  </>
                )}
              </button>

              {/* Resend OTP option */}
              {currentMode === "verify-otp" && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: isLoading ? "#ccc" : "#666",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    {isLoading ? "Sending..." : "Didn't receive OTP? Resend"}
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Mode - Only for Login/Signup */}
            {(currentMode === "login" || currentMode === "signup") && (
              <div className="toggle-mode">
                <p className="toggle-text">
                  {currentMode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      switchMode(currentMode === "login" ? "signup" : "login")
                    }
                    className="toggle-button"
                    disabled={isLoading}
                    style={{
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {currentMode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
