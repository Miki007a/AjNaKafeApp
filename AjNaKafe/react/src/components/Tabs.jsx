import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ChatList } from 'react-chat-elements';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'react-chat-elements/dist/main.css';
import '../../public/resources/css/tabs.css';
import { Hearts } from 'react-loader-spinner'; // Loader
import { useStateContext } from "../context/ContextProvider.jsx";
import AxiosClient from "../axios-client.js";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ userId, recipientId, matches, refreshTrigger }) {
  const { user } = useStateContext();
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [chats, setChats] = useState([]);


  // Update loading state when matches prop changes (refresh from parent)
  useEffect(() => {
    // If matches is null/undefined, it means not loaded yet
    // If matches is an array (even if empty), it means loaded
    if (matches !== null && matches !== undefined && Array.isArray(matches)) {
      setLoadingMatches(false);
    } else if (matches === null || matches === undefined) {
      // Still loading
      setLoadingMatches(true);
    }
  }, [matches]);

  useEffect(() => {
    loadChats();
  }, []);

  // Listen for refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadChats();
    }
  }, [refreshTrigger]);

  const loadChats = async () => {
    try {
      const response = await AxiosClient.get('/chats');
      const formattedChats = response.data.map(chat => {
        const otherUser = chat.user1.id === user.id ? chat.user2 : chat.user1;
        console.log(otherUser);
        return {
          id: chat.id,
          avatar: `http://localhost:8000/storage/${otherUser.profile_picture}`,
          alt: otherUser.name,
          title: otherUser.name,
          subtitle: chat.last_message?.content || 'Start a conversation!',
          date: chat.last_message?.created_at ? new Date(chat.last_message.created_at) : new Date(),
          unread: 0,
          userId: otherUser.id,
        };
      });
      setChats(formattedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setLoading(false);
    }
  };

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{width: '100%'}}>
      <Box x={{borderBottom: 1, borderColor: 'divider'}}>
        <div className="centered">
          <Tabs
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#ffe593',
              },
              '& .Mui-selected': {
                color: '#ffe593',
                borderColor: '#ffe593', // Custom text color for selected tab
              },
            }}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab className="btn draw-border" label="Совпаѓања" {...a11yProps(0)} />
            <Tab className="btn draw-border" label="Пораки" {...a11yProps(1)} />
          </Tabs>
        </div>
      </Box>

      {/* Matches Tab */}
      <CustomTabPanel value={value} index={0}>
        {loadingMatches ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            width: '100%'
          }}>
            <Hearts
              height="150"
              width="200"
              color="#f5deb3"
              ariaLabel="hearts-loading"
              visible={true}
            />
          </div>
        ) : (
          <div className="matches-container">
            {matches && Array.isArray(matches) && matches.length > 0 ? (
              matches.map((match) => {
                const usera = match.user1.id !== user.id ? match.user1 : match.user2;
                return (
                  <div className="card-match" key={match.id}>
                    <img
                      src={`http://localhost:8000/storage/${usera.profile_picture}`}
                      alt={usera.name}
                    />
                    <span className="name">{usera.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="card-match" style={{ margin: '0 auto' }}>
                <p>Нема совпаѓања</p>
              </div>
            )}
          </div>
        )}
      </CustomTabPanel>

      {/* Messages Tab */}
      <CustomTabPanel value={value} index={1}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            width: '100%'
          }}>
            <Hearts
              height="150"
              width="200"
              color="#f5deb3"
              ariaLabel="hearts-loading"
              visible={true}
            />
          </div>
        ) : (
          <ChatList
            className="chat-list"
            dataSource={chats}
            onClick={handleChatClick}
          />
        )}
      </CustomTabPanel>
    </Box>
  );
}
