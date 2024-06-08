window.onload = function() {
    loadMessages();  // Load messages when the page loads
    if (!sessionStorage.getItem('chatInitialized')) {
        addBotMessage("Hi, I'm your lovely chatbot. How can I help you?");
        sessionStorage.setItem('chatInitialized', 'true'); // Set this only once per session
    }
};

document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        if (!event.shiftKey) { // If Shift is not pressed, send the message
            event.preventDefault(); // Prevent the default action to avoid a new line
            sendMessage(); // Call your function to send the message
        }
        // If Shift is pressed, allow the default action to create a new line
    }
});

function sendMessage() {
    var input = document.getElementById('userInput');
    var message = input.value.trim();
    if (message !== '') {
        addUserMessage(message);
        fetch('/get-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        })
            .then(response => response.json())
            .then(data => {
                addBotMessage(data.message); // Display the response from GPT-3.5
            })
            .catch(error => console.error('Error:', error));

        input.value = ''; // Clear input after sending
        saveMessages();
    }
}

function addUserMessage(message) {
    var chatBox = document.getElementById('chatBox');
    var userMsg = document.createElement('div');
    userMsg.textContent = message;
    userMsg.className = 'user-message'; // Apply user-message styling
    chatBox.appendChild(userMsg);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    saveMessages(); // Save messages when a new user message is added
}

function addBotMessage(message) {
    var chatBox = document.getElementById('chatBox');
    var botMsg = document.createElement('div');
    botMsg.textContent = message;
    botMsg.className = 'bot-message'; // Apply bot-message styling
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    saveMessages(); // Save messages when a new bot message is added
}

function saveMessages() {
    var chatBox = document.getElementById('chatBox');
    sessionStorage.setItem('chatMessages', chatBox.innerHTML);
}

function loadMessages() {
    var storedMessages = sessionStorage.getItem('chatMessages');
    if (storedMessages) {
        document.getElementById('chatBox').innerHTML = storedMessages;
    }
}
