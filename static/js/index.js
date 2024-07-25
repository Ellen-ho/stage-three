function submitData() {
    const textContent = document.getElementById('text-content').value;
    const fileInput = document.getElementById('file-upload');
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        formData.append('file', file, file.name); 
    }

    formData.append('text_content', textContent);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('檔案與文字上傳成功！');
        updatePageWithContent(textContent, fileInput.files[0]);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('檔案上傳失敗');
    });
}

function updatePageWithContent(textContent, file) {
    const container = document.getElementById('input-container');

    const textElement = document.createElement('p');
    textElement.textContent = textContent;
    container.appendChild(textElement); 

    if (file) {
        const imgURL = URL.createObjectURL(file);  
        const imgElement = document.createElement('img');
        imgElement.src = imgURL;  
        imgElement.style.maxWidth = "200px"; 
        container.appendChild(imgElement); 

        imgElement.onload = () => {
            URL.revokeObjectURL(imgURL);
        }
    }

    const newHr = document.createElement('hr');
    container.appendChild(newHr); 
}

function updatePageWithImageUrl(textContent, imageUrl) {
    const container = document.getElementById('input-container');

    const textElement = document.createElement('p');
    textElement.textContent = textContent;
    container.appendChild(textElement); 

    if (imageUrl) {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;  
        imgElement.style.maxWidth = "200px"; 
        container.appendChild(imgElement); 
    }

    const newHr = document.createElement('hr');
    container.appendChild(newHr); 
}

const uploadButton = document.getElementById('upload-button')
uploadButton.addEventListener('click', submitData)

window.onload = function() {
    fetch('/posts')
    .then(response => response.json())
    .then(data => {
        data.forEach(post => {
            updatePageWithImageUrl(post.text, post.image_url);
        });
    })
    .catch(error => console.error('Error loading posts:', error));
};