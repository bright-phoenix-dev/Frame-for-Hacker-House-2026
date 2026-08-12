document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('photo-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const actionButtons = document.getElementById('action-buttons');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const canvas = document.getElementById('photo-canvas');
    const ctx = canvas.getContext('2d');

    // State
    let userImage = null;
    let frameImage = null;
    const FRAME_URL = 'frame transparent.png';

    // Initialize: Load Frame Image
    function loadFrame() {
        frameImage = new Image();
        frameImage.crossOrigin = "anonymous";
        frameImage.src = FRAME_URL;
        frameImage.onload = () => {
            console.log('Frame loaded successfully');
            if (userImage) renderCanvas();
        };
        frameImage.onerror = () => {
            console.error('Failed to load ' + FRAME_URL + '. Ensure the image is in the same directory.');
        };
    }

    // Event Listeners for Upload
    uploadBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', () => fileInput.click()); // Make placeholder area clickable
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Drag and Drop - Prevent default browser behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please upload an image file (PNG, JPG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            userImage = new Image();
            userImage.onload = () => {
                renderCanvas();
                showControls();
            };
            userImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderCanvas() {
        if (!userImage || !frameImage) return;

        // 1. READ FRAME DIMENSIONS
        canvas.width = frameImage.naturalWidth;
        canvas.height = frameImage.naturalHeight;

        // 1. UPDATED CUTOUT BOUNDING BOX COORDINATES
        const cutoutX = canvas.width * 0.203;
        const cutoutY = canvas.height * 0.237;
        const cutoutWidth = canvas.width * 0.594;
        const cutoutHeight = canvas.height * 0.570;

        // 2. CENTER AND CLIP STRICTLY INSIDE CUTOUT
        const scale = Math.max(cutoutWidth / userImage.width, cutoutHeight / userImage.height);
        
        const drawW = userImage.width * scale;
        const drawH = userImage.height * scale;

        const imgX = cutoutX + (cutoutWidth - drawW) / 2;
        const imgY = cutoutY + (cutoutHeight - drawH) / 2;

        // 3. CANVAS DRAW SEQUENCE WITH CLIP MASK
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(cutoutX, cutoutY, cutoutWidth, cutoutHeight);
        ctx.clip();
        ctx.drawImage(userImage, imgX, imgY, drawW, drawH);
        ctx.restore();

        // Draw frame overlay on top
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

        // Show canvas
        canvas.style.display = 'block';
    }

    function showControls() {
        uploadBtn.classList.add('hidden');
        uploadPlaceholder.classList.add('hidden');
        actionButtons.classList.remove('hidden');
    }

    function resetApp() {
        userImage = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        
        uploadBtn.classList.remove('hidden');
        uploadPlaceholder.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        
        fileInput.value = ''; // clear input
    }

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        // High quality PNG export
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'HackerHouseGoa2026_Badge.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Optional: Trigger a small confetti or success animation here
        downloadBtn.innerHTML = 'Downloaded! 🎉';
        setTimeout(() => {
            downloadBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Badge
            `;
        }, 3000);
    });

    resetBtn.addEventListener('click', resetApp);

    sampleBtn.addEventListener('click', () => {
        userImage = new Image();
        userImage.crossOrigin = 'anonymous'; // Crucial for external URL to avoid tainted canvas
        userImage.onload = () => {
            renderCanvas();
            showControls();
        };
        userImage.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
    });

    // Boot
    loadFrame();
});
