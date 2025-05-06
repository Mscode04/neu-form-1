import { useState } from "react";
import { db } from "../Firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddPatient.css'

const Register = () => {
  const [formData, setFormData] = useState({
    palliativeId: "",
    patientname: "",
    rigisterno: "",
    address: "",
    place: "",
    panchayat: "MAKKARAPARAMBA",
    wardNumber: "",
    equipmentRequired: "",
    food: "",
    medicine: "NO",
    vehicle: "",
    peopleWithYou: {
      children: 0,
      adults: 0,
    },
    bystander: {
      name: "",
      phone1: "",
      phone2: "",
    },
    wardCoordinator: {
      name: "",
      phone: "",
    },
    patientVolunteer: {
      name: "",
      phone: "",
    },
    inchargeVolunteer: {
      name: "",
      phone: "",
    },
    leavingTime: "22:00",
    remarks: "NO REMARK",
  });

  // Generate PTV + 6 random digits ID
  const generatePalliativeId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `PTV${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Generate ID when form is submitted
      const palliativeId = generatePalliativeId();
      const dataToSave = { ...formData, palliativeId };
      
      // Use setDoc with the generated ID as document ID
      await setDoc(doc(db, "RegisterData", palliativeId), dataToSave);
      
      // Show success toast
      toast.success(`Added successfully! Patient ID: ${palliativeId}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form after submission
      setFormData({
        palliativeId: "",
        patientname: "",
        rigisterno:"",
        address: "",
        place: "",
        panchayat: "",
        wardNumber: "",
        equipmentRequired: "",
        food: "",
        medicine: "",
        vehicle: "",
        peopleWithYou: {
          children: 0,
          adults: 0,
        },
        bystander: {
          name: "",
          phone1: "",
          phone2: "",
        },
        wardCoordinator: {
          name: "",
          phone: "",
        },
        patientVolunteer: {
          name: "",
          phone: "",
        },
        inchargeVolunteer: {
          name: "",
          phone: "",
        },
        leavingTime: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Error saving data: ", error);
      // Show error toast
      toast.error("Error saving data. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
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
      <h2 className="mb-4">Patient Registration</h2>
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
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Place</label>
                <input
                  type="text"
                  className="form-control"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Panchayat</label>
                <input
                  type="text"
                  className="form-control"
                  name="panchayat"
                  value={formData.panchayat}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Ward Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Equipment Required</label>
                <select
                  className="form-select"
                  name="equipmentRequired"
                  value={formData.equipmentRequired}
                  onChange={handleChange}
                >
                  <option value="">Select Equipment</option>
                  <option value="WHEELCHAIR">WHEELCHAIR</option>
                  <option value="CHAIR">CHAIR</option>
                  <option value="COT">COT</option>
                </select>
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
                <select
                  className="form-select"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                >
                  <option value="">Select Vehicle</option>
                  <option value="AMBULANCE">AMBULANCE</option>
                  <option value="CAR">CAR</option>
                  <option value="AUTO">AUTO</option>
                  <option value="BIG CAR">BIG CAR</option>
                </select>
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
                  value={formData.peopleWithYou.children}
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
                  value={formData.peopleWithYou.adults}
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
                  value={formData.bystander.name}
                  onChange={(e) => handleNestedChange("bystander", e)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Phone 1</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone1"
                  value={formData.bystander.phone1}
                  onChange={(e) => handleNestedChange("bystander", e)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Phone 2</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone2"
                  value={formData.bystander.phone2}
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
                  value={formData.wardCoordinator.name}
                  onChange={(e) => handleNestedChange("wardCoordinator", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ward Coordinator Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.wardCoordinator.phone}
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
                  value={formData.patientVolunteer.name}
                  onChange={(e) => handleNestedChange("patientVolunteer", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Patient Volunteer Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.patientVolunteer.phone}
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
                  value={formData.inchargeVolunteer.name}
                  onChange={(e) => handleNestedChange("inchargeVolunteer", e)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Incharge Volunteer Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.inchargeVolunteer.phone}
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
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary btn-sm">
            Save 
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;