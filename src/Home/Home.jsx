import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState("All");
  const [uniqueWards, setUniqueWards] = useState([]);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setLoading(true);
        const checkInsRef = collection(db, "RegisterData");
        
        const checkInsSnapshot = await getDocs(checkInsRef);
        const checkInsData = checkInsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          checkInTime: doc.data().lastUpdated || new Date().toISOString()
        }));

        // Filter only checked-in patients (eventStatus === true)
        const activeCheckIns = checkInsData.filter(checkin => checkin.eventStatus === true);

        // Extract unique wards
        const wards = [...new Set(activeCheckIns.map(checkin => checkin.wardNumber || "Unknown"))];
        
        setCheckIns(activeCheckIns);
        setUniqueWards(["All", ...wards.filter(ward => ward !== "Unknown")]);
      } catch (error) {
        console.error("Error fetching check-ins: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, []);

  const handleWardChange = (event) => {
    setSelectedWard(event.target.value);
  };

  const filteredCheckIns = selectedWard === "All" 
    ? checkIns 
    : checkIns.filter(checkin => checkin.wardNumber === selectedWard);

  return (
    <div className="HomeApp">
      {/* Topbar */}
      <header className="HomeTopbar">
        <button className="btn btn-transparent" onClick={toggleDrawer}>
          <i className="bi bi-list"></i>
        </button>
      </header>

      {/* Drawer */}
      <div className={`HomeDrawer ${drawerOpen ? "open" : ""}`}>
        <button className="HomeDrawerCloseButton" onClick={toggleDrawer}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="drawer-content">
          <a
            href="https://neuraq.github.io/Palliative-Mkba-App-Contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="HomeDrawerButton"
          >
            Contact Us
          </a>
        </div>
        <div className="drawer-footer">
          <button className="HomeDrawerButton btn-danger" onClick={handleLogout}>
            Logout
          </button>
          <div className="powered-by">Powered by Neuraq Technologies</div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="HomeBanner">
        <h1>SNEHA SANGAMEM - NEURAQ </h1>
        <div className="HomeBannerButtons">
      
        </div>
      </div>

      {/* Check-ins Section */}
      <div className="HomeCheckIns">
        <div className="filter-section">
          <h4 className="HomeCheckInsTitle">
            Check-ins ({filteredCheckIns.length}) <select
                id="ward-filter"
                value={selectedWard}
                onChange={handleWardChange}
              >
                {uniqueWards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
          </h4>
          <div className="filter-controls">
            <div className="filter-group">
              {/* <label htmlFor="ward-filter">Filter by Ward:</label> */}
              
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="checkin-list">
  {filteredCheckIns.map((checkin) => (
    <div className="checkin-card" key={checkin.id}>
      <div className="checkin-icon">
        <img src="https://cdn-icons-gif.flaticon.com/17861/17861454.gif" alt="icon" />
      </div>
      <div className="checkin-info">
        <h5>{checkin.patientname?.toUpperCase() || "UNKNOWN"}</h5>
        <p>{new Date(checkin.checkInTime).toLocaleString()}</p>
        <p>Reg.No: {checkin.rigisterno || "N/A"}</p>
        <p>Ward: {checkin.wardNumber || "N/A"}</p>
      </div>
    </div>
  ))}
</div>

        )}
      </div>
    </div>
  );
}

export default Home;