import React, {useEffect, useRef, useState} from 'react';
import { Button, Input } from 'react-chat-elements';
import { useParams } from 'react-router-dom';
import '../../public/resources/css/Chat.css';
import AxiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider";
import createEcho from '../services/echo';
import { Hearts } from 'react-loader-spinner';

const ChatApp = () => {
  const { chatId } = useParams();
  const { user, token } = useStateContext();
  const inputReference = useRef();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const inputClearRef = useRef(null);

  // Helper function to parse timestamp to Date object
  const parseTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    // If it's already a Date object, return it
    if (timestamp instanceof Date) return timestamp;
    // If it's a string like '2025-11-04 17:34:58', parse it correctly
    if (typeof timestamp === 'string') {
      // Replace space with 'T' to make it ISO format, or use the timestamp as-is
      // Laravel timestamps are usually in format 'Y-m-d H:i:s'
      const dateStr = timestamp.replace(' ', 'T');
      return new Date(dateStr);
    }
    return new Date(timestamp);
  };

  // Helper function to format messages for react-chat-elements
  // react-chat-elements expects specific structure for different message types
  const formatMessageForLibrary = (msg) => {
    // Ensure basic message structure
    if (!msg || typeof msg !== 'object') {
      return null;
    }

    // If message is already formatted, return as-is
    if (msg.type === 'system') {
      return msg;
    }
    if (msg.type === 'photo' && msg.data && msg.data.uri) {
      // Already a properly formatted photo message
      return msg;
    }
    if (msg.type === 'file' && msg.file && msg.file.url) {
      // Already a properly formatted file message
      return msg;
    }
    if (msg.type === 'text' && msg.text !== undefined && !msg.is_file) {
      // Already a properly formatted text message
      return msg;
    }

    // Check if this is a system message
    const isCenterMessage = msg.is_system === true || msg.is_system === 1;
    const isCurrentUser = parseInt(msg.user_id) === parseInt(user?.id);
    const messageContent = msg.text || msg.content || '';
    
    const position = isCenterMessage ? 'center' : (isCurrentUser ? 'right' : 'left');
    let date = msg.date;
    if (!date || !(date instanceof Date)) {
      date = parseTimestamp(msg.sent_at || msg.created_at || msg.date);
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const dateString = `${hours}:${minutes}:${seconds}`;
    const title = isCurrentUser 
      ? (user?.name || 'You') 
      : (msg.sender_name || recipient?.name || 'User');

    if (msg.type === 'file' || msg.is_file === true || msg.is_file === 1) {
      const fileUrl = msg.file?.url || msg.file_url || '#';
      const fileName = msg.file?.name || msg.text || msg.content || 'File';
      const fileType = msg.file?.type || 'image/jpeg';
      const fileSize = typeof msg.file?.size === 'number' ? msg.file.size : 0;

      // Check if it's an image based on file type or extension
      const isImage = fileType.startsWith('image/') || 
                     /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);


      if (isImage) {
        const photoMessage = {
          id: String(msg.id || Math.random()), // Ensure every message has a unique ID
          position,
          type: 'photo',
          title,
          date,
          dateString,
          data: {
            uri: fileUrl,
            alt: fileName || 'Image'
          },
          user_id: msg.user_id
        };
        
        if (msg.text && msg.text.trim()) {
          photoMessage.text = msg.text;
        }
        
        return photoMessage;
      } else {
        return {
          id: String(msg.id || Math.random()), // Ensure every message has a unique ID
          position,
          type: 'file',
          title,
          text: fileName,
          date,
          dateString,
          file: {
            name: fileName,
            size: fileSize,
            type: fileType,
            url: fileUrl
          },
          user_id: msg.user_id
        };
      }
    }

    // Text messages
    let messageText = messageContent;
    
    // If it's a center message, keep the original format with \n for line breaks
    // The useEffect will handle converting \n to <br> and URLs to clickable links
    if (isCenterMessage) {
      // Just ensure the format is correct - keep \n for line breaks
      // The link conversion useEffect will handle making it clickable
      messageText = messageContent; // Keep original format with \n
    }
    
    if (isCenterMessage) {
    return {
        type: 'system',
        id: String(msg.id || Math.random()),
        position: 'center',
        text: messageText,
        content: messageContent,
        title: '',
        date,
        dateString
      };
    }
    
    const textMessage = {
      id: String(msg.id || Math.random()), // Ensure every message has a unique ID
      position,
      type: 'text',
      title,
      text: messageText,
      date,
      dateString, // Add dateString for custom formatting if needed
      user_id: msg.user_id
    };
    
    return textMessage;
  };
  const [chatInfo, setChatInfo] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [echo, setEcho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputKey, setInputKey] = useState(0);
  const messageListRef = useRef();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    // Use multiple timeouts to ensure DOM is fully updated
    const timer1 = setTimeout(() => scrollToBottom(), 50);
    const timer2 = setTimeout(() => scrollToBottom(), 150);
    const timer3 = setTimeout(() => scrollToBottom(), 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [messages]);

  


  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.options-menu')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);


  useEffect(() => {
    // Only load chat data if user is available
    if (user && user.id) {
      setLoading(true); // Set loading to true when chatId changes
      loadChatInfo();
      loadChatHistory();
      setupEchoConnection();
    }

    return () => {
      // Cleanup echo connection when component unmounts or chatId changes
      if (echo) {
        echo.disconnect();
      }
    };
  }, [chatId, token, user]);

  // Custom click handler for images - attach event listeners to image elements
  useEffect(() => {
    const handleImageClick = (event) => {
      // Check if clicked element is an image or inside an image container
      const target = event.target;
      
      // Check if it's an image element
      if (target.tagName === 'IMG') {
        const src = target.src || target.getAttribute('src');
        // Only open images from messages, not profile pictures
        if (src && !src.includes('profile_picture') && src.includes('messages')) {
          event.preventDefault();
          event.stopPropagation();
          setSelectedImage(src);
          return;
        }
      }
      
      // Also check if clicked inside a photo message container
      const photoContainer = target.closest('.rce-mbox-photo, .rce-mbox-photo--img');
      if (photoContainer) {
        const img = photoContainer.querySelector('img');
        if (img) {
          const src = img.src || img.getAttribute('src');
          if (src && !src.includes('profile_picture') && src.includes('messages')) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedImage(src);
          }
        }
      }
    };

    // Add click listener to the message list container
    const messageListContainer = messageListRef.current;
    if (messageListContainer) {
      messageListContainer.addEventListener('click', handleImageClick);
      
      return () => {
        messageListContainer.removeEventListener('click', handleImageClick);
      };
    }
  }, [messages]);

  const loadChatInfo = async () => {
    try {
      const response = await AxiosClient.get(`/chats/${chatId}`);
      setChatInfo(response.data);
      console.log('Chat info:', response.data);
      const otherUser = response.data.user1.id === user.id 
        ? response.data.user2 
        : response.data.user1;
      setRecipient(otherUser);
      console.log('Other user:', otherUser);
    } catch (error) {
      console.error('Error loading chat info:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosClient.get(`/chats/${chatId}/messages`);
      const formattedMessages = response.data.map(msg => {
        const isCurrentUser = parseInt(msg.user_id) === parseInt(user.id);
        const date = parseTimestamp(msg.sent_at || msg.created_at);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        // Store raw message data - formatMessageForLibrary will format it in render
        return {
          id: msg.id, // Preserve message ID from database
          user_id: msg.user_id,
          sent_at: msg.sent_at || msg.created_at,
          created_at: msg.created_at,
          content: msg.content,
          is_file: msg.is_file,
          is_system: msg.is_system || false,
          file_url: msg.file_url,
          // Add file info if available
          file: msg.file_url ? {
            name: msg.content || 'File',
            url: msg.file_url.startsWith('http') 
              ? msg.file_url 
              : msg.file_url.startsWith('/storage/')
              ? `http://localhost:8000${msg.file_url}`
              : `http://localhost:8000/storage/${msg.file_url}`,
            // Detect file type from file extension
            type: (() => {
              const fileName = msg.content || 'File';
              const ext = fileName.split('.').pop()?.toLowerCase();
              if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
              }
              return msg.file?.type || 'image/jpeg';
            })(),
            size: msg.file?.size || 0
          } : null,
          date: date
        };
      });
      setMessages(formattedMessages);
      setLoading(false);
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setLoading(false);
    }
  };

  const setupEchoConnection = () => {
    // Disconnect existing echo instance if it exists
    if (echo) {
      echo.disconnect();
    }
    
    // Create Echo instance with the user's token
    const newEcho = createEcho(token);
    setEcho(newEcho);
    
    // Listen for notifications on the user's private channel
    newEcho.private(`App.Models.User.${user.id}`)
      .notification((notification) => {
        if (notification.type === 'App\\Notifications\\NewChatMessage' && parseInt(notification.message.chat_id) === parseInt(chatId)) {
          const isCurrentUser = parseInt(notification.message.user_id) === parseInt(user.id);
          
          // If chat ID matches, add the message (regardless of sender - positioning handles it)
          setMessages(prev => {
            // Check if this message is already in the list (to avoid duplicates)
            const messageExists = prev.some(msg => 
              msg.text === notification.message.content && 
              msg.user_id === notification.message.user_id
            );
            
            if (!messageExists) {
              const date = parseTimestamp(notification.message.created_at);
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const seconds = String(date.getSeconds()).padStart(2, '0');
              const timeString = `${hours}:${minutes}:${seconds}`;
              
              // Format message for react-chat-elements
              const notificationMsg = {
                id: notification.message.id, // Preserve message ID
                user_id: notification.message.user_id,
                sent_at: notification.message.sent_at || notification.message.created_at,
                created_at: notification.message.created_at,
                content: notification.message.content,
                is_file: notification.message.is_file,
                is_system: notification.message.is_system || false,
                file_url: notification.message.file_url,
                // Include sender name from notification if available
                sender_name: notification.sender?.name || null,
                file: notification.message.file_url ? {
                  name: notification.message.content || 'File',
                  url: notification.message.file_url.startsWith('http')
                    ? notification.message.file_url
                    : notification.message.file_url.startsWith('/storage/')
                    ? `http://localhost:8000${notification.message.file_url}`
                    : `http://localhost:8000/storage/${notification.message.file_url}`,
                  // Detect file type from file extension
                  type: (() => {
                    const fileName = notification.message.content || 'File';
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                    }
                    return 'image/jpeg';
                  })(),
                  size: 0
                } : null,
                date: date
              };
              
              const formattedMessage = formatMessageForLibrary(notificationMsg);
              
              const newMessages = [...prev, formattedMessage];
              // Scroll to bottom after adding new message
              setTimeout(() => {
                scrollToBottom();
              }, 100);
              return newMessages;
            }
            return prev;
          });
        }
      });
  };


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Store the file in state instead of adding to messages immediately
      setAttachedFile({
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type
      });
      // Close the options menu after file selection
      setShowOptions(false);
      // Clear the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachedFile = () => {
    if (attachedFile && attachedFile.preview) {
      URL.revokeObjectURL(attachedFile.preview);
    }
    setAttachedFile(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    // Allow sending if there's text OR a file attached
    if (!inputValue.trim() && !attachedFile) return;

    const messageText = inputValue.trim();
    const fileToSend = attachedFile;
    
    // Clear input using the Input component's clear function
    if (inputClearRef.current) {
      inputClearRef.current();
    }
    
    // Clear input and attached file state
    setInputValue('');
    setAttachedFile(null);

    // Add message to frontend immediately (on the right side as current user)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Create message based on whether it's text, file, or both
    const tempMsgData = {
      user_id: user.id,
      content: messageText || fileToSend?.name || '',
      is_file: !!fileToSend,
      is_system: false,
      file_url: null,
      file: fileToSend ? {
        name: fileToSend.name,
        size: fileToSend.size,
        type: fileToSend.type,
        url: fileToSend.preview
      } : null,
      date: now,
      temp: true
    };
    
    const tempMessage = formatMessageForLibrary(tempMsgData);
    if (tempMessage) {
      tempMessage.temp = true;
    }
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Create FormData if there's a file, otherwise send JSON
      let response;
      if (fileToSend) {
        const formData = new FormData();
        if (messageText) {
          formData.append('message', messageText);
        }
        formData.append('file', fileToSend.file);
        
        // Don't set Content-Type header - let the browser set it with the correct boundary
        response = await AxiosClient.post(`/chats/${chatId}/messages`, formData);
      } else {
        response = await AxiosClient.post(`/chats/${chatId}/messages`, {
          message: messageText
        });
      }
      
      // Update the temporary message with server response
      setMessages(prev => prev.map(msg => {
        if (msg.temp && msg.user_id === user.id) {
          // Match by text or file name
          const matches = fileToSend 
            ? (msg.text === fileToSend.name || msg.data?.uri === fileToSend.preview || msg.file?.name === fileToSend.name)
            : (msg.text === messageText);
          
          if (matches && response.data) {
            // Re-format with server response
            const updatedMsg = {
              id: response.data.id, // Preserve server ID
              user_id: response.data.user_id,
              sent_at: response.data.sent_at || response.data.created_at,
              created_at: response.data.created_at,
              content: response.data.content,
              is_file: response.data.is_file,
              is_system: response.data.is_system || false,
              file_url: response.data.file_url,
              file: response.data.file_url ? {
                name: response.data.content || 'File',
                url: response.data.file_url.startsWith('http')
                  ? response.data.file_url
                  : response.data.file_url.startsWith('/storage/')
                  ? `http://localhost:8000${response.data.file_url}`
                  : `http://localhost:8000/storage/${response.data.file_url}`,
                type: 'image/jpeg',
                size: 0
              } : null,
              date: parseTimestamp(response.data.sent_at || response.data.created_at)
            };
            return formatMessageForLibrary(updatedMsg);
          }
        }
        return msg;
      }));
      
      // Revoke object URL if file was sent
      if (fileToSend && fileToSend.preview) {
        URL.revokeObjectURL(fileToSend.preview);
      }
      
      // Keep focus on input after sending
      setTimeout(() => {
        if (inputReference.current) {
          inputReference.current.focus();
        }
      }, 50);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message and restore input/file
      setMessages(prev => prev.filter(msg => {
        if (msg.temp && msg.user_id === user.id) {
          const matches = fileToSend 
            ? (msg.file?.name === fileToSend.name || msg.text === fileToSend.name)
            : (msg.text === messageText);
          return !matches;
        }
        return true;
      }));
      
      // Restore input and file
      setInputValue(messageText);
      if (fileToSend) {
        setAttachedFile(fileToSend);
      }
    }
  };

  if (loading || !recipient) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Hearts
          height="400"
          width="400"
          color="#ffe593"
          ariaLabel="hearts-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <>
      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            cursor: 'pointer'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              cursor: 'pointer'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="chat-container">
        <div className="chat-card">
          <div className="chat-header">
            <img 
              src={`http://localhost:8000/storage/${recipient.profile_picture}`}
              alt={recipient.name} 
              className="profile-picture"
            />
            <span className="profile-name">{recipient.name}</span>
          </div>
        <div ref={messageListRef} className="custom-message-list">
          {messages
            .map(formatMessageForLibrary)
            .filter(msg => msg !== null)
            .map((msg) => {
              const isSystem = msg.type === 'system' || msg.is_system === true || msg.is_system === 1;
              const isCurrentUser = parseInt(msg.user_id) === parseInt(user?.id);
              
              // Format time
              const formatTime = (date) => {
            if (!date) return '';
            try {
              const d = date instanceof Date ? date : new Date(date);
                  if (isNaN(d.getTime())) return '';
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              const seconds = String(d.getSeconds()).padStart(2, '0');
              return `${hours}:${minutes}:${seconds}`;
            } catch (error) {
              return '';
            }
              };

              // System message
              if (isSystem) {
                const content = msg.content || msg.text || '';
                // Convert \n to line breaks and URLs to links
                const processSystemMessage = (text) => {
                  if (!text) return '';
                  let processed = text.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
                  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
                  processed = processed.replace(urlRegex, (url) => {
                    const cleanUrl = url.replace(/[.,;!?]+$/, '');
                    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="system-link">${cleanUrl}</a>`;
                  });
                  return processed;
                };

                return (
                  <div key={msg.id} className="message-wrapper message-wrapper--system">
                    <div className="message message--system">
                      <div 
                        className="message__content message__content--system"
                        dangerouslySetInnerHTML={{ __html: processSystemMessage(content) }}
        />
                      <div className="message__time">{formatTime(msg.date)}</div>
                    </div>
                  </div>
                );
              }

              // Photo message
              if (msg.type === 'photo' && msg.data?.uri) {
                return (
                  <div key={msg.id} className={`message-wrapper message-wrapper--${isCurrentUser ? 'right' : 'left'}`}>
                    <div className={`message message--${isCurrentUser ? 'right' : 'left'}`}>
                      {msg.text && <div className="message__text">{msg.text}</div>}
                      <div className="message__photo">
                        <img 
                          src={msg.data.uri} 
                          alt={msg.data.alt || 'Image'} 
                          onClick={() => setSelectedImage(msg.data.uri)}
                        />
                      </div>
                      <div className="message__time">{formatTime(msg.date)}</div>
                    </div>
                  </div>
                );
              }

              // File message
              if (msg.type === 'file' && msg.file?.url) {
                return (
                  <div key={msg.id} className={`message-wrapper message-wrapper--${isCurrentUser ? 'right' : 'left'}`}>
                    <div className={`message message--${isCurrentUser ? 'right' : 'left'}`}>
                      <div className="message__file">
                        <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                          📎 {msg.file.name || 'File'}
                        </a>
                      </div>
                      <div className="message__time">{formatTime(msg.date)}</div>
                    </div>
                  </div>
                );
              }

              // Text message
              return (
                <div key={msg.id} className={`message-wrapper message-wrapper--${isCurrentUser ? 'right' : 'left'}`}>
                  <div className={`message message--${isCurrentUser ? 'right' : 'left'}`}>
                    <div className="message__text">{msg.text || msg.content || ''}</div>
                    <div className="message__time">{formatTime(msg.date)}</div>
                  </div>
                </div>
              );
            })}
        </div>
        
        <div className="input-container" style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          position: 'relative'
        }}>
          {/* Options Menu */}
          <div className="options-menu" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                color: '#6c757d',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ⋮
            </button>
            
            {showOptions && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '150px',
                padding: '8px 0'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#495057',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📎 Прикачи датотека
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* File Preview */}
            {attachedFile && (
              <div style={{
                marginBottom: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {attachedFile.type.startsWith('image/') && (
                  <img 
                    src={attachedFile.preview} 
                    alt="Preview" 
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#495057',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {attachedFile.name}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6c757d',
                    marginTop: '2px'
                  }}>
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={removeAttachedFile}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e9ecef';
                    e.target.style.color = '#dc3545';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6c757d';
                  }}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
            <Input
              key={inputKey}
              referance={inputReference}
              placeholder={attachedFile ? 'Додај текст...' : 'Внеси порака...'}
              multiline={true}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              clear={clear => (inputClearRef.current = clear)}
              style={{
                borderRadius: '20px',
                border: '1px solid #e9ecef',
                padding: '12px 16px',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {/* Send Button */}
          <Button 
            className={'no-margin-top send-button'} 
            color='white' 
            backgroundColor={(inputValue.trim() || attachedFile) ? '#e6b980' : '#d4a574'}
            text='Испрати' 
            onClick={sendMessage}
            disabled={!inputValue.trim() && !attachedFile}
            style={{
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: (inputValue.trim() || attachedFile) ? '0 4px 12px rgba(230, 185, 128, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: (inputValue.trim() || attachedFile) ? 'pointer' : 'not-allowed',
              opacity: (inputValue.trim() || attachedFile) ? 1 : 0.6,
              minWidth: '100px'
            }}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default ChatApp;

