// Handle drag and drop functionality
const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const previewSection = document.querySelector('.preview-section');
const previewImage = document.getElementById('previewImage');
const uploadForm = document.getElementById('uploadForm');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropZone.classList.add('highlight');
}

function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection via input
imageInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            previewFile(file);
            previewSection.style.display = 'block';
        } else {
            alert('Please upload an image file');
        }
    }
}

function previewFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        previewImage.src = reader.result;
    }
}

// Handle form submission
uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(html => {
        // Update the results section with the new HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newResults = doc.querySelector('.results-card');
        const currentResults = document.querySelector('.results-card');
        currentResults.innerHTML = newResults.innerHTML;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing the image. Please try again.');
    });
}); 