import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./Chatbot.css"; // We will update this file next

function Chatbot() {
  // NEW: State to manage if the chatbox is open or closed
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support voice recognition.</p>;
  }

  // --- All your existing functions (sendMessage, handleVoiceInput, etc.) ---
  // --- can stay exactly the same. No changes needed there.           ---
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    try {
      const res = await axios.post("http://localhost:5000/chatbot", { query: text });
      const botReply = res.data.answer || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
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
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };
  const handleVoiceSend = () => {
    sendMessage(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
  };
  // ---------------------------------------------------------------------

  // NEW: Function to toggle the chatbox
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* This is the main chatbox window.
        We add the "open" class only when isOpen is true.
      */}
      {isOpen && (
        <div className="chatbot-box">
          
          {/* NEW: Header with a close button */}
          <div className="chat-header">
            <strong>🤖 AI Chatbot</strong>
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

      {/* This is the floating button that is always visible.
        It toggles the chatbox open and closed.
      */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>
    </>
  );
}

export default Chatbot;