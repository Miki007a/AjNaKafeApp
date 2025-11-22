import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import React, {createRef, useState} from "react";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Login() {
  const emailRef = createRef()
  const passwordRef = createRef()
  const { setUser, setToken } = useStateContext()
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const errorTextStyle = {
    color: '#c33',
    fontSize: '12px',
    margin: '6px 4px 0',
  }

  const renderFieldError = (field) => {
    const fieldMessage = errors?.[field]?.[0]
    if (!fieldMessage) {
      return null
    }

    return (
      <p style={errorTextStyle}>
        {fieldMessage}
      </p>
    )
  }

  const onSubmit = ev => {
    ev.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setErrors({})

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
          const fieldErrors = response.data.errors || {}
          setErrors(fieldErrors)
          const hasFieldErrors = Object.keys(fieldErrors).length > 0
          setMessage(!hasFieldErrors ? response.data.message : null)
        } else {
          setMessage('Настана грешка. Обидете се повторно.')
        }
      })
      .finally(() => {
        setIsLoading(false)
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
      padding: '20px',
      position: 'relative'
    }} className="login-signup-form animated fadeInDown">
      {/* Overlay for better contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.25)',
        zIndex: 0
      }}></div>
      
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minWidth: '320px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Card with Glassmorphism */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          {/* Decorative Top Border */}
          <div style={{
            height: '5px',
            background: 'linear-gradient(90deg, #e6b980 0%, #eacda3 100%)',
            width: '100%'
          }}></div>
          
          <div style={{
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(230, 185, 128, 0.3)'
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '36px',
                  color: '#fff'
                }}>
                  person
                </span>
              </div>
              <h3 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#2c2c2c',
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px'
              }}>Најава</h3>
              <p style={{
                fontSize: '15px',
                color: '#666',
                margin: 0
              }}>Добредојдовте назад</p>
            </div>
            
            {/* Error Message */}
            {message && (
              <div style={{
                background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
                color: '#c33',
                padding: '14px 18px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #fcc',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideDown 0.3s ease'
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '20px'
                }}>
                  error
                </span>
                <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
              </div>
            )}
            
            <form onSubmit={onSubmit} style={{ width: '100%' }}>
              {/* Email Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px',
                  marginLeft: '4px'
                }}>
                  Е-пошта
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span className="material-symbols-outlined login-icon-email" style={{
                    position: 'absolute',
                    left: '16px',
                    fontSize: '20px',
                    color: '#999',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    email
                  </span>
                  <input 
                    ref={emailRef} 
                    type="email" 
                    className="form-control login-input-email" 
                    placeholder="ваша Е-Пошта"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      fontSize: '15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      boxSizing: 'border-box',
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#e6b980'
                      e.target.style.boxShadow = '0 0 0 4px rgba(230, 185, 128, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              {renderFieldError('email')}
              </div>
              
              {/* Password Input */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px',
                  marginLeft: '4px'
                }}>
                  Лозинка
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span className="material-symbols-outlined login-icon-lock" style={{
                    position: 'absolute',
                    left: '16px',
                    fontSize: '20px',
                    color: '#999',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    lock
                  </span>
                  <input 
                    ref={passwordRef} 
                    type="password" 
                    className="form-control login-input-password" 
                    placeholder="Внесете ја вашата лозинка"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      fontSize: '15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      boxSizing: 'border-box',
                      background: '#fff',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#e6b980'
                      e.target.style.boxShadow = '0 0 0 4px rgba(230, 185, 128, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                {renderFieldError('password')}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: isLoading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #e6b980 0%, #eacda3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isLoading 
                    ? 'none' 
                    : '0 4px 15px rgba(230, 185, 128, 0.4)',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
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
                onMouseDown={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {isLoading ? 'Вчитување...' : 'Најава'}
              </button>
              
              {/* Signup Link */}
              <div style={{ 
                textAlign: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #eee'
              }}>
                <p style={{ 
                  margin: 0,
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Не сте регистрирани?{' '}
                  <Link 
                    to="/signup" 
                    style={{ 
                      color: '#e6b980', 
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#d8b086'}
                    onMouseLeave={(e) => e.target.style.color = '#e6b980'}
                  >
                    Создади нов акаунт
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
