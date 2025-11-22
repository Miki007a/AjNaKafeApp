import { Link, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { useEffect, useState } from "react";
import Card from "./Card.jsx";
import BasicTabs from "./Tabs.jsx";
import { Slider, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import createEcho from '../services/echo';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import MatchDialog from "./MatchDialog.jsx";
export default function DefaultLayout() {
  const { user, token, setUser, setToken, notification } = useStateContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientId, setRecipientId] = useState(null);
  const [distance, setDistance] = useState(50);
  const [matches, setMatches] = useState(null); // null means not loaded yet, [] means loaded but empty
  const [dialogData, setDialogData] = useState(null);
  const [refreshChatsTrigger, setRefreshChatsTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for user authentication
  if (!token) {
    return <Navigate to="/login" />
  }

  const handleDistanceChange = (event, newValue) => {
    setDistance(newValue);
  };


  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient.post('/logout')
      .then(() => {
        setUser({});
        setToken(null);
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state and redirect
        setUser({});
        setToken(null);
        navigate('/login');
      });
  };

  useEffect(() => {
    console.log('DefaultLayout useEffect running...');
    let echo = null;
    
    // Fetch user data
    axiosClient.get('/user')
      .then(({ data }) => {
        console.log('User data fetched:', data);
        setUser(data);

        axiosClient.get("/matches")
          .then(({ data }) => {
            setMatches(data); // This will be [] if no matches, or array of matches if there are any
          })
          .catch((error) => {
            console.error('Error fetching matches:', error);
            setMatches([]); // Set to empty array on error
          });
        
        console.log('echo initialization for user:', data.id);
        console.log('Token being used:', token);
        
        try {
          // Create Echo instance with the user's token
          echo = createEcho(token);
          console.log('Echo instance created successfully');
          
          // Subscribe to the user's private notification channel
          const channel = echo.private(`App.Models.User.${data.id}`);
          console.log('Subscribing to channel: App.Models.User.' + data.id);
          
          channel.notification((notification) => {
            console.log('Received notification:', notification);
            
            // Handle match notifications
            if (notification.type === 'App\\Notifications\\MatchFound') {
              console.log('Setting dialog data:', {
                message: notification.message,
                match: notification.match,
                otherUser: notification.otherUser
              });
              setDialogData({
                message: notification.message,
                match: notification.match,
                otherUser: notification.otherUser
              });
              
              // Refresh matches and chats lists
              refreshMatches();
              refreshChats();
            }
            
            // Handle chat message notifications
            if (notification.type === 'App\\Notifications\\NewChatMessage') {
              console.log('New chat message received, refreshing chat list');
              refreshChats();
            }
          });
          
          console.log('Echo initialized for user:', data.id);
        } catch (error) {
          console.error('Error creating Echo instance:', error);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });

    // Cleanup function to disconnect echo when component unmounts
    return () => {
      if (echo) {
        echo.disconnect();
      }
    };
  }, [token]); // Add token as dependency

  const handleRecipientChange = (newRecipientId) => {
    setRecipientId(newRecipientId);
  };

  const refreshMatches = async () => {
    try {
      const response = await axiosClient.get("/matches");
      setMatches(response.data);
      console.log('Matches refreshed:', response.data);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    }
  };

  const refreshChats = async () => {
    try {
      // Trigger refresh by updating the trigger state
      setRefreshChatsTrigger(prev => prev + 1);
      console.log('Chats refresh triggered');
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div id="defaultLayout">
      <ToastContainer />
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
      >
        <aside 
          className={`background-aside mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-menu-header">
            <IconButton 
              onClick={toggleMobileMenu}
              sx={{ color: '#8b4513', position: 'absolute', right: '10px', top: '10px' }}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <div className="card">
            <Card />
          </div>
          <div className="distance-meter my-3">
            <Typography id="distance-slider" gutterBottom sx={{
              color: '#8b4513',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              textAlign: 'center'
            }}>
              Постави растојание: {distance} км
            </Typography>
            <Slider
              value={distance}
              onChange={handleDistanceChange}
              aria-labelledby="distance-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
              sx={{
                color: '#ffe593',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#ffe593',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#ffe593',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#ffe593',
                }
              }}
            />
          </div>
          <div className='full-width'>
            <BasicTabs userId={user.id} recipientId={recipientId} matches={matches} refreshTrigger={refreshChatsTrigger}/>
          </div>
        </aside>
      </div>
      
      {/* Desktop Sidebar */}
      <aside className={'background-aside desktop-sidebar'}>
        <div className="card">
          <Card />
        </div>
        <div className="distance-meter my-3">
          <Typography id="distance-slider" gutterBottom sx={{
            color: '#8b4513',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
            letterSpacing: '0.5px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            Постави растојание: {distance} км
          </Typography>
          <Slider
            value={distance}
            onChange={handleDistanceChange}
            aria-labelledby="distance-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={100}
            sx={{
              color: '#ffe593',
              '& .MuiSlider-thumb': {
                backgroundColor: '#ffe593',
              },
              '& .MuiSlider-track': {
                backgroundColor: '#ffe593',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#ffe593',
              }
            }}
          />
        </div>
        <div className='full-width'>
          <BasicTabs userId={user.id} recipientId={recipientId} matches={matches} refreshTrigger={refreshChatsTrigger}/>
        </div>
      </aside>
      
      <div className="content" style={{
        backgroundImage: `url('/coffee-background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}>
        <header className={'header navbar navbar-expand-lg navbar-dark shadow-5-strong'}>
          <div className="header-left">
            <IconButton 
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              sx={{ color: '#f5deb3', display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Link className={'custom-button'} to={'/cards'}>ПРОНАЈДИ ПАРТНЕР</Link>
          </div>
          <div className={'href-style'}>
            <a onClick={onLogout} className="logout-button " href="#">Одјави се</a>
          </div>
        </header>
        <main className={"p-0"}>
        <MatchDialog match={dialogData}></MatchDialog>
          <Outlet context={{ distance }} />
        </main>
        {notification &&
          <div className="notification">
            {notification}
          </div>
        }
      </div>
    </div>
  );
}
