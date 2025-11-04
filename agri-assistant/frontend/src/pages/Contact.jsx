import React from "react";
import "./Contact.css";
export default function Contact() {
  return (
    <div
      style={{
        padding: "80px 20px",
        textAlign: "center",
        backgroundColor: "#f9fafb",
        minHeight: "80vh",
      }}
    >
      <h1 style={{ color: "#2e7d32;", marginBottom: "20px" }}>Contact Us</h1>
      <p style={{ fontSize: "18px", color: "#555" }}>
        Have questions or feedback? We’d love to hear from you!
      </p>

      <form
        style={{
          maxWidth: "500px",
          margin: "40px auto",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          textAlign: "left",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          alert("Message sent!");
        }}
      >
        <label style={{ fontWeight: "bold" }}>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          required
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />

        <label style={{ fontWeight: "bold" }}>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          required
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />

        <label style={{ fontWeight: "bold" }}>Message</label>
        <textarea
          rows="5"
          placeholder="Write your message"
          required
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#2e7d32;",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
