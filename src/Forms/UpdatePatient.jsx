import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase/config";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdatePatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, "RegisterData", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          toast.error("Patient not found.");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
        toast.error("Error loading patient data.");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      },
    }));
  };

  const handlePeopleCountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      peopleWithYou: {
        ...prev.peopleWithYou,
        [name]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "RegisterData", id), formData);
      toast.success("Patient updated successfully!", {
        autoClose: 3000,
        onClose: () => navigate(`/main/patient/${id}`)
      });
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update patient.");
    }
  };

  if (loading || !formData) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
        <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Update Patient</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Patient Basic Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Patient Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="patientname"
                  value={formData.patientname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Palliative ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="palliativeId"
                  value={formData.palliativeId}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Place</label>
                <input
                  type="text"
                  className="form-control"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Panchayat</label>
                <input
                  type="text"
                  className="form-control"
                  name="panchayat"
                  value={formData.panchayat}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ward Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Equipment Required</label>
                <input
                  type="text"
                  className="form-control"
                  name="equipmentRequired"
                  value={formData.equipmentRequired}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Food Requirements</label>
                <input
                  type="text"
                  className="form-control"
                  name="food"
                  value={formData.food}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Medicine Requirements</label>
                <input
                  type="text"
                  className="form-control"
                  name="medicine"
                  value={formData.medicine}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Register Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="rigisterno"
                  value={formData.rigisterno}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Transportation Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Vehicle</label>
                <input
                  type="text"
                  className="form-control"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Leaving Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="leavingTime"
                  value={formData.leavingTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* People Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            People Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Number of Children</label>
                <input
                  type="number"
                  className="form-control"
                  name="children"
                  value={formData.peopleWithYou?.children || 0}
                  onChange={handlePeopleCountChange}
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Number of Adults</label>
                <input
                  type="number"
                  className="form-control"
                  name="adults"
                  value={formData.peopleWithYou?.adults || 0}
                  onChange={handlePeopleCountChange}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bystander Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Bystander Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Bystander Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.bystander?.name || ""}
                  onChange={(e) => handleNestedChange("bystander", e)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Phone 1</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone1"
                  value={formData.bystander?.phone1 || ""}
                  onChange={(e) => handleNestedChange("bystander", e)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Phone 2</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone2"
                  value={formData.bystander?.phone2 || ""}
                  onChange={(e) => handleNestedChange("bystander", e)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coordinator Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Coordinator Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Ward Coordinator Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.wardCoordinator?.name || ""}
                  onChange={(e) => handleNestedChange("wardCoordinator", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ward Coordinator Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.wardCoordinator?.phone || ""}
                  onChange={(e) => handleNestedChange("wardCoordinator", e)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Information */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            Volunteer Information
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Patient Volunteer Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.patientVolunteer?.name || ""}
                  onChange={(e) => handleNestedChange("patientVolunteer", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Patient Volunteer Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.patientVolunteer?.phone || ""}
                  onChange={(e) => handleNestedChange("patientVolunteer", e)}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Incharge Volunteer Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.inchargeVolunteer?.name || ""}
                  onChange={(e) => handleNestedChange("inchargeVolunteer", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Incharge Volunteer Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.inchargeVolunteer?.phone || ""}
                  onChange={(e) => handleNestedChange("inchargeVolunteer", e)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">Remarks</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Other Remarks</label>
              <textarea
                className="form-control"
                name="remarks"
                value={formData.remarks || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button 
            type="button" 
            className="btn btn-secondary me-md-2"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePatient;