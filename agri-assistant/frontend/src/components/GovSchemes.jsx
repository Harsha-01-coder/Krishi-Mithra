import React, { useState } from 'react';
import { schemes, categories } from '../data/schemesData'; // Adjust path if needed
import './GovSchemes.css';

function GovSchemes() {
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter the schemes based on the active category
  const filteredSchemes = activeCategory === 'All'
    ? schemes
    : schemes.filter(scheme => scheme.category === activeCategory);

  return (
    <div className="schemes-container">
      <h2>Government Schemes for Farmers</h2>
      <p>Explore available schemes and subsidies</p>

      {/* Filter Bar */}
      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Schemes List */}
      <div className="schemes-list">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="scheme-card">
            <div className="card-header">
              <h3>{scheme.title}</h3>
              <span className="scheme-category">{scheme.category}</span>
            </div>
            
            <div className="scheme-section">
              <h4>Description:</h4>
              <p>{scheme.description}</p>
            </div>
            
            <div className="scheme-section">
              <h4>Eligibility:</h4>
              <p>{scheme.eligibility}</p>
            </div>
            
            <div className="scheme-section">
              <h4>Benefits:</h4>
              <p>{scheme.benefits}</p>
            </div>

            <div className="scheme-section">
              <h4>How to Apply:</h4>
              <p>{scheme.howToApply}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GovSchemes;