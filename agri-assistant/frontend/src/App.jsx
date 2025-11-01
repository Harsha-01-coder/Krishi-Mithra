import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 1. IMPORT YOUR APP.CSS FILE HERE
import "./App.css";

// Import your new Layout component
import Layout from "./components/Layout"; 

// Import your Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Weather from "./components/Weather"; // Note: This is likely a page, not a component
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap your pages inside the Layout route.
          All nested routes will now render inside the <Layout /> component's <Outlet />
        */}
        <Route path="/" element={<Layout />}>
          {/* The index route renders at the parent's path ("/") */}
          <Route index element={<Home />} />
          
          {/* Other pages */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="weather" element={<Weather />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;