import React, { useEffect } from 'react';
import { Users, Target, Eye } from 'lucide-react';
import './About.css';

/* --- Helper: Section Component --- */
const Section = ({ id, title, subtitle, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <section
      id={id}
      className={`py-20 px-4 md:px-8 opacity-0 transform translate-y-10 transition-all duration-700 ease-out ${className}`}
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
            <p className="text-lg md:text-xl text-gray-600 mt-4">
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
};

/* --- Helper: Team Member Card --- */
const TeamMemberCard = ({ name, title, imageUrl }) => (
  <div className="bg-white text-center rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2">
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-56 object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/400x400/e2e8f0/64748b?text=${name
          .split(' ')
          .map((n) => n[0])
          .join('')}`;
      }}
    />
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-gray-900">{name}</h3>
      <p className="text-green-700 font-medium">{title}</p>
    </div>
  </div>
);

/* --- Main About Page --- */
function About() {
  // 🌱 Scroll animation for sections
  useEffect(() => {
    const sections = document.querySelectorAll("section");
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
    <div className="bg-gray-50 relative overflow-hidden">
      {/* 🌾 Hero Section */}
      <header className="bg-green-700 text-white py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold">About Krishi Mithra</h1>
          <p className="text-xl md:text-2xl mt-4">
            Blending technology with tradition for a sustainable farming future.
          </p>
        </div>
      </header>

      {/* 🌱 Mission Section */}
      <Section id="mission" title="Our Mission" icon={Target} className="bg-white">
        <div className="max-w-4xl mx-auto text-center text-lg text-gray-700 space-y-6">
          <p>
            Krishi Mithra was founded with a simple, powerful mission: to bring the power of
            artificial intelligence and data science to every farmer, large or small. We believe that
            by providing accessible, easy-to-use tools, we can help build a more sustainable,
            profitable, and resilient future for agriculture.
          </p>
          <p>
            We are dedicated to solving the real-world challenges farmers face daily. From unpredictable weather
            and soil health management to navigating complex government schemes, our platform serves as a trusted
            partner—a "Krishi Mithra," or "Farmer's Friend."
          </p>
        </div>
      </Section>

      {/* 🌾 Vision Section */}
      <Section id="vision" title="Our Vision" icon={Eye} className="bg-gray-50">
        <div className="max-w-4xl mx-auto text-center text-lg text-gray-700 space-y-6">
          <p>
            We envision a world where technology and tradition work hand-in-hand. Where data-driven insights
            empower farmers to maximize their yields while minimizing their environmental footprint.
            We aim to be the leading digital platform that connects farmers to the knowledge,
            resources, and support they need to thrive in a changing world.
          </p>
        </div>
      </Section>

      {/* 👨‍🌾 Team Section */}
      <Section
        id="team"
        title="Meet Our Team"
        subtitle="The mind behind Krishi Mithra"
        icon={Users}
        className="bg-white"
      >
        <div className="flex justify-center">
          <TeamMemberCard
            name="Harsha C"
            title="Lead Developer"
            imageUrl=""
          />
        </div>
      </Section>

      {/* 🍃 Floating Leaves */}
      <div className="leaf"></div>
      <div className="leaf"></div>
      <div className="leaf"></div>
    </div>
  );
}

export default About;
