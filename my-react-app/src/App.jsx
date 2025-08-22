import React from "react";
import "./App.css";
import Signup from "./components/Signup/signup";
import Home from "./pages/Home"; // Import your actual Home component

function App() {
  // Simple routing without React Router for now
  const currentPath = window.location.pathname;

  if (currentPath === "/login") {
    return <Signup />;
  }

  return <Home />;
}

export default App;
