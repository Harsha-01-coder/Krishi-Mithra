import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./ChatbotWidget.css"; // Corrected import to the widget CSS

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  // Check URL query parameters on load to see if chat should be forced open
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // If the URL has ?chat=open, open the widget
    if (params.get('chat') === 'open') {
      setIsOpen(true);
    }
  }, []);


  const sendMessage = async (text) => {
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    // 1. Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chatbot`, { query: text });
      const botReply = res.data.answer || "Sorry, I couldn't understand that.";
      
      // 2. Add bot message
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      
      // 3. Speak the new reply
      const utterance = new SpeechSynthesisUtterance(botReply);
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to the AI backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    window.speechSynthesis.cancel();
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };
  
  const handleVoiceSend = () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
        sendMessage(transcript);
    }
    resetTranscript();
  };

  const toggleChat = () => {
    if (isOpen) {
      window.speechSynthesis.cancel();
      SpeechRecognition.stopListening();
    }
    setIsOpen(!isOpen);
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div className="chatbot-box">
          <div className="chat-header">
            <strong>🤖 AI Chatbot</strong>
            <button className="chat-close-btn" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-window">
            {messages.length === 0 ? (
                <div className="welcome-message widget">
                    <p>Ask a quick question about pests, fertilizer, or weather!</p>
                </div>
            ) : (
                messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.sender}`}>
                        {msg.text}
                  </div>
                ))
            )}
            {loading && <div className="loader message bot">Typing...</div>}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder={listening ? "Listening..." : "Ask me anything..."}
              value={listening ? transcript || input : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              disabled={loading}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || listening}>Send</button>
            
            {/* Voice Control Buttons */}
            {listening ? (
                <button type="button" onClick={handleVoiceSend} className="voice-btn stop-btn">
                    🛑
                </button>
            ) : (
                <button type="button" onClick={handleVoiceInput} className="voice-btn start-btn" disabled={loading}>
                    🎤
                </button>
            )}
          </div>
        </div>
      )}

      {/* Main toggle button (always visible) */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>
    </>
  );
}

export default ChatbotWidget;