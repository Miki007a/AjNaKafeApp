import React, {useEffect, useRef, useState} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import {MDBCol, MDBContainer, MDBRow, MDBCardText, MDBCardImage} from 'mdb-react-ui-kit';
import '../../public/resources/css/user.css'
import CustomDatePicker from "./CustomDatePicker.jsx";
import {useStateContext} from "../context/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import Map from "./Map.jsx";
import {useNavigate} from "react-router-dom";
import { Hearts } from "react-loader-spinner";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function UserDetails() {
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [images, setImages] = useState([]);
  const [fileObjects, setFileObjects] = useState([]); // Array of file objects
  const [imageCount, setImageCount] = useState(0);
  const fileInputRef = useRef(null); //
  const {user,setUser} = useStateContext();
  const [loading, setLoading] = useState(true);
  const {setNotification} = useStateContext();
  const [errors, setErrors] = useState(null);
  const [userEdit, setUserEdit] = useState(user);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState("");
  const [temporaryProfile, setTemporaryProfile] = useState("");
  const [picturesModalOpen, setPicturesModalOpen] = useState(false);


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
    if (user && user.id) {
      setUserEdit({
        ...user,
        user_pictures: [] // Initialize as empty array for new file uploads
      });
      setLoading(false); // Set loading to false once user data is available
    } else {
      setLoading(true); // Keep loading if user data is not available
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
      formData.append('bio', userEdit.bio || ''); // Append bio field
      
      // Only append profile_picture if it's a File object (newly uploaded)
      if (userEdit.profile_picture && userEdit.profile_picture instanceof File) {
        formData.append('profile_picture', userEdit.profile_picture);
      }
      
      // Only append user_pictures if it's an array of File objects
      if (userEdit.user_pictures && Array.isArray(userEdit.user_pictures) && userEdit.user_pictures.length > 0) {
        // Filter to only include File objects (not strings/paths)
        const fileObjects = userEdit.user_pictures.filter(file => file instanceof File);
        fileObjects.forEach(file => {
          formData.append('user_pictures[]', file);
        });
      }

      axiosClient.post(`/users/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(() => {
          // Refetch user data from server to get the latest information
          return axiosClient.get('/user');
        })
        .then(({data: freshUserData}) => {
          // Update user in context with fresh data
          setUser(freshUserData);
          
          // Update userEdit with fresh data to reflect all changes
          setUserEdit({
            ...freshUserData,
            user_pictures: [] // Reset for new uploads
          });
          
          // Clear temporary states
          setImages([]);
          setFileObjects([]);
          setImageCount(0);
          setTemporaryProfile('');
          
          // Clear any errors
          setErrors(null);
          
          setNotification('Вашиот профил беше успешно ажуриран');
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          } else {
            console.error('Error updating user:', response);
            setNotification('Error updating profile. Please try again.');
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
    } else {
      // Reset to original if no file selected
      setTemporaryProfile('');
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    const updatedFileObjects = fileObjects.filter((_, index) => index !== indexToRemove);

    setImages(updatedImages); // Update the image preview URLs
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
    <div style={{ padding: '2rem 0' }}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%'
        }}>
          <Hearts
            height="400"
            width="400"
            color="#f5deb3"
            ariaLabel="hearts-loading"
            wrapperStyle={{}}
            visible={true}
          />
        </div>
      ) : (
      <form onSubmit={onSubmit}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Error Display */}
          {errors && (
            <div style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0 }}>{typeof errors === 'string' ? errors : JSON.stringify(errors)}</p>
            </div>
          )}


          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Profile Picture Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(139, 69, 19, 0.15)',
              textAlign: 'center',
              height: 'fit-content',
              top: '2rem'
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                <img 
                  src={
                    temporaryProfile && temporaryProfile.startsWith("data:image/")
                      ? temporaryProfile
                      : `http://localhost:8000/storage/${user.profile_picture}`
                  } 
                  alt="avatar"
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '5px solid #ffe593',
                    boxShadow: '0 8px 20px rgba(139, 69, 19, 0.2)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#ffe593',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(139, 69, 19, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5deb3';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffe593';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                  <label 
                    htmlFor="profile-picture-input" 
                    style={{ 
                      cursor: 'pointer',
                      fontSize: '24px',
                      color: '#8b4513',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    📷
                  </label>
                </div>
                <input 
                  id="profile-picture-input"
                  type="file" 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>

            {/* Personal Information Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(139, 69, 19, 0.15)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '3px solid #ffe593',
                paddingBottom: '0.5rem'
              }}>
                <h2 style={{
                  color: '#8b4513',
                  fontSize: '1.8rem',
                  margin: 0
                }}>
                  Персонални информации
                </h2>
                <button
                  type="button"
                  onClick={() => setPicturesModalOpen(true)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#8b4513',
                    backgroundColor: 'transparent',
                    border: '2px solid #ffe593',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffe593';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 69, 19, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📸</span>
                  Прикажи слики
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Име
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={userEdit.name || ''}
                    onChange={onChange}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #f5deb3',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fffef9'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffe593';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#f5deb3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Телефон
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="telephone"
                    value={userEdit.telephone || ''}
                    onChange={onChange}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #f5deb3',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fffef9'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffe593';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#f5deb3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Е-пошта
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={userEdit.email || ''}
                    onChange={onChange}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #f5deb3',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fffef9'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffe593';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#f5deb3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Род
                  </label>
                  <select
                    name="gender"
                    value={userEdit.gender || ''}
                    onChange={onChange}
                    style={{
                      width: '100%',
                      padding: '0.06rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #f5deb3',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fffef9',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffe593';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#f5deb3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="Машко">Машко</option>
                    <option value="Женско">Женско</option>
                    <option value="Друго">Друго</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Преференца
                  </label>
                  <select
                    name="preference"
                    value={userEdit.preference || ''}
                    onChange={onChange}
                    style={{
                      width: '100%',
                      padding: '0.06rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #f5deb3',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fffef9',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffe593';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#f5deb3';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="Машко">Машко</option>
                    <option value="Женско">Женско</option>
                    <option value="Се">Се</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#8b4513',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem'
                  }}>
                    Датум на раѓање
                  </label>
                  <CustomDatePicker
                    selected={userEdit.date ? new Date(userEdit.date) : null}
                    onChange={handleDateChange}
                    placeholder="Избери датум"
                    style={{
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#8b4513',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem'
                }}>
                  Место на живеење
                </label>
                <div style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #f5deb3'
                }}>
                  <Map setLocation={setLocation}/>
                </div>
                {address && (
                  <p style={{
                    marginTop: '0.5rem',
                    color: '#8b4513',
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }}>
                    📍 {address}
                  </p>
                )}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#8b4513',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem'
                }}>
                  Биографија
                </label>
                <textarea
                  className="form-control"
                  name="bio"
                  onChange={onChange}
                  value={userEdit.bio || ''}
                  rows="6"
                  placeholder="Напишете нешто за себе..."
                  maxLength="1000"
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #f5deb3',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fffef9',
                    minHeight: '150px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ffe593';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 229, 147, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#f5deb3';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                  <small style={{ color: '#8b4513', opacity: 0.7 }}>
                    {(userEdit.bio || '').length}/1000 карактери
                  </small>
                </div>
              </div>

              {/* Submit Button Section */}
              <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '2px solid #f5deb3',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                <button
                  type="submit"
                  style={{
                    padding: '14px 40px',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    color: 'white',
                    backgroundColor: '#8b4513',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.35)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#a0522d';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(139, 69, 19, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#8b4513';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.35)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Направи промена
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Pictures Modal */}
      <Dialog
        open={picturesModalOpen}
        onClose={() => setPicturesModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            padding: '1rem',
            backgroundColor: '#f9f9f9'
          }
        }}
      >
        <DialogTitle style={{
          color: '#8b4513',
          fontSize: '1.8rem',
          fontWeight: '600',
          borderBottom: '3px solid #ffe593',
          paddingBottom: '0.5rem',
          marginBottom: '1rem'
        }}>
          Слики
        </DialogTitle>
        <DialogContent>
          <div style={{ padding: '1rem' }}>
            {/* New Images Upload */}
            <div style={{
              backgroundColor: '#fffef9',
              borderRadius: '15px',
              padding: '1.5rem',
              border: '2px dashed #f5deb3',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <label 
                htmlFor="file-input" 
                style={{ 
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: '14px 28px',
                  backgroundColor: '#ffe593',
                  color: '#8b4513',
                  border: '2px solid #f5deb3',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(139, 69, 19, 0.2)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5deb3';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(139, 69, 19, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffe593';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(139, 69, 19, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📸 Избери слика
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
              {fileObjects.length > 0 && (
                <p style={{
                  marginTop: '1rem',
                  color: '#8b4513',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  {fileObjects.length} {fileObjects.length === 1 ? 'фајл избран' : 'фајлови избрани'}
                </p>
              )}
            </div>

            {/* New Images Preview */}
            {images.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: '#8b4513',
                  marginBottom: '1rem',
                  fontSize: '1.3rem'
                }}>
                  Нови слики
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1rem'
                }}>
                  {images.map((image, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(139, 69, 19, 0.15)',
                      aspectRatio: '1'
                    }}>
                      <img 
                        src={image} 
                        alt={`Uploaded preview ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff5252';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff6b6b';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Images */}
            {user.user_pictures && user.user_pictures.length > 0 && (
              <div>
                <h3 style={{
                  color: '#8b4513',
                  marginBottom: '1rem',
                  fontSize: '1.3rem'
                }}>
                  Поставени слики
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {user.user_pictures.split(':').map((picture, index) => (
                    <div key={index} style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(139, 69, 19, 0.15)',
                      aspectRatio: '1',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                      <img
                        src={`http://localhost:8000/storage/${picture}`}
                        alt={`image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions style={{ padding: '1.5rem', justifyContent: 'center', gap: '1rem' }}>
          <Button
            onClick={() => setPicturesModalOpen(false)}
            style={{
              padding: '10px 24px',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#8b4513',
              backgroundColor: 'transparent',
              border: '2px solid #f5deb3',
              borderRadius: '8px',
              textTransform: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fffef9';
              e.currentTarget.style.borderColor = '#ffe593';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#f5deb3';
            }}
          >
            Затвори
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserDetails;
