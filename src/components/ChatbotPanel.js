import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import './ChatbotPanel.css';

function ChatbotPanel({ messages, onMessagesUpdate }) {
    // Fallback to local state if props aren't provided (though they should be)
    // Actually, let's assume props are provided for now as per our design

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        const updatedMessages = [...(messages || []), newUserMessage];
        if (onMessagesUpdate) {
            onMessagesUpdate(updatedMessages);
        }

        setInputText('');
        setIsLoading(true);

        try {
            // Prepare conversation history (exclude the welcome message)
            const conversationHistory = updatedMessages
                .filter(msg => msg.id !== 1) // Exclude initial welcome
                .map(msg => ({
                    text: msg.text,
                    sender: msg.sender
                }));

            // Call the chat API
            const response = await fetch('http://localhost:4000/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputText,
                    history: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const newBotMessage = {
                id: Date.now() + 1,
                text: data.text,
                sender: 'bot'
            };

            if (onMessagesUpdate) {
                onMessagesUpdate([...updatedMessages, newBotMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please make sure the backend server is running. 😅",
                sender: 'bot'
            };

            if (onMessagesUpdate) {
                onMessagesUpdate([...updatedMessages, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-panel">
            <div className="panel-header">
                <h2>🤖 AI Assistant</h2>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-avatar">
                            {msg.sender === 'bot' ? <FaRobot /> : <FaUser />}
                        </div>
                        <div className="message-bubble">
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="message-avatar">
                            <FaRobot />
                        </div>
                        <div className="message-bubble typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Ask for content ideas..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="chat-input"
                />
                <button type="submit" className="chat-send-btn">
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
}

export default ChatbotPanel;
