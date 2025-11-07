import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Set up Pusher for Laravel Echo
window.Pusher = Pusher;

// Create Echo instance factory function
const createEcho = (token) => {
    return new Echo({
        broadcaster: 'pusher',
        key: 'dummykey', // Match the key from your .env
        cluster: 'mt1', // Add the cluster configuration
        wsHost: window.location.hostname,
        wsPort: 6001,
        forceTLS: false,
        disableStats: true,
        authEndpoint: 'http://localhost:8000/broadcasting/auth',
        auth: {
            headers: {
                Authorization: `Bearer ${token || ''}`,
                Accept: 'application/json',
            },
        },
    });
};

export default createEcho;