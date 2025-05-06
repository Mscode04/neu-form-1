import { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx'
import './PatientTable.css'

const PatientTable = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    wardNumbers: [],
    panchayats: [],
    equipmentOptions: [],
    vehicleOptions: [],
    foodOptions: [],
    medicineOptions: [],
    wardCoordinators: [],
    inchargeVolunteers: [],
    patientVolunteers: []
  });
  const [filter, setFilter] = useState({
    wardNumber: "",
    panchayat: "",
    equipmentRequired: "",
    vehicle: "",
    food: "",
    medicine: "",
    wardCoordinator: "",
    inchargeVolunteer: "",
    patientVolunteer: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    const fetchPatientsAndOptions = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "RegisterData"), orderBy("patientname"));
        const querySnapshot = await getDocs(q);
        
        const patientsData = [];
        const options = {
          wardNumbers: new Set(),
          panchayats: new Set(),
          equipmentOptions: new Set(),
          vehicleOptions: new Set(),
          foodOptions: new Set(),
          medicineOptions: new Set(),
          wardCoordinators: new Set(),
          inchargeVolunteers: new Set(),
          patientVolunteers: new Set()
        };

        querySnapshot.forEach((doc) => {
          const patient = { id: doc.id, ...doc.data() };
          patientsData.push(patient);

          if (patient.wardNumber) options.wardNumbers.add(patient.wardNumber);
          if (patient.panchayat) options.panchayats.add(patient.panchayat);
          if (patient.equipmentRequired) options.equipmentOptions.add(patient.equipmentRequired);
          if (patient.vehicle) options.vehicleOptions.add(patient.vehicle);
          if (patient.food) options.foodOptions.add(patient.food);
          if (patient.medicine) options.medicineOptions.add(patient.medicine);
          if (patient.wardCoordinator?.name) options.wardCoordinators.add(patient.wardCoordinator.name);
          if (patient.inchargeVolunteer?.name) options.inchargeVolunteers.add(patient.inchargeVolunteer.name);
          if (patient.patientVolunteer?.name) options.patientVolunteers.add(patient.patientVolunteer.name);
        });

        setPatients(patientsData);
        setFilterOptions({
          wardNumbers: Array.from(options.wardNumbers).sort(),
          panchayats: Array.from(options.panchayats).sort(),
          equipmentOptions: Array.from(options.equipmentOptions).sort(),
          vehicleOptions: Array.from(options.vehicleOptions).sort(),
          foodOptions: Array.from(options.foodOptions).sort(),
          medicineOptions: Array.from(options.medicineOptions).sort(),
          wardCoordinators: Array.from(options.wardCoordinators).sort(),
          inchargeVolunteers: Array.from(options.inchargeVolunteers).sort(),
          patientVolunteers: Array.from(options.patientVolunteers).sort()
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsAndOptions();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilter({
      wardNumber: "",
      panchayat: "",
      equipmentRequired: "",
      vehicle: "",
      food: "",
      medicine: "",
      wardCoordinator: "",
      inchargeVolunteer: "",
      patientVolunteer: ""
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
    patient.patientname?.toLowerCase().includes(searchTerm) ||
    patient.palliativeId?.toLowerCase().includes(searchTerm) ||
    patient.rigisterno?.toLowerCase().includes(searchTerm) || // 👈 added line
    patient.place?.toLowerCase().includes(searchTerm) ||
    patient.address?.toLowerCase().includes(searchTerm) ||
    patient.bystander?.phone1?.includes(searchTerm) ||
    patient.bystander?.phone2?.includes(searchTerm) ||
    patient.wardCoordinator?.phone?.includes(searchTerm);
  
    
    const matchesFilter = 
      (filter.wardNumber === "" || patient.wardNumber === filter.wardNumber) &&
      (filter.panchayat === "" || patient.panchayat === filter.panchayat) &&
      (filter.equipmentRequired === "" || patient.equipmentRequired === filter.equipmentRequired) &&
      (filter.vehicle === "" || patient.vehicle === filter.vehicle) &&
      (filter.food === "" || patient.food === filter.food) &&
      (filter.medicine === "" || patient.medicine === filter.medicine) &&
      (filter.wardCoordinator === "" || patient.wardCoordinator?.name === filter.wardCoordinator) &&
      (filter.inchargeVolunteer === "" || patient.inchargeVolunteer?.name === filter.inchargeVolunteer) &&
      (filter.patientVolunteer === "" || patient.patientVolunteer?.name === filter.patientVolunteer);
    
    return matchesSearch && matchesFilter;
  });

  // Get current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredPatients.map(patient => ({
      'Reg No': patient.rigisterno || patient.id,
      'Patient Name': patient.patientname,
      'Age': patient.age,
      'Place': patient.place || '-',
      'Address': patient.address || '-',
      'Ward Number': patient.wardNumber || '-',
      'Panchayat': patient.panchayat || '-',
      'Equipment Required': patient.equipmentRequired || 'None',
      'Vehicle': patient.vehicle || '-',
      'Food': patient.food || '-',
      'Medicine': patient.medicine || '-',
      'Contact 1': patient.bystander?.phone1 || '-',
      'Contact 2': patient.bystander?.phone2 || '-',
      'Ward Coordinator': patient.wardCoordinator?.name || '-',
      'Ward Coordinator Phone': patient.wardCoordinator?.phone || '-',
      'Incharge Volunteer': patient.inchargeVolunteer?.name || '-',
      'Incharge Volunteer Phone': patient.inchargeVolunteer?.phone || '-',
      'Patient Volunteer': patient.patientVolunteer?.name || '-',
      'Patient Volunteer Phone': patient.patientVolunteer?.phone || '-',
      'Remarks': patient.remarks || '-',
      'Status': patient.status || '-'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    
    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    let fileName = `Patient_Records_${date}`;
    
    // Add filter info to filename if any filter is active
    const activeFilters = Object.entries(filter).filter(([_, value]) => value !== "");
    if (activeFilters.length > 0 || searchTerm) {
      fileName += '_Filtered';
    }
    
    // Export the workbook
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };


  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=1000,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Records</title>
          <style>
            @page {
              size: landscape;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
              position: sticky;
              top: 0;
            }
            .filter-info {
              margin-bottom: 15px;
              font-size: 14px;
              color: #555;
            }
            .print-date {
              text-align: right;
              margin-bottom: 10px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <h1>Patient Records</h1>
          <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>
          ${getFilterInfo()}
          ${getPrintableTable()}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Helper function to generate filter information
  const getFilterInfo = () => {
    const activeFilters = Object.entries(filter).filter(([_, value]) => value !== "");
    let filterInfo = '';
    
    if (activeFilters.length > 0 || searchTerm) {
      filterInfo = '<div class="filter-info"><strong>Filters Applied:</strong><ul>';
      
      if (searchTerm) {
        filterInfo += `<li>Search: "${searchTerm}"</li>`;
      }
      
      activeFilters.forEach(([key, value]) => {
        filterInfo += `<li>${key}: ${value}</li>`;
      });
      
      filterInfo += '</ul></div>';
    }
    
    return filterInfo;
  };

  // Helper function to generate printable table HTML
  const getPrintableTable = () => {
    return `
      <table>
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Patient Name</th>
            <th>Place</th>
            <th>Address</th>
            <th>Ward Number</th>
            <th>Panchayat</th>
            <th>Equipment Required</th>
            <th>Vehicle</th>
            <th>Food</th>
            <th>Medicine</th>
            <th>Contact 1</th>
            <th>Contact 2</th>
            <th>Ward Coordinator</th>
            <th>Ward Coordinator Phone</th>
            <th>Incharge Volunteer</th>
            <th>Incharge Volunteer Phone</th>
            <th>Patient Volunteer</th>
            <th>Patient Volunteer Phone</th>
            <th>Palliative ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredPatients.map(patient => `
            <tr>
              <td>${patient.rigisterno || patient.id || '-'}</td>
              <td>${patient.patientname || '-'}</td>
              <td>${patient.place || '-'}</td>
              <td>${patient.address || '-'}</td>
              <td>${patient.wardNumber || '-'}</td>
              <td>${patient.panchayat || '-'}</td>
              <td>${patient.equipmentRequired || 'None'}</td>
              <td>${patient.vehicle || '-'}</td>
              <td>${patient.food || '-'}</td>
              <td>${patient.medicine || '-'}</td>
              <td>${patient.bystander?.phone1 || '-'}</td>
              <td>${patient.bystander?.phone2 || '-'}</td>
              <td>${patient.wardCoordinator?.name || '-'}</td>
              <td>${patient.wardCoordinator?.phone || '-'}</td>
              <td>${patient.inchargeVolunteer?.name || '-'}</td>
              <td>${patient.inchargeVolunteer?.phone || '-'}</td>
              <td>${patient.patientVolunteer?.name || '-'}</td>
              <td>${patient.patientVolunteer?.phone || '-'}</td>
              <td>${patient.palliativeId || '-'}</td>
              <td>${patient.status || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div>Total Records: ${filteredPatients.length}</div>
    `;
  };  
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
  <h2>Patient Records</h2>
  <div className="text-muted">
    Showing {filteredPatients.length} of {patients.length} total records
    {filteredPatients.length !== patients.length && (
      <span> (filtered)</span>
    )}
  </div>
</div>


        {/* <div>
          <h2>Patient Records</h2>
          <div className="text-muted">
            Showing {currentRecords.length} of {filteredPatients.length} records
            {filteredPatients.length !== patients.length && (
              <span> (filtered from {patients.length} total records)</span>
            )}
          </div>
        </div> */}
           <button 
            onClick={handlePrint} 
            className="btn btn-secondary me-2"
            disabled={filteredPatients.length === 0}
          >
            <i className="bi bi-printer me-2"></i>Print
          </button>
            <button 
            onClick={exportToExcel} 
            className="btn btn-primary"
            disabled={filteredPatients.length === 0}
          >
            <i className="bi bi-file-earmark-excel "></i>Export to Excel
          </button>
        <Link to="/main/addpt" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Add New Patient
        </Link>
      </div>

      {/* Search and Filters */}
      {/* Search and Filters */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-search me-2"></i>Search Patients
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
            <div className="col-md-12">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, ID, place, address, Reg No, or phone number"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            {showFilters && (
              <>
                <div className="col-md-4">
                  <label className="form-label">Ward Number</label>
                  <select
                    className="form-select"
                    name="wardNumber"
                    value={filter.wardNumber}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Wards</option>
                    {filterOptions.wardNumbers.map((ward) => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Panchayat</label>
                  <select
                    className="form-select"
                    name="panchayat"
                    value={filter.panchayat}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Panchayats</option>
                    {filterOptions.panchayats.map((panchayat) => (
                      <option key={panchayat} value={panchayat}>{panchayat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Equipment Required</label>
                  <select
                    className="form-select"
                    name="equipmentRequired"
                    value={filter.equipmentRequired}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Equipment</option>
                    {filterOptions.equipmentOptions.map((equipment) => (
                      <option key={equipment} value={equipment}>{equipment}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Vehicle</label>
                  <select
                    className="form-select"
                    name="vehicle"
                    value={filter.vehicle}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Vehicles</option>
                    {filterOptions.vehicleOptions.map((vehicle) => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Food</label>
                  <select
                    className="form-select"
                    name="food"
                    value={filter.food}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Food Types</option>
                    {filterOptions.foodOptions.map((food) => (
                      <option key={food} value={food}>{food}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Medicine</label>
                  <select
                    className="form-select"
                    name="medicine"
                    value={filter.medicine}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Medicines</option>
                    {filterOptions.medicineOptions.map((medicine) => (
                      <option key={medicine} value={medicine}>{medicine}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ward Coordinator</label>
                  <select
                    className="form-select"
                    name="wardCoordinator"
                    value={filter.wardCoordinator}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Coordinators</option>
                    {filterOptions.wardCoordinators.map((coordinator) => (
                      <option key={coordinator} value={coordinator}>{coordinator}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Incharge Volunteer</label>
                  <select
                    className="form-select"
                    name="inchargeVolunteer"
                    value={filter.inchargeVolunteer}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Incharge Volunteers</option>
                    {filterOptions.inchargeVolunteers.map((volunteer) => (
                      <option key={volunteer} value={volunteer}>{volunteer}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Patient Volunteer</label>
                  <select
                    className="form-select"
                    name="patientVolunteer"
                    value={filter.patientVolunteer}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Patient Volunteers</option>
                    {filterOptions.patientVolunteers.map((volunteer) => (
                      <option key={volunteer} value={volunteer}>{volunteer}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          
          {showFilters && (
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={clearFilters}
            >
              <i className="bi bi-x-circle me-2"></i>Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Patients Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Reg.no</th>
                  <th>Patient Name</th>
                  <th>Place</th>
                 
                  <th>Ward</th>
                  <th>Equipment</th>
                  <th>Contact</th>
                  <th>Ward Coordinator</th>
                  <th>Volunteers</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      No patients found matching your criteria
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <Link 
                          to={`/main/patient/${patient.id}`} 
                          className="text-decoration-none fw-bold text-primary"
                        >
                          {patient.rigisterno || patient.id}
                        </Link>
                      </td>
                      <td>
                        <Link 
                          to={`/main/patient/${patient.id}`} 
                          className="text-decoration-none"
                        >
                          {patient.patientname}
                        </Link>
                      </td>
                      <td>{patient.place || "-"}</td>
                      
                      <td>{patient.wardNumber || "-"}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {patient.equipmentRequired || "None"}
                        </span>
                      </td>
                      <td>
                        {patient.bystander?.phone1 || 
                         patient.wardCoordinator?.phone ||
                         "-"}
                      </td>
                      <td>
                        {patient.wardCoordinator?.name || "-"}
                        {patient.wardCoordinator?.phone && (
                          <div className="text-muted small">
                            {patient.wardCoordinator.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          {patient.inchargeVolunteer?.name && (
                            <div>
                              <span className="fw-bold">Incharge:</span> {patient.inchargeVolunteer.name} <br/>  <span className="fw-bold">Phone:{patient.inchargeVolunteer.phone}</span> 
                            </div>
                          )}
                          {patient.patientVolunteer?.name && (
                            <div>
                              <span className="fw-bold">Patient:</span> {patient.patientVolunteer.name} <br/> <span className="fw-bold">Phone:{patient.patientVolunteer.phone}</span>
                            </div>
                          )}
                        </div>
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
      {filteredPatients.length > recordsPerPage && (
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

export default PatientTable;