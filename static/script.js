// DOM elements
const queryInput = document.getElementById('queryInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const loadingIndicator = document.getElementById('loadingIndicator');

// API configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINT = `${API_BASE_URL}/cra/query`;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Focus on input when page loads
    queryInput.focus();
    
    // Add event listeners
    sendButton.addEventListener('click', sendMessage);
    queryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize input based on content
    queryInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
});

// Send message function
async function sendMessage() {
    const query = queryInput.value.trim();
    
    if (!query) {
        return;
    }
    
    // Disable input and button
    setInputState(false);
    
    // Add user message to chat
    addMessage(query, 'user');
    
    // Clear input
    queryInput.value = '';
    queryInput.style.height = 'auto';
    
    // Show loading indicator
    showLoading(true);
    
    try {
        // Make API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add bot response to chat
        addMessage(data.response, 'bot', data.confidence);
        
    } catch (error) {
        console.error('Error:', error);
        addMessage(
            'Sorry, I encountered an error while processing your request. Please try again.',
            'bot'
        );
    } finally {
        // Hide loading indicator and re-enable input
        showLoading(false);
        setInputState(true);
        queryInput.focus();
    }
}

// Add message to chat
function addMessage(content, sender, confidence = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}-message`;
    
    let messageContent = `<p>${escapeHtml(content)}</p>`;
    
    // Add confidence score for bot messages
    if (sender === 'bot' && confidence !== null) {
        const confidencePercentage = Math.round(confidence);
        const confidenceColor = confidencePercentage >= 80 ? '#4CAF50' : 
                               confidencePercentage >= 60 ? '#FF9800' : '#F44336';
        
        messageContent += `
            <div class="confidence-indicator" style="margin-top: 8px; font-size: 12px; color: ${confidenceColor};">
                Confidence: ${confidencePercentage}%
            </div>
        `;
    }
    
    messageDiv.innerHTML = messageContent;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show/hide loading indicator
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
    
    if (show) {
        // Scroll to bottom to show loading indicator
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Set input state (enabled/disabled)
function setInputState(enabled) {
    queryInput.disabled = !enabled;
    sendButton.disabled = !enabled;
    
    if (enabled) {
        queryInput.focus();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format response text (basic markdown-like formatting)
function formatResponse(text) {
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return text;
}

// Handle API errors gracefully
function handleApiError(error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Sorry, I encountered an error while processing your request.';
    
    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.message.includes('500')) {
        errorMessage = 'The server encountered an internal error. Please try again later.';
    } else if (error.message.includes('404')) {
        errorMessage = 'The requested service is not available. Please try again later.';
    }
    
    addMessage(errorMessage, 'bot');
}

// Add some example questions for better UX
function addExampleQuestions() {
    const examples = [
        "What are the key principles of GDPR?",
        "What are the penalties for GDPR violations?",
        "What is the right to be forgotten?",
        "How does GDPR affect data processing consent?"
    ];
    
    const examplesDiv = document.createElement('div');
    examplesDiv.className = 'example-questions';
    examplesDiv.innerHTML = `
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Try asking:</p>
        <div class="example-buttons">
            ${examples.map(example => 
                `<button class="example-btn" onclick="setQuery('${example}')">${example}</button>`
            ).join('')}
        </div>
    `;
    
    chatMessages.appendChild(examplesDiv);
}

// Set query from example button
function setQuery(query) {
    queryInput.value = query;
    queryInput.focus();
}

// Add example questions after welcome message
setTimeout(addExampleQuestions, 1000);
