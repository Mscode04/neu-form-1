import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Firebase/config";
import './PatientDetails.css'
const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, "RegisterData", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching patient detail:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=1024,height=768');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 10px;
              font-size: 12px;
            }
            .report-container {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
            }
            .header {
              width: 100%;
              background-color: #034f73;
              color: white;
              padding: 10px;
              text-align: center;
              margin-bottom: 10px;
              border-radius: 5px;
            }
            .card {
              flex: 1 1 45%;
              min-width: 300px;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .card-title {
              background-color: #009e8c;
              color: white;
              padding: 5px 10px;
              margin: -10px -10px 10px -10px;
              border-radius: 5px 5px 0 0;
              font-weight: bold;
            }
            .info-row {
              display: flex;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              min-width: 120px;
            }
            .footer {
              width: 100%;
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
              color: #666;
            }
            .qr-code-placeholder {
              width: 80px;
              height: 80px;
              border: 1px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              float: right;
              margin-left: 10px;
              font-size: 10px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
          </div>
          
          <div class="report-container">
            <!-- Basic Information Card -->
            <div class="card">
              <div class="card-title">BASIC INFORMATION</div>
              <div class="info-row"><span class="info-label">Patient ID:</span> ${patient?.palliativeId || '-'}</div>
              <div class="info-row"><span class="info-label">Reg No:</span> ${patient?.rigisterno || '-'}</div>
              <div class="info-row"><span class="info-label">Name:</span> ${patient?.patientname || '-'}</div>
              <div className="info-row">
  <span className="info-label">Status:</span>
  {patient?.status === true ? 'Checkin' : 'Not Checked'}
</div>

              <div class="info-row"><span class="info-label">Address:</span> ${patient?.address || '-'}</div>
              <div class="info-row"><span class="info-label">Place:</span> ${patient?.place || '-'}</div>
              <div class="info-row"><span class="info-label">Panchayat:</span> ${patient?.panchayat || '-'}</div>
              <div class="info-row"><span class="info-label">Ward No:</span> ${patient?.wardNumber || '-'}</div>
            </div>
            
            <!-- Contact Information Card -->
            <div class="card">
              <div class="card-title">CONTACT INFORMATION</div>
              <div class="info-row"><span class="info-label">Bystander Name:</span> ${patient?.bystander?.name || '-'}</div>
              <div class="info-row"><span class="info-label">Phone 1:</span> ${patient?.bystander?.phone1 || '-'}</div>
              <div class="info-row"><span class="info-label">Phone 2:</span> ${patient?.bystander?.phone2 || '-'}</div>
              <div class="info-row"><span class="info-label">People With:</span> Adults: ${patient?.peopleWithYou?.adults || 0}, Children: ${patient?.peopleWithYou?.children || 0}</div>
              <div class="info-row"><span class="info-label">Remarks:</span> ${patient?.remarks || '-'}</div>
            </div>
            
            <!-- Care Requirements Card -->
            <div class="card">
              <div class="card-title">CARE REQUIREMENTS</div>
              <div class="info-row"><span class="info-label">Equipment:</span> ${patient?.equipmentRequired || '-'}</div>
              <div class="info-row"><span class="info-label">Medicine:</span> ${patient?.medicine || '-'}</div>
              <div class="info-row"><span class="info-label">Food:</span> ${patient?.food || '-'}</div>
            </div>
            
            <!-- Transportation Card -->
            <div class="card">
              <div class="card-title">TRANSPORTATION</div>
              <div class="info-row"><span class="info-label">Vehicle:</span> ${patient?.vehicle || '-'}</div>
              <div class="info-row"><span class="info-label">Leaving Time:</span> ${patient?.leavingTime || '-'}</div>
            </div>
            
            <!-- Care Team Card -->
            <div class="card">
              <div class="card-title">CARE TEAM</div>
              <div class="info-row"><span class="info-label">Patient Volunteer:</span> ${patient?.patientVolunteer?.name || '-'}</div>
              <div class="info-row"><span class="info-label">Phone:</span> ${patient?.patientVolunteer?.phone || '-'}</div>
              <div class="info-row"><span class="info-label">Incharge Volunteer:</span> ${patient?.inchargeVolunteer?.name || '-'}</div>
              <div class="info-row"><span class="info-label">Phone:</span> ${patient?.inchargeVolunteer?.phone || '-'}</div>
              <div class="info-row"><span class="info-label">Ward Coordinator:</span> ${patient?.wardCoordinator?.name || '-'}</div>
              <div class="info-row"><span class="info-label">Phone:</span> ${patient?.wardCoordinator?.phone || '-'}</div>
            </div>
            
            
          </div>
          
         
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDelete = async () => {
    const pin = prompt("Enter PIN to delete:");
    if (pin !== "2012") {
      alert("Incorrect PIN. Deletion cancelled.");
      return;
    }

    try {
      await deleteDoc(doc(db, "RegisterData", id));
      alert("Patient record deleted successfully.");
      navigate("/");
    } catch (err) {
      alert("Failed to delete patient.");
      console.error("Delete error:", err);
    }
  };

  const handleUpdate = () => {
    navigate(`/main/update-patient/${id}`);
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

  if (notFound || !patient) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Patient {id} not found!
        </h4>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-header">
        <div>
          <button className="btn btn-back" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>
        <h2>Patient Details</h2>
        <div className="action-buttons">
          <button className="btn btn-print" onClick={handlePrint}>
            <i className="bi bi-printer"></i> Print Report
          </button>
          <button className="btn btn-update" onClick={handleUpdate}>
            <i className="bi bi-pencil"></i> Update
          </button>
          <button className="btn btn-delete" onClick={handleDelete}>
            <i className="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>

      <div className="patient-card">
        <div className="section basic-info">
          <h3 className="section-title">
            <i className="bi bi-person-circle"></i>Reg:  {patient.rigisterno || '-'}
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label non-selectable">Patient Name:</span>
              <span className="info-value non-selectable non-selectable">{patient.patientname}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Palliative ID:</span>
              <span className="info-value non-selectable">{patient.palliativeId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Place:</span>
              <span className="info-value non-selectable">{patient.place}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address:</span>
              <span className="info-value non-selectable">{patient.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Panchayat:</span>
              <span className="info-value non-selectable">{patient.panchayat}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ward Number:</span>
              <span className="info-value non-selectable">{patient.wardNumber}</span>
            </div>
          </div>
        </div>

        <div className="section care-requirements">
          <h3 className="section-title">
            <i className="bi bi-clipboard2-pulse"></i> Care Requirements
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Equipment Required:</span>
              <span className="info-value non-selectable">{patient.equipmentRequired || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Medicine:</span>
              <span className="info-value non-selectable">{patient.medicine || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Food:</span>
              <span className="info-value non-selectable">{patient.food || '-'}</span>
            </div>
          </div>
        </div>

        <div className="section transportation">
          <h3 className="section-title">
            <i className="bi bi-truck"></i> Transportation
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Vehicle:</span>
              <span className="info-value non-selectable">{patient.vehicle || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Leaving Time:</span>
              <span className="info-value non-selectable">{patient.leavingTime || '-'}</span>
            </div>
          </div>
        </div>

        <div className="section contacts">
          <h3 className="section-title">
            <i className="bi bi-telephone"></i> Contacts
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Bystander Name:</span>
              <span className="info-value non-selectable">{patient.bystander?.name || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone 1:</span>
              <span className="info-value non-selectable">{patient.bystander?.phone1 || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone 2:</span>
              <span className="info-value non-selectable">{patient.bystander?.phone2 || '-'}</span>
            </div>
          </div>
        </div>

        <div className="section care-team">
          <h3 className="section-title">
            <i className="bi bi-people"></i> Care Team
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Patient Volunteer:</span>
              <span className="info-value non-selectable">
                {patient.patientVolunteer?.name || '-'} ({patient.patientVolunteer?.phone || '-'})
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Incharge Volunteer:</span>
              <span className="info-value non-selectable">
                {patient.inchargeVolunteer?.name || '-'} ({patient.inchargeVolunteer?.phone || '-'})
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Ward Coordinator:</span>
              <span className="info-value non-selectable">
                {patient.wardCoordinator?.name || '-'} ({patient.wardCoordinator?.phone || '-'})
              </span>
            </div>
          </div>
        </div>

        <div className="section additional-info">
          <h3 className="section-title">
            <i className="bi bi-info-circle"></i> Additional Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">People With Patient:</span>
              <span className="info-value non-selectable">
                Adults: {patient.peopleWithYou?.adults || 0}, Children: {patient.peopleWithYou?.children || 0}
              </span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Remarks:</span>
              <span className="info-value non-selectable">{patient.remarks || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;