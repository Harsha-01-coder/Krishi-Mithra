import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./Home.css";

 function Home() {
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true });

  const prices = [
    { crop: "Wheat", price: "₹22/kg" },
    { crop: "Rice", price: "₹30/kg" },
    { crop: "Maize", price: "₹18/kg" },
  ];

  const soil = {
    score: 88,
    crops: ["Paddy", "Banana"],
    note: "Moist, nitrogen-rich soil",
  };

  return (
    <div className="home-nature">
      {/* HERO SECTION */}
      <section className="hero-nature">
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1>Nature and Innovation in Perfect Harmony</h1>
          <p>
            Breathe life into farming with sunlight, soil, and smart technology.
          </p>
          <div className="hero-buttons">
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              className="btn-hero primary"
            >
              Explore
            </motion.a>
            <motion.a
              href="/chatbot"
              whileHover={{ scale: 1.05 }}
              className="btn-hero secondary"
            >
              Chat with AI
            </motion.a>
          </div>
        </motion.div>
        <div className="sunlight"></div>
      </section>

      {/* FEATURES SECTION */}
      <section ref={featuresRef} className="features-nature">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Rooted in Nature, Powered by Data
        </motion.h2>

        <div className="feature-cards">
          {[
            {
              title: "Weather Insights",
              desc: "Naturally-inspired intelligence helping farmers make sustainable decisions.",
              img: "https://thingsingoa.com/wp-content/uploads/2023/06/Goa-Weather-cover-1024x683.jpg",
            },
            {
              title: "Soil Fertility AI",
              desc: "AI-powered recommendations to enhance soil health and yield.",
              img: "https://tse2.mm.bing.net/th/id/OIP.o7Co5u3QmU-K4LFPed3zZAHaE8?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3",
            },
            {
              title: "Market Forecasts",
              desc: "Track live mandi trends and sell your produce at the best prices.",
              img: "https://img.freepik.com/premium-photo/market-forecast-projections_674594-33008.jpg",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              <div
                className="feature-img"
                style={{ backgroundImage: `url(${f.img})` }}
              ></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MARKET SECTION */}
      <section className="market-nature">
        <div className="market-overlay"></div>
        <motion.div
          className="market-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Live Market & Soil Insights</h2>
          <div className="market-grid">
            <div className="market-card">
              <h3>Market Prices</h3>
              {prices.map((p, i) => (
                <p key={i}>
                  {p.crop}: <strong>{p.price}</strong>
                </p>
              ))}
            </div>
            <div className="market-card">
              <h3>Soil Health</h3>
              <p>Score: {soil.score}</p>
              <p>Best Crops: {soil.crops.join(", ")}</p>
              <p className="note">{soil.note}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}


export default Home;
