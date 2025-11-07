import {createBrowserRouter, Navigate} from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Users from "./views/Users";
import UserForm from "./views/UserForm";
import Tabs from "./components/Tabs.jsx";
import SwipeCards from "./components/SwipeCards.jsx";
import Chat from "./components/Chat.jsx";
import UserDetails from "./components/UserDetails.jsx";
import DialogUser  from "./components/MatchDialog.jsx";
import WebSocketTest from "./components/WebSocketTest.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/cards" replace />
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/users',
        element: <Users/>
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />
      },
      {
        path: '/users/:id',
        element: <UserForm key="userUpdate" />
      },
      {
        path: '/tabs',
        element: <Tabs/>
      },
      {
        path: '/cards',
        element: <SwipeCards/>
      },
      {
        path: '/chat/:chatId',
        element: <Chat/>
      },
      {
        path:'/user-details',
        element:<UserDetails/>
      },
      {
        path:'/dialog',
        element:<DialogUser/>
      },


    ]
  },
  {
    path: '/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signup',
        element: <Signup/>
      },
      {
        path: '/websocket-test',
        element: <WebSocketTest/>
      },
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

export default router;
