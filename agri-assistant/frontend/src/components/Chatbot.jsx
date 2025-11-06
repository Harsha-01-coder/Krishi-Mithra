import React, { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support voice recognition.</p>;
  }

  const sendMessage = async (text) => {
    // --- 1. ADD THIS ---
    // Stop any currently speaking bot
    window.speechSynthesis.cancel();

    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    try {
      const res = await axios.post("http://localhost:5000/chatbot", { query: text });
      const botReply = res.data.answer || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      
      // Speak the new reply
      const utterance = new SpeechSynthesisUtterance(botReply);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to backend." },
      ]);
    }
  };
  
  const handleVoiceInput = () => {
    // --- 2. ADD THIS ---
    // Stop the bot before the user speaks
    window.speechSynthesis.cancel();

    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };
  
  const handleVoiceSend = () => {
    sendMessage(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const toggleChat = () => {
    // --- 3. ADD THIS LOGIC ---
    // If the chat is open and we are about to close it, stop all speech
    if (isOpen) {
      window.speechSynthesis.cancel();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot-box">
          <div className="chat-header">
            <strong>🤖 AI Chatbot</strong>
            {/* This button now also stops speech on close */}
            <button className="chat-close-btn" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button onClick={() => sendMessage(input)}>Send</button>
            <button onClick={handleVoiceInput}>{listening ? "..." : "🎤"}</button>
            <button onClick={handleVoiceSend}>Send Voice</button>
          </div>
        </div>
      )}

      {/* This button now also stops speech on close */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>
    </>
  );
}

export default Chatbot;