function uploadFiles() {
    const formData = new FormData(document.getElementById('uploadForm'));
    const statusDiv = document.getElementById('uploadStatus');

    fetch('/upload/', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        statusDiv.innerHTML = 'Upload successful! ' + data.message;
        console.log('Success:', data);
    })
    .catch((error) => {
        statusDiv.innerHTML = 'Error during file upload!';
        console.error('Error:', error);
    });
}
