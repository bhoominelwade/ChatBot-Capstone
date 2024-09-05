document.getElementById('messageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var messageInput = document.getElementById('messageInput');
    var message = messageInput.value.trim();
    if (message) {
        addMessageToChat(message);
        messageInput.value = '';  // Clear input after sending
    }
});

function addMessageToChat(message) {
    var chatArea = document.getElementById('chatArea');
    var messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;  // Scroll to the bottom of the chat area
}
