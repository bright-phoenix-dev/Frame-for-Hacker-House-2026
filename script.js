document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('photo-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const actionButtons = document.getElementById('action-buttons');
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
        frameImage.onload = renderCanvas;
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
        if (!frameImage || !frameImage.complete) return;

        // Ensure canvas matches frame natural dimensions
        canvas.width = frameImage.naturalWidth || 800;
        canvas.height = frameImage.naturalHeight || 800;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // If user image is provided and complete, draw it clipped
        if (userImage && userImage.complete) {
            const cutoutX = canvas.width * 0.203;
            const cutoutY = canvas.height * 0.237;
            const cutoutWidth = canvas.width * 0.594;
            const cutoutHeight = canvas.height * 0.570;

            const scale = Math.max(cutoutWidth / userImage.width, cutoutHeight / userImage.height);
            
            const drawW = userImage.width * scale;
            const drawH = userImage.height * scale;

            const imgX = cutoutX + (cutoutWidth - drawW) / 2;
            const imgY = cutoutY + (cutoutHeight - drawH) / 2;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(cutoutX, cutoutY, cutoutWidth, cutoutHeight);
            ctx.clip();
            ctx.drawImage(userImage, imgX, imgY, drawW, drawH);
            ctx.restore();
        }

        // 2. Draw frame overlay on top
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

        // Show canvas
        canvas.style.display = 'block';
    }

    function showControls() {
        uploadBtn.classList.add('hidden');
        uploadPlaceholder.classList.add('hidden');
        const initialSampleBtn = document.getElementById('initialSampleBtn');
        if (initialSampleBtn) initialSampleBtn.classList.add('hidden');
        actionButtons.classList.remove('hidden');
    }

    function resetApp() {
        userImage = null;
        renderCanvas();
        
        uploadBtn.classList.remove('hidden');
        uploadPlaceholder.classList.remove('hidden');
        const initialSampleBtn = document.getElementById('initialSampleBtn');
        if (initialSampleBtn) initialSampleBtn.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        
        fileInput.value = ''; // clear input
    }

    // Helper function for safe event listeners
    function safeAddEventListener(elementId, event, handler) {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener(event, handler);
        } else {
            console.warn(`Element with ID '${elementId}' not found. Skipping event listener.`);
        }
    }

    safeAddEventListener('download-btn', 'click', () => {
        // High quality PNG export
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'HackerHouseGoa2026_Badge.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.innerHTML = 'Downloaded! 🎉';
            setTimeout(() => {
                downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Badge
                `;
            }, 3000);
        }
    });

    safeAddEventListener('reset-btn', 'click', resetApp);

    safeAddEventListener('shareXBtn', 'click', async () => {
        // 1. Copy image directly to user's clipboard
        try {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                }
            });
        } catch (err) {
            console.warn("Clipboard copy not supported, falling back to auto-download.");
            // Fallback: trigger canvas download
            const link = document.createElement('a');
            link.download = 'hacker-house-badge.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        // 2. Open X Intent immediately in a new tab
        const text = encodeURIComponent("Just generated my official badge for Hacker House Goa 2026! 🌴🚀 Check it out & get yours here:");
        const url = encodeURIComponent(window.location.href);
        window.open(`https://x.com/intent/post?text=${text}&url=${url}`, '_blank');
    });

    function loadSampleImage() {
        userImage = new Image();
        userImage.crossOrigin = 'anonymous'; // Crucial for external URL to avoid tainted canvas
        userImage.onload = () => {
            renderCanvas();
            showControls();
        };
        userImage.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
    }

    safeAddEventListener('sample-btn', 'click', loadSampleImage);
    safeAddEventListener('initialSampleBtn', 'click', loadSampleImage);

    // Boot
    loadFrame();
});
