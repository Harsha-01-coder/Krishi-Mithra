import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot", { query: input });
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error connecting to server." }]);
    }
    setInput("");
  };

  return (
    <div className="chatbot-box">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Ask about weather or soil..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
