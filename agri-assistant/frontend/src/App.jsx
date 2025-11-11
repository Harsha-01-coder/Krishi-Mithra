import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// --- Context ---
import { AuthProvider } from "./context/AuthContext";

// --- Layout ---
import Layout from "./components/Layout";

// --- Pages (Located in src/pages/) ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditPost from "./pages/EditPost";
import Forum from "./pages/Forum";
import ChatbotFull from "./pages/ChatbotFull";
import PostDetail from "./pages/PostDetail";
import NewPost from "./pages/NewPost";

// --- Tool Pages (Assuming most are still in /components, as per your file) ---
import Weather from "./components/Weather";
import SoilFertility from "./components/SoilFertility";
import MarketPrices from "./components/MarketPrices";
import GovSchemes from "./components/GovSchemes";
import CropRecommender from "./components/CropRecommender";

// --- CORRECTED PATHS for new/upgraded pages ---
import PestId from "./components/PestId";
import FertilizerCalculator from "./components/FertilizerCalculator";

// --- NEW MARKETPLACE & ADMIN PAGES ---
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./components/ProductCard"; // This is the page for a single product
import AddProduct from "./pages/AddProduct"; // The admin page

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* --- Home Page --- */}
            <Route index element={<Home />} />

            {/* --- Auth & Profile Routes --- */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />

            {/* --- Static Pages --- */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* --- Forum Routes --- */}
            <Route path="forum" element={<Forum />} />
            <Route path="forum/new-post" element={<NewPost />} />
            <Route path="forum/post/:postId" element={<PostDetail />} />
            <Route path="forum/edit-post/:id" element={<EditPost />} />

            {/* --- AI & Data Tools --- */}
            <Route path="chatbot" element={<ChatbotFull />} />
            <Route path="weather" element={<Weather />} />
            <Route path="soil" element={<SoilFertility />} />
            <Route path="pest" element={<PestId />} />
            <Route path="prices" element={<MarketPrices />} />
            <Route path="schemes" element={<GovSchemes />} />
            <Route path="crop" element={<CropRecommender />} />
            <Route path="calculator" element={<FertilizerCalculator />} />

            {/* --- NEW MARKETPLACE ROUTES --- */}
            <Route path="marketplace" element={<Marketplace />} />
            
            {/* --- CORRECTED ROUTE: Use ProductDetail component --- */}
            <Route path="products/:productId" element={<ProductDetail />} />
            
            {/* --- NEW ADMIN ROUTE --- */}
            <Route path="admin/add-product" element={<AddProduct />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;