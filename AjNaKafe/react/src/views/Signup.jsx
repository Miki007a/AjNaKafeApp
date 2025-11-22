import React, {useRef, useState} from 'react';
import Map from '../components/Map.jsx';
import axiosClient from '../axios-client.js';
import CustomDatePicker from '../components/CustomDatePicker.jsx';
import {useStateContext} from '../context/ContextProvider.jsx';
import {Link} from "react-router-dom";

export default function Signup() {
  const {setUser, setToken} = useStateContext();
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(null);
  const [gender, setGender] = useState('');
  const [preference, setPreference] = useState('');
  const [telephone, setTelephone] = useState('+389');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const TOTAL_STEPS = 3;
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  const errorTextStyle = {
    color: '#c33',
    fontSize: '12px',
    margin: '6px 4px 0'
  };

  const getFieldError = (field) => errors?.[field]?.[0];

  const renderFieldError = (field) => {
    const message = getFieldError(field);
    if (!message) {
      return null;
    }

    return (
      <p style={errorTextStyle}>
        {message}
      </p>
    );
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+389')) {
      value = '+389' ;
    }
    setTelephone(value);
  };
  const handleComplete = (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setErrors({})
    setFormMessage('')
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirmation);
    formData.append('location', location);
    formData.append('date', date);
    formData.append("gender",gender);
    formData.append("preference", preference);
    formData.append("telephone", telephone);

    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    axiosClient.post('/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
        setCurrentStep(2);
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          const fieldErrors = response.data.errors || {};
          setErrors(fieldErrors);
          const hasFieldErrors = Object.keys(fieldErrors).length > 0;
          setFormMessage(!hasFieldErrors ? response.data.message : '');
        } else {
          setFormMessage('Настана грешка. Обидете се повторно.');
        }
      })
      .finally(() => {
        setIsLoading(false)
      });
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

  return (
    <div className="signup-page">
      <div className="signup-page__overlay"></div>

      <main className="signup-page__main">
        <div className="signup-page__wizard">
          {/* Progress indicator intentionally removed per new design */}

          {currentStep === 0 && (
            <div className="signup-card">
              <div className="signup-card__media">
                <img 
                  src="/coffe_cup.webp" 
                  alt="Coffee" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>

              <div className="signup-card__form">
                {/* Decorative Top Border */}
                <div style={{
                  height: '3px',
                  background: 'linear-gradient(90deg, #e6b980 0%, #eacda3 100%)',
                  width: '100%',
                  marginBottom: '15px',
                  borderRadius: '2px'
                }}></div>

                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(230, 185, 128, 0.3)'
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '26px',
                      color: '#fff'
                    }}>
                      person_add
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#2c2c2c',
                    margin: '0 0 4px 0',
                    letterSpacing: '-0.5px'
                  }}>Создади нов акаунт</h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: 0
                  }}>~ Откриј нови партнери ~</p>
                </div>

                <div className="signup-form-grid">
                  <div>
                    <label>Целосно име</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                        left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                        fontSize: '16px',
                      color: '#999',
                      zIndex: 1
                    }}>
                      person
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Вашето име"
                      required
                      style={{
                        width: '100%',
                          padding: '10px 10px 10px 34px',
                          fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                </div>
              {renderFieldError('name')}
                  </div>

                  <div>
                    <label>Датум на раѓање</label>
                  <CustomDatePicker
                    selected={date}
                    onChange={handleDateChange}
                    placeholder="Избери датум"
                    style={{
                      width: '100%'
                    }}
                  />
                {renderFieldError('date')}
                  </div>

                  <div>
                    <label>Род</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                        left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                        fontSize: '16px',
                      color: '#999',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      wc
                    </span>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      required
                      style={{
                        width: '100%',
                          padding: '10px 10px 10px 34px',
                          fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        appearance: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="" disabled>Одбери</option>
                      <option value="Машко">Машко</option>
                      <option value="Женско">Женско</option>
                      <option value="Друго">Друго</option>
                    </select>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                        right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: '#999',
                      pointerEvents: 'none'
                    }}>
                      expand_more
                    </span>
                </div>
                {renderFieldError('gender')}
                  </div>
                </div>

                {/* Location */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '6px',
                    marginLeft: '4px'
                  }}>
                    Место на живеење
                  </label>
                  <div style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '170px'
                  }}>
                    <Map setLocation={setLocation}/>
                  </div>
                </div>
                {renderFieldError('location')}

                <button
                  type="button"
                  onClick={nextStep}
                  style={{ 
                    width: '100%',
                    padding: '11px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(230, 185, 128, 0.4)',
                    marginBottom: '15px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 6px 20px rgba(230, 185, 128, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 15px rgba(230, 185, 128, 0.4)'
                  }}
                >
                  Следно
                </button>

                <div style={{ 
                  textAlign: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #eee'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    Веќе регистриран?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#e6b980', 
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#d8b086'}
                      onMouseLeave={(e) => e.target.style.color = '#e6b980'}
                    >
                      Логирај се
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div
              className="signup-card"
              style={{
                maxWidth: '980px',
                minHeight: '520px'
              }}
            >
              <div className="signup-card__media">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                ) : (
                  <img 
                    src="/coffe-love.jpg" 
                    alt="Coffee Love" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                )}
              </div>

              <div className="signup-card__form">
          
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h3 style={{ 
                    fontSize: '26px', 
                    fontWeight: '700', 
                    color: '#2c2c2c',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.5px'
                  }}>Дружи се со нас</h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#666',
                    margin: 0
                  }}>~ Заврши ја твојата регистрација ~</p>
                </div>

                {/* General Error Message */}
                {formMessage && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
                    color: '#c33',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    marginBottom: '18px',
                    border: '1px solid #fcc'
                  }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      {formMessage}
                    </p>
                  </div>
                )}

                <div className="signup-form-grid signup-form-grid--stack">
                {/* Preference */}
                  <div style={{ marginBottom: '0' }}>
                  <label style={{
                    display: 'block',
                      fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                      marginBottom: '4px',
                    marginLeft: '4px'
                  }}>
                    Преференца
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      color: '#999',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      favorite
                    </span>
                    <select 
                      value={preference} 
                      onChange={(e) => setPreference(e.target.value)}
                      required
                      style={{
                        width: '100%',
                          padding: '9px 9px 9px 34px',
                        fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        appearance: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="" disabled>Одбери</option>
                      <option value="Машко">Машко</option>
                      <option value="Женско">Женско</option>
                      <option value="Се">Се</option>
                    </select>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                        right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: '#999',
                      pointerEvents: 'none'
                    }}>
                      expand_more
                    </span>
                </div>
                {renderFieldError('preference')}
                  </div>

                  <div>
                  <label style={{
                    display: 'block',
                      fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                      marginBottom: '4px',
                    textAlign: 'center'
                  }}>
                    Профилна слика
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <button 
                    type="button"
                    onClick={handleButtonClick}
                    style={{
                      width: '100%',
                        padding: '9px',
                      fontSize: '13px',
                      fontWeight: '500',
                        background: profilePicture ? 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)' : '#f9f7f3',
                      color: profilePicture ? '#fff' : '#666',
                      border: '2px dashed #e6b980',
                        borderRadius: '9px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        gap: '8px'
                    }}
                  >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {profilePicture ? 'check_circle' : 'add_photo_alternate'}
                    </span>
                    {profilePicture ? profilePicture.name : 'Избери профилна слика'}
                  </button>
                  {profilePicturePreview && (
                    <p style={{
                        marginTop: '3px',
                      fontSize: '11px',
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      Сликата ќе биде прикажана лево ↑
                    </p>
                  )}
                {renderFieldError('profile_picture')}
                  </div>

                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px',
                    marginLeft: '4px'
                  }}>
                    Телефон
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      color: '#999',
                      zIndex: 1
                    }}>
                      phone
                    </span>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={handleChange}
                      placeholder="+389..."
                      required
                      style={{
                        width: '100%',
                          padding: '9px 9px 9px 34px',
                        fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                </div>
                {renderFieldError('telephone')}
                  </div>

                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px',
                    marginLeft: '4px'
                  }}>
                    Е-Пошта
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                        fontSize: '16px',
                      color: '#999',
                      zIndex: 1
                    }}>
                      email
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Ваша Е-Пошта"
                      required
                      style={{
                        width: '100%',
                          padding: '10px 10px 10px 38px',
                        fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                </div>
                {renderFieldError('email')}
                  </div>

                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px',
                    marginLeft: '4px'
                  }}>
                    Лозинка
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      color: '#999',
                      zIndex: 1
                    }}>
                      lock
                    </span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Внесете лозинка"
                      required
                      style={{
                        width: '100%',
                          padding: '9px 9px 9px 34px',
                        fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                </div>
                {renderFieldError('password')}
                  </div>

                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px',
                    marginLeft: '4px'
                  }}>
                    Потврди лозинка
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      color: '#999',
                      zIndex: 1
                    }}>
                      lock
                    </span>
                    <input
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      type="password"
                      placeholder="Потврдете ја лозинката"
                      required
                      style={{
                        width: '100%',
                          padding: '9px 9px 9px 34px',
                        fontSize: '13px',
                        border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                        boxSizing: 'border-box',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#e6b980'
                          e.target.style.boxShadow = '0 0 0 3px rgba(230, 185, 128, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                </div>
                {renderFieldError('password_confirmation')}
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: '#f5f5f5',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#eeeeee'
                      e.target.style.borderColor = '#d0d0d0'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f5f5f5'
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  >
                    Назад
                  </button>

                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isLoading}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: isLoading 
                        ? '#ccc' 
                        : 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isLoading 
                        ? 'none' 
                        : '0 4px 15px rgba(230, 185, 128, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 20px rgba(230, 185, 128, 0.5)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 15px rgba(230, 185, 128, 0.4)'
                      }
                    }}
                  >
                    {isLoading ? 'Вчитување...' : 'Регистрирај се'}
                  </button>
                </div>

                <div style={{ 
                  textAlign: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid #eee'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    Веќе регистриран?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#e6b980', 
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#d8b086'}
                      onMouseLeave={(e) => e.target.style.color = '#e6b980'}
                    >
                      Логирај се
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="signup-card signup-card--confirmation">
              <div className="signup-card__media">
                <img 
                  src="/date-cofffe.jpg" 
                  alt="Date Coffee" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>

              <div className="signup-card__form signup-card__form--centered">
                {/* Decorative Top Border */}
                <div style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, #e6b980 0%, #eacda3 100%)',
                  width: '100%',
                  marginBottom: '30px',
                  borderRadius: '2px'
                }}></div>

                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 25px',
                  background: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(230, 185, 128, 0.4)',
                  animation: 'scaleIn 0.5s ease'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '40px',
                    color: '#fff'
                  }}>
                    check_circle
                  </span>
                </div>

                <h3 style={{ 
                  fontSize: '26px', 
                  fontWeight: '700', 
                  color: '#2c2c2c',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.5px'
                }}>
                  Вашиот акаунт беше успешно креиран!
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#666',
                  margin: '0 0 30px 0'
                }}>
                  ~ Со среќа ~
                </p>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  width: '100%'
                }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: '#f5f5f5',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#eeeeee'
                      e.target.style.borderColor = '#d0d0d0'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f5f5f5'
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  >
                    Назад
                  </button>

                  <Link 
                    to="/"
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(230, 185, 128, 0.4)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 6px 20px rgba(230, 185, 128, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 15px rgba(230, 185, 128, 0.4)'
                    }}
                  >
                    Заврши
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}