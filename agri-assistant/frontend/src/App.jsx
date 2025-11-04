import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Weather from "./components/Weather";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SoilFertility from "./components/SoilFertility";
import PestId from "./components/PestId";
import MarketPrices from "./components/MarketPrices";
import GovSchemes from './components/GovSchemes';
import CropRecommender from "./components/CropRecommender"; 
import FertilizerCalculator from './components/FertilizerCalculator';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* Other pages */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="weather" element={<Weather />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} /> 
          <Route path="soil" element={<SoilFertility/>}/>
          <Route path="pest" element={<PestId />} />
          <Route path="prices" element={<MarketPrices />} />
          <Route path="schemes" element={<GovSchemes />} />
          <Route path="crop" element={<CropRecommender />} />
          
          {/* --- ADDED THIS ROUTE --- */}
          <Route path="calculator" element={<FertilizerCalculator />} />
          <Route path="dashboard" element={<Dashboard />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;