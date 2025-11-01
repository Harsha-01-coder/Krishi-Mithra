import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

/* --- Helper: Section Component (re-created for this standalone file) --- */
const Section = ({ id, title, subtitle, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <section id={id} className={`py-20 px-4 md:px-8 ${className}`}>
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
        <div>
          {children}
        </div>
      </div>
    </section>
  );
};

/* --- Helper: Contact Info Card --- */
const InfoCard = ({ icon, title, children }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
        <IconComponent className="w-6 h-6 text-green-700" />
      </div>
      <div>
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
};

/* --- Main Contact Page Component --- */
function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Section
        id="contact"
        title="Get In Touch"
        subtitle="We'd love to hear from you. Fill out the form or use our contact details below."
        icon={Mail}
        className="bg-gray-50"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl">
          
          {/* --- Contact Form --- */}
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-800 mb-1">
                Full Name
              </label>
              <input 
                type="text" 
                id="name" 
                placeholder="Enter your name"
                className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-lg" 
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-800 mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                placeholder="you@example.com"
                className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-lg" 
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-lg font-medium text-gray-800 mb-1">
                Subject
              </label>
              <input 
                type="text" 
                id="subject" 
                placeholder="How can we help?"
                className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-lg" 
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-lg font-medium text-gray-800 mb-1">
                Message
              </label>
              <textarea 
                id="message" 
                rows="6" 
                placeholder="Write your message here..."
                className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-lg"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 px-6 bg-green-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </form>
          
          {/* --- Contact Info --- */}
          <div className="space-y-8">
            <InfoCard icon={MapPin} title="Our Office">
              <p>123 Green Valley, AgriTech Park</p>
              <p>Bengaluru, Karnataka, 560001</p>
              <p>India</p>
            </InfoCard>

            <InfoCard icon={Mail} title="Email Us">
              <p>General Inquiries:</p>
              <a href="mailto:info@krishimithra.com" className="text-green-600 hover:underline">
                info@krishimithra.com
              </a>
              <p className="mt-2">Support:</p>
              <a href="mailto:support@krishimithra.com" className="text-green-600 hover:underline">
                support@krishimithra.com
              </a>
            </InfoCard>

            <InfoCard icon={Phone} title="Call Us">
              <p>Customer Support:</p>
              <a href="tel:+911234567890" className="text-green-600 hover:underline">
                +91 12345 67890
              </a>
              <p className="mt-2">Office:</p>
              <a href="tel:+919876543210" className="text-green-600 hover:underline">
                +91 98765 43210
              </a>
            </InfoCard>
          </div>

        </div>
      </Section>
    </div>
  );
}

export default Contact;
