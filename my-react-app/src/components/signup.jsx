import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import "./signup.css";
import axios from "axios";

export default function signup() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // LOGIN CALL
      try {
        const res = await axios.post("http://localhost:3000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        console.log("Login success:", res.data);
        showSnackbar(res.data.message, "success");
      } catch (err) {
        console.error("Login error:", err.response?.data || err.message);
        showSnackbar(err.response?.data?.message || "Login failed", "error");
      }
    } else {
      // SIGNUP CALL
      if (formData.password !== formData.confirmPassword) {
        showSnackbar("Passwords do not match!", "error");
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
        toggleMode(); // switch to login after successful signup
      } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);
        showSnackbar(err.response?.data?.message || "Signup failed", "error");
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
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
              <h2 className="form-title">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="form-subtitle">
                {isLogin
                  ? "Welcome back! Please enter your details."
                  : "Please fill in the information below."}
              </p>
            </div>

            <div className="form-fields">
              {/* Name Field - Only for Signup */}
              {!isLogin && (
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
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
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
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field - Only for Signup */}
              {!isLogin && (
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
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password Link - Only for Login */}
              {isLogin && (
                <div className="forgot-password">
                  <a href="#" className="forgot-link">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="submit-button"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="toggle-mode">
              <p className="toggle-text">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button onClick={toggleMode} className="toggle-button">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
