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
    const container = document.getElementById('post-container');

    const card = document.createElement('div');

    const textElement = document.createElement('p');
    textElement.textContent = textContent;
    card.appendChild(textElement); 

    if (file) {
        const imgURL = URL.createObjectURL(file);  
        const imgElement = document.createElement('img');
        imgElement.src = imgURL;  
        imgElement.className = 'post-image'; 
        card.appendChild(imgElement); 

        imgElement.onload = () => {
            URL.revokeObjectURL(imgURL);
        }
    }
    container.appendChild(card);
}

function updatePageWithImageUrl(textContent, imageUrl) {
    const container = document.getElementById('post-container');

    const card = document.createElement('div');
    card.className = 'card';

    const textElement = document.createElement('p');
    textElement.textContent = textContent;
    card.appendChild(textElement); 

    if (imageUrl) {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;  
        imgElement.className = 'post-image'; 
        card.appendChild(imgElement); 
    }
    container.appendChild(card);
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