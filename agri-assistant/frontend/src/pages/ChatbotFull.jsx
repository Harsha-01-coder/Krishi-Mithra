import React, { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "../components/Chatbot.css"; // Corrected path to CSS

function ChatbotFull() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  
  // State to track if the user manually hit the 'Stop & Send' button
  const [isSendingManually, setIsSendingManually] = useState(false); 

  // Show a warning if voice is not supported
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="chatbot-full-container">
        <div className="error-box">
          <p>Your browser does not fully support voice recognition. Please use the text input.</p>
        </div>
      </div>
    );
  }

  // --- NEW EFFECT: Handles automatic stop after user pauses speaking ---
  useEffect(() => {
    // 1. Check if listening has stopped AND if the transcript has content
    // 2. Also check if the stop was *not* initiated by the user (isSendingManually)
    if (!listening && transcript.trim() && !isSendingManually) {
        // Automatically send the message (simulates manual stop)
        sendMessage(transcript.trim());
        // Clean up the transcript so it doesn't send again
        resetTranscript();
    }
    // Reset the manual flag after the attempt, regardless of whether it ran
    if (!listening) {
        setIsSendingManually(false);
    }
    
  }, [listening, transcript, isSendingManually, resetTranscript]); // Dependencies

  const sendMessage = async (text) => {
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    // 1. Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot", { query: text });
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
        { sender: "bot", text: "Error connecting to the AI backend. Please check your server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handles text input submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  }

  // Handles voice recording start
  const handleVoiceInput = () => {
    window.speechSynthesis.cancel();
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };
  
  // --- MODIFIED: Manual Stop ---
  const handleVoiceSend = () => {
    // 1. Set the manual flag to prevent the useEffect from double-sending
    setIsSendingManually(true);
    
    // 2. Stop listening now
    SpeechRecognition.stopListening();
    
    // 3. Check if the transcript has content and send immediately
    const messageToSend = transcript.trim();
    if (messageToSend) {
        setInput(messageToSend); 
        sendMessage(messageToSend);
    }
    resetTranscript();
  };

  return (
    <div className="chatbot-full-container">
      <div className="chat-card">
        <div className="chat-header">
          <h2>🤖 Krishi AI Assistant</h2>
          <p>Ask questions about crops, pests, market trends, or weather advice.</p>
        </div>

        <div className="chat-window-full">
          {messages.length === 0 ? (
            <div className="welcome-message">
                <p>Welcome! Ask me anything about farming in India.</p>
                <p>Try saying: "What fertilizer should I use for rice in Punjab?"</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                <span className="message-icon">{msg.sender === 'user' ? '🧑' : '🤖'}</span>
                <div className="message-text">{msg.text}</div>
              </div>
            ))
          )}
          {loading && <div className="loader message bot">Typing...</div>}
        </div>

        <form className="chat-input-full" onSubmit={handleTextSubmit}>
          <input
            type="text"
            // Display transcript if listening, otherwise display input state
            placeholder={listening ? "Listening..." : "Type your question..."}
            value={listening ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          
          <button type="submit" disabled={loading} className="send-btn">
            Send
          </button>
          
          <div className="voice-controls">
            {listening ? (
                <button type="button" onClick={handleVoiceSend} className="voice-btn stop-btn">
                    🛑 Stop & Send
                </button>
            ) : (
                <button type="button" onClick={handleVoiceInput} className="voice-btn start-btn" disabled={loading}>
                    🎤 Voice Input
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatbotFull;