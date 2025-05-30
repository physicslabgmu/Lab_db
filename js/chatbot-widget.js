// Chatbot Widget JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Create chatbot HTML
    const chatbotHTML = `
        <div id="chatbot" class="chatbot-container" style="display: none; width: 600px; height: 570px;">
            <div class="chat-header">
                <h3>GMU Physics Lab Assistant</h3>
                <div class="chat-controls">
                    <button id="clear-chat" title="Clear Chat">🗑️</button>
                    <button id="close-chat">×</button>
                </div>
            </div>
            <div id="chat-messages" class="chat-container"></div>
            <div id="typing-indicator">Assistant is typing...</div>
            <div id="chat-input">
                <input type="text" id="user-input" placeholder="Ask about physics courses and labs...">
                <button id="send-button">Send</button>
            </div>
        </div>
        <button id="chat-toggle" class="chat-toggle-button">
            <span class="chat-icon">💬</span>
        </button>
    `;

    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 600px;
            height: 570px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            border: 1px solid #ddd;
        }

        .chat-header {
            padding: 15px 20px;
            background: #003366;
            color: white;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #002244;
            flex-shrink: 0;
        }

        .chat-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
        }

        #close-chat {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        #close-chat:hover {
            opacity: 1;
        }

        .chat-controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        #clear-chat {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        #clear-chat:hover {
            opacity: 1;
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: white;
            min-height: 0;
        }

        #chat-input {
            padding: 20px;
            border-top: 1px solid #eee;
            background: #f8f9fa;
            border-radius: 0 0 8px 8px;
            display: flex;
            gap: 10px;
            position: sticky;
            bottom: 0;
            flex-shrink: 0;
        }

        #user-input {
            flex-grow: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        #user-input:focus {
            border-color: #003366;
        }

        #send-button {
            padding: 12px 24px;
            background: #003366;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
            white-space: nowrap;
        }

        #send-button:hover {
            background: #004080;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 8px;
            max-width: 85%;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        }

        .message.user {
            background: #E3F2FD;
            margin-left: auto;
            color: #000;
        }

        .message.assistant {
            background: #F5F5F5;
            margin-right: auto;
            color: #000;
        }

        .message img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .message .chat-image-container {
            margin: 10px 0;
            text-align: center;
            background: #fff;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .message .chat-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
            margin: 0 auto;
        }

        .message .image-caption {
            margin-top: 8px;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }

        .message .image-error {
            color: #dc3545;
            background: #f8d7da;
            padding: 8px;
            border-radius: 4px;
            margin: 5px 0;
            text-align: center;
            font-size: 0.9em;
        }

        .message a {
            color: #003366;
            text-decoration: none;
            word-break: break-all;
            display: inline-block;
            margin: 5px 0;
            padding: 4px 8px;
            background: #fff;
            border-radius: 4px;
            border: 1px solid #ddd;
            transition: all 0.2s;
        }

        .message a:hover {
            text-decoration: none;
            background: #f8f9fa;
            border-color: #003366;
        }

        #typing-indicator {
            display: none;
            padding: 10px 20px;
            font-style: italic;
            color: #666;
            background: #f8f9fa;
            border-top: 1px solid #eee;
            flex-shrink: 0;
        }

        .chat-toggle-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }

        .chat-toggle-button:hover {
            background: #357abd;
            transform: scale(1.05);
        }

        .chat-icon {
            font-size: 24px;
        }

        /* Scrollbar styling */
        .chat-container::-webkit-scrollbar {
            width: 8px;
        }

        .chat-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .chat-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }

        .chat-container::-webkit-scrollbar-thumb:hover {
            background: #666;
        }

        /* Error message styling */
        .error {
            background-color: #fee;
            color: #c00;
        }

        @media (max-height: 800px) {
            .chatbot-container {
                height: 90vh;
            }
        }
    `;

    // Initialize chat history
    let chatHistory = [];
    const MAX_HISTORY = 50; // Maximum number of messages to keep in history

    // Function to save chat history to localStorage
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory.slice(-MAX_HISTORY)));
    }

    // Function to load chat history from localStorage
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            // Display loaded messages
            chatHistory.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}`;
                if (msg.role === 'assistant') {
                    messageDiv.innerHTML = msg.content;
                } else {
                    messageDiv.textContent = msg.content;
                }
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Function to clear chat
    function clearChat() {
        chatMessages.innerHTML = '';
        chatHistory = [];
        saveChatHistory();
    }

    // Function to add message to history
    function addToHistory(role, content) {
        chatHistory.push({ role, content });
        saveChatHistory();
    }

    // Add HTML and styles to document
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    document.head.appendChild(style);

    // Get DOM elements
    const chatbot = document.getElementById('chatbot');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const clearChatBtn = document.getElementById('clear-chat');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // Load chat history
    loadChatHistory();

    // Clear chat button handler
    clearChatBtn.addEventListener('click', clearChat);

    // Handle chat toggle
    chatToggle.addEventListener('click', () => {
        chatbot.style.display = chatbot.style.display === 'none' ? 'flex' : 'none';
        if (chatbot.style.display === 'none') {
            // Set a timeout to clear chat after 5 seconds when closed
            setTimeout(() => {
                if (chatbot.style.display === 'none') {
                    clearChat();
                    chatHistory = [];
                    saveChatHistory();
                }
            }, 5000);
        }
    });

    // Handle page reload
    window.addEventListener('beforeunload', () => {
        clearChat();
        chatHistory = [];
        saveChatHistory();
    });

    // Close button functionality
    closeChat.addEventListener('click', () => {
        chatbot.style.display = 'none';
        // Set a timeout to clear chat after 5 seconds when closed
        setTimeout(() => {
            if (chatbot.style.display === 'none') {
                clearChat();
                chatHistory = [];
                saveChatHistory();
            }
        }, 5000);
    });

    let clearTimeout;

    // Send message function
    async function sendMessage(message) {
        // Add user message to chat and history
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.textContent = message;  
        chatMessages.appendChild(userMessageDiv);
        addToHistory('user', message);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        typingIndicator.style.display = 'block';

        try {
            // Get the current hostname
            const hostname = window.location.hostname;
            // Determine API URL based on hostname
            let apiUrl;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                apiUrl = 'http://localhost:3000/api/auth/chat';
            } else if (hostname === 'physicslabgmu.github.io') {
                apiUrl = 'https://lab-backend-nwko.onrender.com/api/auth/chat';
            } else {
                apiUrl = '/api/auth/chat'; // Default fallback
            }

            console.log('Using API URL:', apiUrl); // Debug log

            // Show typing indicator
            typingIndicator.style.display = 'block';

            // Make the API request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ prompt: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';

            // Add bot response to chat
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message assistant';
            
            // Create a temporary div to sanitize the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.response || data.message;
            
            // Remove any script tags for security
            const scripts = tempDiv.getElementsByTagName('script');
            for (let i = scripts.length - 1; i >= 0; i--) {
                scripts[i].remove();
            }
            
            // Process images to ensure they load properly
            const images = tempDiv.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                img.onerror = () => {
                    img.style.display = 'none';
                    const errorText = document.createElement('div');
                    errorText.className = 'image-error';
                    errorText.textContent = 'Failed to load image';
                    img.parentNode.appendChild(errorText);
                };
                img.onload = () => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                };
            }
            
            // Fix link formatting issues - remove trailing parentheses from links
            const links = tempDiv.getElementsByTagName('a');
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const href = link.getAttribute('href');
                if (href && href.endsWith(')')) {
                    link.setAttribute('href', href.slice(0, -1));
                }
            }
            
            // Set the sanitized HTML content
            botMessageDiv.innerHTML = tempDiv.innerHTML;
            
            // Apply any styles from the response
            if (data.styles) {
                const styleElement = document.createElement('style');
                styleElement.textContent = data.styles;
                document.head.appendChild(styleElement);
            }
            
            chatMessages.appendChild(botMessageDiv);
            addToHistory('assistant', data.response || data.message);

            // Save chat history
            saveChatHistory();
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.style.display = 'none';
            
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'message assistant error';
            errorMessageDiv.textContent = error.message || 'Sorry, I encountered an error. Please try again.';
            chatMessages.appendChild(errorMessageDiv);
            addToHistory('assistant', 'Error: ' + error.message);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Function to handle sending message
    function handleSendMessage(event) {
        if (event) {
            event.preventDefault();
        }
        
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
            userInput.value = '';
            userInput.focus();
        }
    }

    // Handle send button click
    sendButton.addEventListener('click', handleSendMessage);

    // Handle enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to avoid newline
            handleSendMessage(e);
        }
    });

    // Handle input focus
    userInput.addEventListener('focus', () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});
