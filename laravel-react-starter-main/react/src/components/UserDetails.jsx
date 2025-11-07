import React, {useEffect, useRef, useState} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import {MDBCol, MDBContainer, MDBRow, MDBCardText, MDBCardImage} from 'mdb-react-ui-kit';
import '../../public/resources/css/user.css'
import DatePicker from "react-datepicker";
import {useStateContext} from "../context/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import Map from "./Map.jsx";
import {useNavigate} from "react-router-dom";

function UserDetails() {
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [images, setImages] = useState([]);
  const [fileObjects, setFileObjects] = useState([]); // Array of file objects
  const [imageCount, setImageCount] = useState(0);
  const fileInputRef = useRef(null); //
  const {user,setUser} = useStateContext();
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext();
  const [errors, setErrors] = useState(null);
  const [userEdit, setUserEdit] = useState(user);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState("");
  const [temporaryProfile, setTemporaryProfile] = useState("");


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Get the selected files
    const updatedImages = files.map((file) => URL.createObjectURL(file));

    // Append new image URLs and file objects to the existing ones
    setImages([...images, ...updatedImages]); // Update the image preview URLs
    setFileObjects([...fileObjects, ...files]); // Store the file objects
    setImageCount(imageCount + files.length); // Update the image count

    setUserEdit({
      ...userEdit,
      user_pictures: [...(userEdit.user_pictures || []), ...files], // Append new files to the existing ones
    });
  };

  console.log(userEdit);
  const onChange = (e) => {

    if (e.target.name === "telephone") {
      let value = e.target.value;
      if (!value.startsWith('+389')) {
        value = '+389';
      }

      setUserEdit({
        ...userEdit,
        [e.target.name]: value,
      })
    } else {
      setUserEdit({
        ...userEdit,
        [e.target.name]: e.target.value,
      })
    }
  }

  useEffect(() => {


  }, [images],);


  useEffect(() => {
    setUserEdit((prevUserEdit) => ({
      ...prevUserEdit,
      location: location, // Update the location field in userEdit
    }));
  }, [location]);

  useEffect(() => {
    if (user) {
      setUserEdit(user);
    }
  }, [user]);

  useEffect(() => {
    if (userEdit && userEdit.location) {
      // Split the string to extract latitude and longitude
      const [lat, lon] = userEdit.location.split(", ").map(coord => parseFloat(coord));

      if (lat && lon) {
        // Nominatim reverse geocoding URL
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

        // Fetching the address from Nominatim
        fetch(nominatimUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name); // Set the formatted address
            } else {
              setAddress("Address not found");
            }
          })
          .catch((error) => {
            console.error("Error fetching address:", error);
            setAddress("Error fetching address");
          });
      } else {
        console.error("Latitude and Longitude are invalid");
      }
    }
  }, [userEdit]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (user) {
      const formData = new FormData();
      formData.append('name', userEdit.name);
      formData.append('email', userEdit.email);
      formData.append('gender', userEdit.gender);
      formData.append('preference', userEdit.preference);
      formData.append('location', userEdit.location);
      formData.append('date', userEdit.date);
      formData.append('telephone', userEdit.telephone);
      formData.append('password', userEdit.password); // Append only if updating
      formData.append('password_confirmation', userEdit.password_confirmation);
      formData.append('profile_picture',userEdit.profile_picture);
      userEdit.user_pictures.forEach(file => {
        formData.append('user_pictures[]', file); // Use 'user_pictures[]' for array-like data
      });

      axiosClient.post(`/users/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(({data}) => {
          setUser({
            data
          })
          setNotification('Your profile was successfully updated');
         navigate("");
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          } else {
            console.error('Error updating user:', response);
          }
        });

    } else {
      setNotification("You don't have permission to edit this user");
    }
  };




  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemporaryProfile(reader.result); // Set the base64 string for preview
      };
      setUserEdit({
        ...userEdit,
        profile_picture: file,
      });

      reader.readAsDataURL(file);
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    const updatedFileObjects = fileObjects.filter((_, index) => index !== indexToRemove);

    setImages(updatedImages); // Update the image previews
    setFileObjects(updatedFileObjects); // Update the file objects
    setImageCount(updatedImages.length); // Update the image count

    // Only clear the file input if there are no remaining files
    if (updatedImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }

    setUserEdit({
      ...userEdit,
      user_pictures: updatedFileObjects, // Update user pictures with the new file objects
    });
  };

  const handleDateChange = (date) => {
    setUserEdit({
      ...userEdit,
      date: date,
    });
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="container bootstrap snippets bootdey mt-5 bg-white border-black background">
          {errors && (
            <div className="alert">
              <p>{typeof errors === 'string' ? errors : JSON.stringify(errors)}</p>
            </div>
          )}
          <h1 className="text-black">Измени профил</h1>
          <hr/>
          <div className="row">

            <div className="col-md-3">
              <div className="text-center">
                <img src={
                  temporaryProfile && temporaryProfile.startsWith("data:image/")
                    ? temporaryProfile
                    : `http://localhost:8000/storage/${user.profile_picture}` // Otherwise, use the backend URL
                } className="avatar img-circle img-thumbnail"
                     alt="avatar"/>
                <h6>Постави друга слика...</h6>

                <input type="file" className="form-control p-4 pt-0" onChange={handleProfileImageChange}/>
              </div>
            </div>


            <div className="col-md-9 personal-info">

              <h3>Персонални информации</h3>

              <form className="form-horizontal" role="form">
                <div className="form-group">
                  <label className="col-lg-3 control-label">Име:</label>
                  <div className="col-lg-8">
                    <input className="form-control" type="text" name="name" value={userEdit.name} onChange={onChange}/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-lg-3 control-label">Телефон:</label>
                  <div className="col-lg-8">
                    <input className="form-control" type="text" name="telephone" value={userEdit.telephone}
                           onChange={(onChange)}/>
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-lg-3 control-label">Род:</label>
                  <div className="col-lg-8">
                    <div className="ui-select">
                      <select id="user_time_zonse" className="form-control" name="gender" value={userEdit.gender}
                              onChange={onChange}>
                        <option value="Машко">Машко</option>
                        <option value="Женско">Женско</option>
                        <option value="Друго">
                          Друго
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-lg-3 control-label">Преференца:</label>
                  <div className="col-lg-8">
                    <div className="ui-select">
                      <select id="user_time_zone" className="form-control" name="preference" value={userEdit.preference}
                              onChange={onChange}>
                        <option value="Машко">Машко</option>
                        <option value="Женско">Женско</option>
                        <option value="Се">
                          Се
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-lg-3 control-label">Email:</label>
                  <div className="col-lg-8">
                    <input className="form-control" type="email" name="email" value={userEdit.email}
                           onChange={onChange}/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-lg-3 control-label">Место на живеење:</label>
                  <div className="col-lg-8">
                    <Map setLocation={setLocation}/>
                    <p className={"text-center"}>{address ? `Адреса: ${address}` : "Fetching address..."}</p>
                  </div>
                </div>
                <div className="form-group z">
                  <label className="col-lg-3 control-label">Датум на раѓање:</label>
                  <div className="col-lg-8 index">
                    <DatePicker
                      name="date"
                      selected={userEdit.date}
                      onChange={handleDateChange}
                      dateFormat="dd MMM yyyy"
                      className="form-control index"
                      placeholderText="Датум"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-lg-3 control-label">Лозинка:</label>
                  <div className="col-lg-8">
                    <input className="form-control" type="password" name="password" onChange={onChange}
                           value={userEdit.password}/>
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-lg-3 control-label">Повтрди лозинка:</label>
                  <div className="col-lg-8">
                    <input className="form-control" name="password_confirmation" onChange={onChange} type="password"
                           value={userEdit.password_confirmation}/>
                  </div>
                </div>


              </form>
            </div>
          </div>
        </div>
        <hr/>
        <MDBContainer className="py-5 h-100 bg-white background mb-3">
          <div className="profile-pictures-section">
            <h3 className="mb-4">Постави слики</h3>

            {/* File Input */}
            <label className="btn btn-primary btn-lg px-5" htmlFor="file-input">
              Избери слики
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="d-none"
              ref={fileInputRef}
            />

            {/* Image Count Display */}
            <p className={`mt-3 ${imageCount > 0 ? 'text-success fw-bold' : 'text-danger'}`}>
              Број на избрани слики: <span className="text-dark">{imageCount}</span>
            </p>

            <div className="gallery">
              {images.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img src={image} alt={`Uploaded preview ${index}`}/>
                  <button
                    className="delete-button"
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

          </div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <MDBCardText className="lead fw-normal mb-0">Поставени слики</MDBCardText>
            <MDBCardText className="mb-0">
              <a href="#!" className="text-muted">Види се</a>
            </MDBCardText>

          </div>
          <div>
            <div className="row d-flex justify-content-center">
              {user.user_pictures && user.user_pictures.length > 0 ? (
                user.user_pictures.split(':').map((picture, index) => (

                  <div className="col-6 mb-4 custom-width" key={index}>
                    <img
                      src={`http://localhost:8000/storage/${picture}`}
                      alt={`image ${index + 1}`}
                      className="img-fluid w-100 rounded-3"
                    />

                </div>
                ))
                ) : null}
            </div>
          </div>
            <div className="d-flex justify-content-center">
              <button className="btn-submit">
                Направи промена

              </button>

            </div>

        </MDBContainer>
      </form>
    </div>
  );
}

export default UserDetails;
