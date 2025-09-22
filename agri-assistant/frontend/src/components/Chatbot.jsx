import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support voice recognition.</p>;
  }

  // Send message to backend
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/chatbot", { query: text });
      const botReply = res.data.answer || "Sorry, I couldn't understand that.";

      // Add bot response
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);

      // Text-to-speech
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

  // Start listening
  const handleVoiceInput = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  // Send voice transcript
  const handleVoiceSend = () => {
    sendMessage(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
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
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button onClick={() => sendMessage(input)}>Send</button>
        <button onClick={handleVoiceInput}>{listening ? "Listening..." : "🎤"}</button>
        <button onClick={handleVoiceSend}>Send Voice</button>
      </div>
    </div>
  );
}

export default Chatbot;
