async function uploadFiles() {
    let input = document.getElementById('fileInput');
    let data = new FormData();
    for (const file of input.files) {
        data.append('files', file);
    }

    let response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: data,
    });

    let result = await response.json();
    console.log(result.message);
}

async function sendMessage() {
    let input = document.getElementById('messageInput');
    let message = input.value;
    let response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    });

    let result = await response.json();
    document.getElementById('chatArea').innerHTML += `<p>${result.response}</p>`;
    input.value = '';  // clear input after sending
}
