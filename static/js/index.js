function submitData() {
    const textContent = document.getElementById('text-content').value;
    const fileInput = document.getElementById('file-upload');
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        formData.append('file', file, file.name); 
    }

    formData.append('text-content', textContent);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('檔案與文字上傳成功！');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('檔案上傳失敗');
    });
}

const uploadButton = document.getElementById('upload-button')
uploadButton.addEventListener('click', submitData)

