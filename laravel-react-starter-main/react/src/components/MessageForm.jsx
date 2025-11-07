// src/components/MessageForm.js
import React, { useState } from 'react';
import axiosClient from "../axios-client.js";

const MessageForm = ({ userId, recipientId }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/messages/send', {
        sender_id: userId,
        receiver_id: recipientId,
        message,
      });
      setMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here"
            />
      <button type="submit">Send</button>
    </form>
  );
};

export default MessageForm;
