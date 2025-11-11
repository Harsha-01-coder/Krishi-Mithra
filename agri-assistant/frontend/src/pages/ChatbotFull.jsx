import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ReactMarkdown from 'react-markdown';
import '../components/ChatbotFull.css'; // Corrected path

function ChatbotFull() {
    const [messages, setMessages] = useState([
        { 
            sender: 'bot', 
            text: 'Namaskar! I am Krishimitra, your AI agricultural assistant. How can I help you today?',
            speech: 'Namaskar! I am Krishimitra, your AI agricultural assistant. How can I help you today?' // Add speech text for first message
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const { transcript, resetTranscript, listening } = useSpeechRecognition();
    const [isSendingManually, setIsSendingManually] = useState(false);
    const messagesEndRef = useRef(null); // Ref for auto-scrolling
    
    // Ref to manage API request cancellation
    const abortControllerRef = useRef(null);

    // Removed isSpeaking and isMuted states, as speech is now opt-in

    const API_URL = 'http://127.0.0.1:5000/chatbot';

    // Auto-scroll to the bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Only scroll if it's NOT the initial message
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages]);

    // Show a warning if voice is not supported
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return (
            <div className="chatbot-full-page">
                <div className="chat-container">
                    <div className="error-box">
                        <p>Your browser does not fully support voice recognition. Please use the text input.</p>
                    </div>
                </div>
            </div>
        );
    }

    // We define sendMessage inside useCallback to make this effect stable
    const sendMessage = useCallback(async (text) => {
        window.speechSynthesis.cancel(); // Stop any previous speech
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { sender: "user", text: text, speech: text }]);
        setInput("");
        setLoading(true);

        // Create and store AbortController
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await axios.post(API_URL, { query: text }, {
                signal: controller.signal // Pass the signal to axios
            });
            let botReply = res.data.answer || "Sorry, I couldn't understand that.";

            // Clean up markdown for speech
            const plainTextForSpeech = botReply
                .replace(/###/g, '') .replace(/##/g, '') .replace(/#/g, '')
                .replace(/\*\*/g, '') .replace(/\*/g, '');

            // --- 🚀 MODIFIED: Store both text and speech text ---
            setMessages((prev) => [...prev, { 
                sender: "bot", 
                text: botReply, 
                speech: plainTextForSpeech 
            }]);
            
            // --- REMOVED: Automatic speech call ---

        } catch (err) {
            // Handle cancellation error gracefully
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                console.log("Chat request cancelled by user.");
                // Message is set by handleStopGeneration
            } else {
                console.error(err);
                setMessages((prev) => [
                    ...prev,
                    { 
                        sender: "bot", 
                        text: "Error connecting to the AI backend. Please check your server.",
                        speech: "Error connecting to the AI backend. Please check your server."
                    },
                ]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null; // Clear the controller
        }
    }, [API_URL]); // Removed isMuted from dependency array

    // Handles automatic stop after user pauses speaking
    useEffect(() => {
        if (!listening && transcript.trim() && !isSendingManually) {
            sendMessage(transcript.trim());
            resetTranscript();
        }
        if (!listening) {
            setIsSendingManually(false);
        }
    }, [listening, transcript, isSendingManually, resetTranscript, sendMessage]); 

    // --- 🚀 NEW: Function to PLAY speech on demand ---
    const handlePlaySpeech = (textToSpeak) => {
        window.speechSynthesis.cancel(); // Stop any other speech
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.speak(utterance);
    };

    // Function to stop the API request (generation)
    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Cancel the axios request
            abortControllerRef.current = null;
            setLoading(false); 
            setMessages((prev) => [...prev, { 
                sender: 'bot', 
                text: "Okay, I've stopped my response.",
                speech: "Okay, I've stopped my response."
            }]);
        }
    };

    // Handles text input submission
    const handleTextSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    }

    // Handles voice recording start
    const handleVoiceInput = () => {
        window.speechSynthesis.cancel(); // Stop AI speech
        resetTranscript();
        setIsSendingManually(false);
        SpeechRecognition.startListening({ continuous: false });
    };
    
    // Handles manual stop
    const handleVoiceSend = () => {
        setIsSendingManually(true);
        SpeechRecognition.stopListening();
        
        const messageToSend = transcript.trim();
        if (messageToSend) {
            setInput(messageToSend); 
            sendMessage(messageToSend);
        }
        resetTranscript();
    };

    return (
        <div className="chatbot-full-page">
            <div className="chat-container">
                {/* --- 🚀 MODIFIED: Header now clean, no buttons --- */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <h3>🤖 Krishimitra AI Assistant</h3>
                        <p>Your guide to modern farming</p>
                    </div>
                </div>

                {/* Message History */}
                <div className="chat-history">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                            {/* Use ReactMarkdown for bot messages */}
                            {msg.sender === 'bot' ? (
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>
                            ) : (
                                msg.text // User messages are plain text
                            )}

                            {/* --- 🚀 NEW: Play button for bot messages --- */}
                            {msg.sender === 'bot' && (
                                <button 
                                    onClick={() => handlePlaySpeech(msg.speech)} 
                                    className="play-speech-btn" 
                                    title="Read this message aloud"
                                >
                                    🔊
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {/* "Bot is typing..." indicator */}
                    {loading && (
                        <div className="chat-message bot-message">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    
                    {/* Empty div to force scroll to bottom */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form className="chat-input-form" onSubmit={handleTextSubmit}>
                    <input
                        type="text"
                        placeholder={listening ? "Listening..." : "Type your question..."}
                        value={listening ? transcript : input} // Show transcript while listening
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        aria-label="Your message"
                    />
                    
                    {/* Conditional Send/Stop Button */}
                    {loading ? (
                        <button 
                            type="button" 
                            onClick={handleStopGeneration} 
                            className="send-btn stop-generation-btn"
                            title="Stop generating response"
                        >
                            Stop
                        </button>
                    ) : (
                        <button 
                            type="submit" 
                            // Disable if loading, or if listening and both fields are empty, or if not listening and input is empty
                            disabled={loading || (listening && !input.trim() && !transcript.trim()) || (!listening && !input.trim())} 
                            className="send-btn"
                            title="Send message"
                        >
                            Send
                        </button>
                    )}
                    
                    {/* Voice Control Buttons */}
                    <div className="voice-controls">
                        {listening ? (
                            <button type="button" onClick={handleVoiceSend} className="voice-btn stop-btn" title="Stop and send message">
                                🛑
                            </button>
                        ) : (
                            <button type="button" onClick={handleVoiceInput} className="voice-btn start-btn" disabled={loading} title="Start voice input">
                                🎤
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatbotFull;