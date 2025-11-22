import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function WebSocketTest() {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [messages, setMessages] = useState([]);
  const [echoInstance, setEchoInstance] = useState(null);

  useEffect(() => {
    // Initialize Echo
    window.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: 'pusher',
      key: 'ce68b287bd7980a297d5',
      wsHost: window.location.hostname,
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });

    setEchoInstance(echo);

    // Listen to the public test-channel
    const channel = echo.channel('test-channel');

    channel.listen('.App\\Events\\TestBroadcast', (data) => {
      console.log('✅ Received broadcast:', data);
      addMessage(`Received TestBroadcast with power: ${data.power}`);
      setConnectionStatus('✅ Connected & Receiving Events');
    });

    // Check Pusher connection state
    if (echo.connector.pusher) {
      echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket Connected!');
        setConnectionStatus('✅ Connected to WebSocket Server');
        addMessage('Successfully connected to WebSocket server on port 6001');
      });

      echo.connector.pusher.connection.bind('error', (err) => {
        console.error('❌ WebSocket Error:', err);
        setConnectionStatus('❌ Connection Error');
        addMessage(`Error: ${err.error?.data?.message || 'Connection failed'}`);
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('⚠️ WebSocket Disconnected');
        setConnectionStatus('⚠️ Disconnected');
        addMessage('Disconnected from WebSocket server');
      });
    }

    return () => {
      channel.stopListening('.App\\Events\\TestBroadcast');
      echo.disconnect();
    };
  }, []);

  const addMessage = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { time: timestamp, text: msg }]);
  };

  const sendTestEvent = () => {
    addMessage('Triggering test broadcast from backend...');
    // This would normally call your API endpoint
    fetch('http://localhost:8000/api/broadcast-test')
      .then(() => addMessage('Test event triggered!'))
      .catch((err) => addMessage(`Error triggering event: ${err.message}`));
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#8b4513', borderBottom: '3px solid #ffe593', paddingBottom: '10px' }}>
        🔌 WebSocket Connection Test
      </h1>
      
      <div style={{ 
        backgroundColor: connectionStatus.includes('✅') ? '#d4edda' : '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '2px solid ' + (connectionStatus.includes('✅') ? '#28a745' : '#ffc107')
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
          Connection Status: <span style={{ fontWeight: 'bold' }}>{connectionStatus}</span>
        </h2>
        <p style={{ margin: '5px 0' }}>
          <strong>WebSocket Server:</strong> ws://{window.location.hostname}:6001
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>App Key:</strong> ce68b287bd7980a297d5
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Channel:</strong> test-channel
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Event:</strong> App\Events\TestBroadcast
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={sendTestEvent}
          style={{
            backgroundColor: '#8b4513',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📡 Trigger Test Broadcast
        </button>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Or run in terminal: <code style={{ backgroundColor: '#f4f4f4', padding: '4px 8px', borderRadius: '4px' }}>php artisan broadcast:test 123</code>
        </p>
      </div>

      <div style={{ 
        marginTop: '30px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Event Log:</h3>
        {messages.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Waiting for events...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ 
              padding: '10px',
              borderBottom: '1px solid #dee2e6',
              fontSize: '14px'
            }}>
              <span style={{ color: '#666', fontWeight: 'bold' }}>[{msg.time}]</span> {msg.text}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        borderLeft: '4px solid #0066cc'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>✅ Testing Checklist:</h3>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>WebSocket server is running on port 6001 ✓</li>
          <li>Check if "Connected to WebSocket Server" appears above</li>
          <li>Click "Trigger Test Broadcast" or run the artisan command</li>
          <li>Watch for events appearing in the log below</li>
        </ol>
      </div>
    </div>
  );
}

