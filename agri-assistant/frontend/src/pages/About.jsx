import React, { useEffect } from "react";
import { Users, Target, Eye } from "lucide-react";
import "./About.css";

/* --- Section Component --- */
const Section = ({ id, title, subtitle, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <section
      id={id}
      className={`about-section ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {IconComponent && (
            <IconComponent
              className="w-16 h-16 mx-auto mb-4 text-green-700"
              strokeWidth={1.5}
            />
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 mt-4">{subtitle}</p>
          )}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
};

/* --- Team Member Card --- */
const TeamMemberCard = ({ name, title, imageUrl }) => (
  <div className="about-team-card">
    <img
      src={imageUrl}
      alt={name}
      className="about-team-img"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/400x400/e2e8f0/64748b?text=${name
          .split(" ")
          .map((n) => n[0])
          .join("")}`;
      }}
    />
    <div className="p-6">
      <h3>{name}</h3>
      <p>{title}</p>
    </div>
  </div>
);

function About() {
  // Scroll animations scoped only to About page
  useEffect(() => {
    const sections = document.querySelectorAll(".about-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <header className="about-hero">
        <div className="max-w-4xl mx-auto px-4">
          <h1>About Krishi Mithra</h1>
          <p>
            Blending technology with tradition for a sustainable farming future.
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <Section id="mission" title="Our Mission" icon={Target}>
        <div className="about-content">
          <p>
            Krishi Mithra was founded with a simple, powerful mission: to bring
            the power of artificial intelligence and data science to every
            farmer, large or small.
          </p>
          <p>
            We are dedicated to solving the real-world challenges farmers face
            daily — from unpredictable weather and soil health management to
            navigating complex government schemes.
          </p>
        </div>
      </Section>

      {/* Vision Section */}
      <Section id="vision" title="Our Vision" icon={Eye}>
        <div className="about-content">
          <p>
            We envision a world where technology and tradition work hand in
            hand, empowering farmers to maximize yields while minimizing
            environmental impact.
          </p>
        </div>
      </Section>

      {/* Team Section */}
      <Section
        id="team"
        title="Meet Our Team"
        subtitle="The mind behind Krishi Mithra"
        icon={Users}
      >
        <div className="about-team">
          <TeamMemberCard
            name="Harsha C"
            title="Lead Developer"
            imageUrl=""
          />
        </div>
      </Section>

      {/* Floating leaves (optional aesthetic) */}
      <div className="leaf"></div>
      <div className="leaf"></div>
      <div className="leaf"></div>
    </div>
  );
}

export default About;
