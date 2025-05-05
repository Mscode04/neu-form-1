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
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Report - ${patient?.palliativeId || id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { 
              background-color: #034f73; 
              color: white; 
              padding: 20px; 
              text-align: center; 
              margin-bottom: 20px;
            }
            .patient-info { margin-bottom: 30px; }
            .section { 
              margin-bottom: 20px; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 15px;
            }
            .section h4 { 
              color: #034f73; 
              border-bottom: 2px solid #009e8c; 
              padding-bottom: 5px;
            }
            .info-row { display: flex; margin-bottom: 8px; }
            .info-label { font-weight: bold; width: 200px; }
            .print-footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px; 
              color: #666;
            }
            @page { size: auto; margin: 10mm; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>Palliative Care Patient Report</h2>
            <h3>${patient?.patientname || 'Patient'}</h3>
            <p>ID: ${patient?.palliativeId || id} | Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="patient-info">
            <div class="section">
              <h4>Basic Information</h4>
              <div class="info-row"><span class="info-label">Patient Name:</span> ${patient?.patientname || '-'}</div>
              <div class="info-row"><span class="info-label">Palliative ID:</span> ${patient?.palliativeId || '-'}</div>
              <div class="info-row"><span class="info-label">Address:</span> ${patient?.address || '-'}</div>
              <div class="info-row"><span class="info-label">Place:</span> ${patient?.place || '-'}</div>
              <div class="info-row"><span class="info-label">Panchayat:</span> ${patient?.panchayat || '-'}</div>
              <div class="info-row"><span class="info-label">Ward Number:</span> ${patient?.wardNumber || '-'}</div>
            </div>

            <div class="section">
              <h4>Care Requirements</h4>
              <div class="info-row"><span class="info-label">Equipment Needed:</span> ${patient?.equipmentRequired || '-'}</div>
              <div class="info-row"><span class="info-label">Medicine Requirements:</span> ${patient?.medicine || '-'}</div>
              <div class="info-row"><span class="info-label">Food Requirements:</span> ${patient?.food || '-'}</div>
            </div>

            <div class="section">
              <h4>Transportation</h4>
              <div class="info-row"><span class="info-label">Vehicle:</span> ${patient?.vehicle || '-'}</div>
              <div class="info-row"><span class="info-label">Leaving Time:</span> ${patient?.leavingTime || '-'}</div>
            </div>

            <div class="section">
              <h4>Contacts</h4>
              <div class="info-row"><span class="info-label">Bystander Name:</span> ${patient?.bystander?.name || '-'}</div>
              <div class="info-row"><span class="info-label">Bystander Phone 1:</span> ${patient?.bystander?.phone1 || '-'}</div>
              <div class="info-row"><span class="info-label">Bystander Phone 2:</span> ${patient?.bystander?.phone2 || '-'}</div>
            </div>

            <div class="section">
              <h4>Care Team</h4>
              <div class="info-row"><span class="info-label">Patient Volunteer:</span> ${patient?.patientVolunteer?.name || '-'} (${patient?.patientVolunteer?.phone || '-'})</div>
              <div class="info-row"><span class="info-label">Incharge Volunteer:</span> ${patient?.inchargeVolunteer?.name || '-'} (${patient?.inchargeVolunteer?.phone || '-'})</div>
              <div class="info-row"><span class="info-label">Ward Coordinator:</span> ${patient?.wardCoordinator?.name || '-'} (${patient?.wardCoordinator?.phone || '-'})</div>
            </div>

            <div class="section">
              <h4>Additional Information</h4>
              <div class="info-row"><span class="info-label">People With Patient:</span> Adults: ${patient?.peopleWithYou?.adults || 0}, Children: ${patient?.peopleWithYou?.children || 0}</div>
              <div class="info-row"><span class="info-label">Remarks:</span> ${patient?.remarks || '-'}</div>
            </div>
          </div>

          <div class="print-footer">
            <p>Generated on ${new Date().toLocaleString()} | Palliative Care Management System</p>
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
            <i className="bi bi-person-circle"></i> Basic Information
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