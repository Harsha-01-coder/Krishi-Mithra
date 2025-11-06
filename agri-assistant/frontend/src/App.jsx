import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"; // Assumes App.css is in src/

// --- Layout ---
import Layout from "./components/Layout";

// --- Pages (Located in src/pages/) ---
import Home from "./pages/Home"; 
import Login from "./pages/Login"; 
import Signup from "./pages/Signup"; 
import About from "./pages/About"; 
import Contact from "./pages/Contact"; 
import Dashboard from './pages/Dashboard'; 
import Profile from './pages/Profile'; 
import EditPost from './pages/EditPost'; 
import Forum from './pages/Forum'; 
import PostPage from './pages/PostPage'; 
import CreatePost from './pages/CreatePost'; 
import ChatbotFull from "./pages/ChatbotFull"; 

// --- Components/Tools (Located in src/components/) ---
import Weather from "./components/Weather";
import SoilFertility from "./components/SoilFertility";
import PestId from "./components/PestId";
import MarketPrices from "./components/MarketPrices";
import GovSchemes from './components/GovSchemes';
import CropRecommender from "./components/CropRecommender";
import FertilizerCalculator from './components/FertilizerCalculator';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* User Auth/Profile Routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          {/* Static Pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} /> 

          {/* Forum Routes */}
          <Route path="forum" element={<Forum />} />
          <Route path="forum/post/:id" element={<PostPage />} />
          <Route path="forum/new-post" element={<CreatePost />} />
          <Route path="edit-post/:id" element={<EditPost />} />
          
          {/* Tool Pages (Features) */}
          <Route path="chatbot" element={<ChatbotFull />} /> 
          <Route path="weather" element={<Weather />} />
          <Route path="soil" element={<SoilFertility/>}/>
          <Route path="pest" element={<PestId />} />
          <Route path="prices" element={<MarketPrices />} />
          <Route path="schemes" element={<GovSchemes />} />
          <Route path="crop" element={<CropRecommender />} />
          <Route path="calculator" element={<FertilizerCalculator />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;