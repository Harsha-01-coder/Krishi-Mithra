import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Assuming you have a Navbar
import Footer from './Footer'; // Assuming you have a Footer

// Make sure to import your main CSS file if it's not in App.js
// import '../App.css'; 

function Layout() {
  return (
    // 1. This is your .page-container
    <div className="page-container">

      {/* 2. This is your .content-wrap */}
      <div className="content-wrap">
      
        <Navbar />
        
        {/* 3. <Outlet /> renders the active page (Home, Login, etc.) */}
        <main>
          <Outlet /> 
        </main>
        
      </div>
      
      {/* 4. The Footer is *outside* the content-wrap */}
      <Footer />
      
    </div>
  );
}

export default Layout;