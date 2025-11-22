// src/components/MessageList.js
import React, { useEffect, useState } from 'react';
import axiosClient from "../axios-client.js";
import { ChatItem } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css'
import {Link} from "react-router-dom";
const MessageList = ({ userId, recipientId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosClient.get(`/messages/${userId}/${recipientId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, recipientId]);

  return (
    <div className='full-width'>
      <h2>Messages</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.sender.username}:</strong> {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
