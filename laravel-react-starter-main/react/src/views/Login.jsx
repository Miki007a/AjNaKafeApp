import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import React, {createRef} from "react";
import {useStateContext} from "../context/ContextProvider.jsx";
import { useState } from "react";

export default function Login() {
  const emailRef = createRef()
  const passwordRef = createRef()
  const { setUser, setToken } = useStateContext()
  const [message, setMessage] = useState(null)

  const onSubmit = ev => {
    ev.preventDefault()

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }
    axiosClient.post('/login', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setMessage(response.data.message)
        }
      })
  }

  return (
    <div style={{
      backgroundImage: `url('/coffee-background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} className="login-signup-form animated fadeInDown">
      <div style={{
        width: '100%',
        maxWidth: '500px',
        minWidth: '300px'
      }}>
        <div style={{
          background: 'linear-gradient(to top, #e6b980 0%, #eacda3 100%)',
          borderRadius: '15px',
          boxShadow: '0px 7px 18px 0px rgba(0, 0, 0, 0.2)',
          border: '2px solid black',
          overflow: 'hidden'
        }}>
          <div style={{
            border: '1px solid #524b42',
            padding: '40px 30px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <form onSubmit={onSubmit} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  margin: '0 0 20px 0'
                }}>Најава</h3>
              </div>
              
              {message && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  border: '1px solid #f5c6cb'
                }}>
                  <p style={{ margin: 0 }}>{message}</p>
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <input 
                  ref={emailRef} 
                  type="email" 
                  className="form-control" 
                  placeholder="Е-пошта"
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <input 
                  ref={passwordRef} 
                  type="password" 
                  className="form-control" 
                  placeholder="Лозинка"
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '15px'
              }}>
                <button 
                  className="file-upload-button" 
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#8b4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#a0522d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#8b4513'}
                >
                  Најава
                </button>
                
                <p style={{ 
                  margin: '10px 0 0 0',
                  fontSize: '14px',
                  color: '#333'
                }}>
                  Не сте регистрирани? <Link to="/signup" style={{ color: '#8b4513', fontWeight: 'bold' }}>Создади нов акаунт</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
