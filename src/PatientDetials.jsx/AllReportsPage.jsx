import { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const [pin, setPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [currentAction, setCurrentAction] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'checkedIn', 'checkedOut'

  const notify = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 2000,  // Faster than default
      hideProgressBar: true,  // Simpler UI for rush situations
      closeOnClick: true,
      pauseOnHover: false,  // Don't wait for hover
      draggable: false,
      progress: undefined,
    });
  };
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "RegisterData"), orderBy("patientname"));
        const querySnapshot = await getDocs(q);
        
        const reportsData = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ 
            id: doc.id, 
            ...doc.data(),
            eventStatus: doc.data().eventStatus || false
          });
        });

        setReports(reportsData);
        notify('Data loaded successfully');
      } catch (error) {
        console.error("Error fetching reports: ", error);
        notify('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredReports = reports.filter((report) => {
    // Apply search filter
    const matchesSearch = 
      report.patientname?.toLowerCase().includes(searchTerm) ||
      report.palliativeId?.toLowerCase().includes(searchTerm) ||
      report.place?.toLowerCase().includes(searchTerm) ||
      report.address?.toLowerCase().includes(searchTerm);
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "checkedIn" && report.eventStatus) ||
      (statusFilter === "checkedOut" && !report.eventStatus);
    
    return matchesSearch && matchesStatus;
  });

  // Get current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckInOut = (reportId, action) => {
    setCurrentReportId(reportId);
    setCurrentAction(action);
    
    if (action === 'checkin') {
      updateReportStatus(reportId, true);
    } else {
      setShowPinModal(true);
    }
  };

  const verifyPinAndCheckout = () => {
    if (pin === "2012") {
      updateReportStatus(currentReportId, false);
      setShowPinModal(false);
      setPin("");
    } else {
      notify('Invalid PIN', 'error');
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      const reportRef = doc(db, "RegisterData", reportId);
      const updateData = {
        eventStatus: status,
        lastUpdated: new Date().toISOString()
      };
      
      if (status) {
        updateData.checkedInAt = new Date().toISOString();
      } else {
        updateData.checkedOutAt = new Date().toISOString();
      }
      
      await updateDoc(reportRef, updateData);
      
      setReports(reports.map(report => 
        report.id === reportId ? { 
          ...report, 
          eventStatus: status,
          checkedInAt: status ? new Date().toISOString() : report.checkedInAt,
          checkedOutAt: !status ? new Date().toISOString() : report.checkedOutAt
        } : report
      ));
      
      notify(`Successfully ${status ? 'checked in' : 'checked out'}`);
    } catch (error) {
      console.error("Error updating report: ", error);
      notify('Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
        <ToastContainer
        position="top-right"
        autoClose={2000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
      />
      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter PIN to Check Out</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">PIN</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={verifyPinAndCheckout}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Event Management - All Reports</h2>
          <div className="text-muted">
            Showing {filteredReports.length} of {reports.length} total records
            {filteredReports.length !== reports.length && (
              <span> (filtered)</span>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-search me-2"></i>Search & Filter Reports
          </div>
          <button 
            className="btn btn-sm btn-light"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>
                <i className="bi bi-chevron-up me-1"></i>Hide Filters
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down me-1"></i>Show Filters
              </>
            )}
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, ID, place, or address"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            {showFilters && (
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="checkedIn">Checked In</option>
                  <option value="checkedOut">Checked Out</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Ward</th>
                  <th>Place</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      No reports found matching your criteria
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((report) => (
                    <tr key={report.id}>
                      <td>{report.palliativeId || report.id}</td>
                      <td>
                        <Link 
                          to={`/main/patient/${report.id}`} 
                          className="text-decoration-none"
                        >
                          {report.patientname}
                        </Link>
                      </td>
                      <td>{report.wardNumber || "-"}</td>
                      <td>{report.place || "-"}</td>
                      <td>{report.vehicle || "-"}</td>
                      <td>
                        <span className={`badge ${report.eventStatus ? 'bg-success' : 'bg-danger'}`}>
                          {report.eventStatus ? 'Checked In' : 'Not Checked'}
                        </span>
                      </td>
                      <td>
                        {report.eventStatus ? (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCheckInOut(report.id, 'checkout')}
                          >
                            Check Out
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleCheckInOut(report.id, 'checkin')}
                          >
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredReports.length > recordsPerPage && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default AllReports;