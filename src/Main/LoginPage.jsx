import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ setIsAuthenticated, setIsNurse }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset authentication state if redirected from logout
  useEffect(() => {
    if (location.state?.resetAuth) {
      setIsAuthenticated(false);
      setIsNurse(false);
    }
  }, [location.state, setIsAuthenticated, setIsNurse]);

  // Function to save login data to Firestore
  const saveLoginData = async (email, password, patientId, isNurse, status) => {
    try {
      const loginDataRef = collection(db, "logindata");
      await addDoc(loginDataRef, {
        email,
        password,
        patientId,
        isNurse,
        deviceName: navigator.userAgent, // Get device name from user agent
        date: serverTimestamp(), // Save server timestamp
        time: serverTimestamp(), // Save server timestamp
        status, // Save status (red or green)
      });
    } catch (error) {
      console.error("Error saving login data:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("User not found. Please check your email.");
        await saveLoginData(email, password, null, null, "red"); // Save login data with status "red"
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("User Data:", userData); // Debugging log

      if (userData.password !== password) {
        setError("Incorrect password. Please try again.");
        await saveLoginData(email, password, userData.patientId, userData.is_nurse, "red"); // Save login data with status "red"
        return;
      }

      setIsAuthenticated(true);
      setIsNurse(userData.is_nurse);

      // Save authentication state and patientId to localStorage
      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem("isNurse", userData.is_nurse);
      localStorage.setItem("patientId", userData.patientId); // Save patientId

      // Save successful login data with status "green"
      await saveLoginData(email, password, userData.patientId, userData.is_nurse, "green");

      if (userData.is_nurse) {
        navigate("/main"); // Redirect to the Main component for nurses
      } else {
        // Redirect to the User component for non-nurses and pass the patientId in the URL
        navigate(`/users/${userData.patientId}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <img
            src="https://media.giphy.com/media/YMM6g7x45coCKdrDoj/giphy.gif"
            alt="Loading..."
            className="loading-image"
          />
        </div>
      )}
    </div>
  );
};

export default LoginPage;