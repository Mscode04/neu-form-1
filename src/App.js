import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Main/LoginPage";
import Main from "./Main/Main";
import User from "./Main/User";
import Chatbot from "./Main/Chatbot";
import PUser from "./Main/PUser"; // Import the new PUser component
import Logout from "./Main/Logout"; // Import the Logout component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [isNurse, setIsNurse] = useState(
    localStorage.getItem("isNurse") === "true"
  );

  // State to handle the PWA installation prompt
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
    localStorage.setItem("isNurse", isNurse);
  }, [isAuthenticated, isNurse]);

  // Listen for the `beforeinstallprompt` event
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsNurse(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isNurse");
  };

  // Function to trigger the PWA installation prompt
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setInstallPrompt(null); // Clear the prompt after user choice
      });
    }
  };




  return (
    <>
      {/* Render the install button if the prompt is available */}
      {/* {installPrompt && (
        <div style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}>
          <button
            onClick={handleInstallClick}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Install App
          </button>
        </div>
      )} */}

      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <LoginPage setIsAuthenticated={setIsAuthenticated} setIsNurse={setIsNurse} />
            ) : (
              <Navigate to={isNurse ? "/main" : `/users/${localStorage.getItem("patientId")}`} />
            )
          }
        />

        {/* Main Page (for nurses) */}
        <Route
          path="/main/*"
          element={
            isAuthenticated && isNurse ? (
              <Main isAuthenticated={isAuthenticated} isNurse={isNurse} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* User Page (for non-nurses) */}
        <Route
          path="/users/:patientId/*"
          element={
            isAuthenticated && !isNurse ? (
              <User isAuthenticated={isAuthenticated} isNurse={isNurse} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* New Route for PUser */}
        <Route
          path="/puser/:patientId"
          element={<PUser />} // This is the new component for viewing patient details
        />
          <Route
          path="/chatbot"
          element={<Chatbot />} // This is the new component for viewing patient details
        />

        {/* Fallback for /users without patientId */}
        <Route
          path="/users"
          element={
            isAuthenticated && !isNurse ? (
              <Navigate to="/" /> // Redirect to login or another appropriate page
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Logout Route */}
        <Route
          path="/logout"
          element={<Logout onLogout={handleLogout} />} // Use the Logout component
        />
      </Routes>
    </>
  );
}

export default App;
