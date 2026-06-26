const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const previewImg = document.getElementById('previewImg');
const uploadContent = document.getElementById('uploadContent');
const resultImg = document.getElementById('resultImg');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const predictBtn = document.getElementById('predictBtn');
const btnText = document.getElementById('btnText');
const detectionResults = document.getElementById('detectionResults');
const resultsGrid = document.getElementById('resultsGrid');

let selectedFile = null;

// File input change
fileInput.addEventListener('change', function(e) {
    handleFile(e.target.files[0]);
});

// Drag and drop
uploadBox.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', function() {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
});

// Click on upload box
uploadBox.addEventListener('click', function() {
    fileInput.click();
});

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewImg.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        predictBtn.disabled = false;
        // Reset result
        resultImg.classList.add('hidden');
        resultPlaceholder.classList.remove('hidden');
        detectionResults.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Predict button
predictBtn.addEventListener('click', function() {
    if (!selectedFile) return;

    btnText.innerHTML = '<span class="loading"></span> Detecting...';
    predictBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', selectedFile);

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        // Show result image
        resultImg.src = 'data:image/jpeg;base64,' + data.image;
        resultImg.classList.remove('hidden');
        resultPlaceholder.classList.add('hidden');

        // Show detections
        resultsGrid.innerHTML = '';
        if (data.detections.length > 0) {
            data.detections.forEach(det => {
                const icon = det.class === 'Mango' ? '🥭' : '🍃';
                const card = document.createElement('div');
                card.className = 'detection-card';
                card.innerHTML = `
                    <div class="crop-icon">${icon}</div>
                    <div class="crop-name">${det.class}</div>
                    <div class="confidence">Confidence: ${det.confidence}%</div>
                `;
                resultsGrid.appendChild(card);
            });
            detectionResults.classList.remove('hidden');
        } else {
            resultsGrid.innerHTML = '<p style="color:#9ca3af">No crops detected. Try a clearer image!</p>';
            detectionResults.classList.remove('hidden');
        }
    })
    .catch(err => {
        alert('Error: ' + err.message);
    })
    .finally(() => {
        btnText.innerHTML = '🚀 Detect Crops';
        predictBtn.disabled = false;
    });
});