import React, {createRef, useRef, useState} from 'react';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import Map from '../components/Map.jsx';
import axiosClient from '../axios-client.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {useStateContext} from '../context/ContextProvider.jsx';
import {Link} from "react-router-dom";

export default function Signup() {
  const {setUser, setToken} = useStateContext();
  const [errors, setErrors] = useState(null);
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
  const fileInputRef = useRef(null);
  const formWizardRef = React.createRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
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
console.log(formData);
    axiosClient.post('/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
        handelNext();

      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });

  };

  const handelNext = () => {
    console.log("nextTab");
    formWizardRef.current?.nextTab();
  };
  const handelPrev = () => {
    console.log("prevTab");
    formWizardRef.current?.prevTab();
  };

  const tabChanged = (event) => {
    const {prevIndex, nextIndex} = event;
    console.log('prevIndex', prevIndex);
    console.log('nextIndex', nextIndex);
  };


  const handleDateChange = (date) => {
    setDate(date);
  };

  return (
    <div className="signup-container" style={{
      backgroundImage: `url('/coffee-background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <main>

        <FormWizard
          onComplete={handleComplete}
          onTabChange={tabChanged}
          ref={formWizardRef}>
          <FormWizard.TabContent title="Personal details" icon="ti-user">

            <div className="wrapper animated fadeInDown">
              <div className="inner">
                <div className="image-holder">
                  <img src="/coffe.jpg" alt=""/>
                </div>
                <div className="form-content">
                  <div className="form-inner">
                    <div className="form-header">
                      <h3>Создади нов акаунт</h3>
                      <p>~ Откриј нови партнери ~</p>
                    </div>
                    <div className="form-row">
                      <label htmlFor="">
                        <i className="zmdi zmdi-account-o"></i>
                        Целосно име
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="име"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="form-row" style={{marginBottom: '31px'}}>
                      <label htmlFor="">
                        <i className="zmdi zmdi-calendar-check"></i>
                        Датум на раѓање
                      </label>
                      <DatePicker
                        selected={date}
                        onChange={handleDateChange}
                        dateFormat="dd MMM yyyy"
                        className="form-control"
                        placeholderText="Датум"
                      />
                    </div>
                    <div className="form-row" style={{marginBottom: '31px'}}>
                      <label htmlFor="">
                        <i className="zmdi zmdi-account-o"></i>
                        Род
                      </label>
                      <div className="select">
                        <div className="form-holder">
                          <select value={gender} onChange={(e) => setGender(e.target.value)} name="dropdownGender"
                                  className="select-control">
                            <option value="" disabled selected>Одбери</option>
                            <option value="Машко">Машко</option>
                            <option value="Женско">Женско</option>
                            <option value="Друго">Друго</option>
                          </select>
                          <i className="zmdi zmdi-chevron-down"></i>
                        </div>
                      </div>
                    </div>

                    <div className="form-row" style={{marginBottom: '31px'}}>
                      <label htmlFor="">
                      <span className="material-symbols-outlined" style={{fontSize: '15px'}}>
                        pin_drop
                      </span>
                        Место на живеење
                      </label>
                      <Map setLocation={setLocation}/>
                    </div>

                    <button
                      className="file-upload-button"
                      style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                      }}
                      onClick={handelNext}
                    >
                      Следно
                    </button>
                    <p className="message"
                       style={{
                         marginTop: '25px'
                       }}>Веќе регистриран? <Link to="/login">Логирај се</Link></p>
                  </div>

                </div>
              </div>
            </div>
          </FormWizard.TabContent>

          <FormWizard.TabContent title="Location" icon="ti-location-pin">
            <div className="wrapper animated fadeInDown">
              <div className="inner">

                <div className="image-holder">
                  <img src="/coffe-love.jpg" alt=""/>
                </div>
                <div className="form-content">
                  {errors &&
                    <div className="alert">
                      {Object.keys(errors).map(key => (
                        <p key={key}>{errors[key][0]}</p>
                      ))}
                    </div>
                  }
                  <div className="form-inner">
                    <div className="form-header">
                      <h3>Создади нов акаунт</h3>
                      <p>~ Дружи се со нас ~</p>
                    </div>

                    <div className="form-row" style={{marginBottom: '31px'}}>
                      <label htmlFor="">
              <span className="material-symbols-outlined" style={{fontSize: '15px', verticalAlign: "sub"}}>
                heart_plus
              </span>
                        Преференца
                      </label>
                      <div className="select">
                        <div className="form-holder">
                          <select value={preference} onChange={(e) => setPreference(e.target.value)}
                                  className="select-control">
                            <option value="" disabled selected>Одбери</option>
                            <option value="Машко">Машко</option>
                            <option value="Женско">Женско</option>
                            <option value="Се">Се</option>
                          </select>
                          <i className="zmdi zmdi-chevron-down"></i>
                        </div>
                      </div>
                    </div>

                    <div className="form-row" style={{marginBottom: '31px', textAlign: 'center'}}>
                      <div className="file-upload-container">
                        <label>
                          <i className="zmdi zmdi-image"></i>
                          Профилна слика
                        </label>
                        <input
                          type="file"
                          id="profile-picture"
                          className="file-input"
                          ref={fileInputRef}
                          style={{display: 'none'}}
                          onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                        <button type="button" className="file-upload-button" onClick={handleButtonClick}>
                          {profilePicture ? profilePicture.name : 'Немате избрано слика'}
                        </button>
                      </div>
                    </div>

                    <div className="form-row">
                      <label htmlFor="">
                        <i className="zmdi zmdi-phone"></i>
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(handleChange)}
                        className="form-control"
                        placeholder="Телефон"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="">
                        <i className="zmdi zmdi-email"></i>
                        Имеил
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="form-control"
                        placeholder="Имеил"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="">
              <span
                className="material-symbols-outlined"
                style={{fontSize: '15px', marginTop: '6px', verticalAlign: "sub"}}
              >
                lock
              </span>
                        Лозинка
                      </label>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        type="password"
                        placeholder="Password"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="">
              <span
                className="material-symbols-outlined"
                style={{fontSize: '15px', marginTop: '6px', verticalAlign: "sub"}}
              >
                lock
              </span>
                        Потврди лозинка
                      </label>
                      <input
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        type="password"
                        className="form-control"
                        placeholder="Repeat Password"
                      />
                    </div>


                    <div className={'button-tabs'} style={{marginTop: 25 + 'px'}}>
                      <button
                        className="file-upload-button"
                        style={{
                          marginRight: '20px', // Adds space between the buttons
                          padding: '10px 20px', // Makes the button bigger
                          fontSize: '16px' // Increases the font size
                        }}
                        onClick={handelPrev}
                      >
                        Назад
                      </button>

                      <button
                        className="file-upload-button"
                        style={{
                          padding: '10px 20px', // Makes the button bigger
                          fontSize: '16px' // Increases the font size
                        }}
                        onClick={handleComplete}
                      >
                        Следно
                      </button>
                      <p className="message"
                         style={{
                           marginTop: '25px'// Increases the font size
                         }}>Веќе регистриран? <Link to="/login">Логирај се</Link></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormWizard.TabContent>


          <FormWizard.TabContent title="Confirmation" icon="ti-check">

          <div className="wrapper animated fadeInDown">
              <div className="inner">
                <div className="image-holder" style={{width: 50 + '%'}}>
                  <img src="/date-cofffe.jpg" alt=""/>
                </div>
                <div className="form-content">
                  <div className="form-inner form-inner-last">
                    <div className="ready">
            <span>
              <i className="zmdi zmdi-check"></i>
            </span>
                      <p className="text-1">Вашиот акаунт беше успешно креиран!</p>
                      <p className="text-2">~ Со среќа ~</p>
                      <div className={'button-tabs'} style={{marginTop: 25 + 'px'}}>
                        <button
                          className="file-upload-button"
                          style={{
                            marginRight: '20px', // Adds space between the buttons
                            padding: '10px 20px', // Makes the button bigger
                            fontSize: '16px' // Increases the font size
                          }}
                          onClick={handelPrev}
                        >
                          Назад
                        </button>

                        <button
                          className="file-upload-button"
                          style={{
                            padding: '10px 20px', // Makes the button bigger
                            fontSize: '16px' // Increases the font size
                          }}
                          type={"button"}

                        >

                          Заврши
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormWizard.TabContent>

        </FormWizard>
        {/* Add styles */}
        <style>{`
          @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
           .file-input {
            display: none;
          }
          .file-upload-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .custom-file-upload {
            display: inline-block;
            padding: 6px 12px;
            cursor: pointer;
            background-color: #d2b77d; /* Brownish color */
            color: #fff;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            margin-bottom: 8px;
          }

        `}</style>
      </main>
    </div>
  );
}
