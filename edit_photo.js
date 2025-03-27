const photoStripCanvas = document.getElementById('photoStrip');
const photoStripContext = photoStripCanvas.getContext('2d');
const addTextButton = document.getElementById('addText');
const saveButton = document.getElementById('save');
const stickers = document.querySelectorAll('.sticker');

// Array to hold sticker data (including position and size)
let stickerData = [];

// Load photo strip from localStorage
const photoStripData = localStorage.getItem('photoStrip');
if (photoStripData) {
    const img = new Image();
    img.src = photoStripData;
    img.onload = () => {
        photoStripCanvas.width = img.width;
        photoStripCanvas.height = img.height;
        photoStripContext.drawImage(img, 0, 0);
    };
}

// Function to handle sticker dragging and repositioning
stickers.forEach(sticker => {
    sticker.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', sticker.src);
    });
});

photoStripCanvas.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
});

photoStripCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const stickerSrc = e.dataTransfer.getData('text/plain');
    const img = new Image();
    img.src = stickerSrc;
    img.onload = () => {
        const rect = photoStripCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left - img.width / 2;
        const y = e.clientY - rect.top - img.height / 2;

        // Save sticker data for future manipulation (position and size)
        stickerData.push({
            img: img,
            x: x,
            y: y,
            width: 50,
            height: 50
        });

        // Re-render all stickers
        renderStickers();
    };
});

// Function to render stickers on the canvas
function renderStickers() {
    // Clear the canvas and redraw the photo strip image
    const img = new Image();
    img.src = localStorage.getItem('photoStrip');
    img.onload = () => {
        photoStripContext.clearRect(0, 0, photoStripCanvas.width, photoStripCanvas.height);
        photoStripContext.drawImage(img, 0, 0);

        // Draw each sticker
        stickerData.forEach(sticker => {
            photoStripContext.drawImage(sticker.img, sticker.x, sticker.y, sticker.width, sticker.height);
        });
    };
}

// Function to allow resizing of stickers
let selectedStickerIndex = null;
photoStripCanvas.addEventListener('mousedown', (e) => {
    const rect = photoStripCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if a sticker was clicked
    selectedStickerIndex = stickerData.findIndex(sticker => {
        return x >= sticker.x && x <= sticker.x + sticker.width &&
               y >= sticker.y && y <= sticker.y + sticker.height;
    });

    if (selectedStickerIndex !== -1) {
        // Display resize cursor on hover
        photoStripCanvas.style.cursor = 'se-resize';
    }
});

photoStripCanvas.addEventListener('mousemove', (e) => {
    if (selectedStickerIndex !== null) {
        const rect = photoStripCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Resize sticker while dragging
        const sticker = stickerData[selectedStickerIndex];
        sticker.width = x - sticker.x;
        sticker.height = y - sticker.y;

        renderStickers();
    }
});

photoStripCanvas.addEventListener('mouseup', () => {
    selectedStickerIndex = null;
    photoStripCanvas.style.cursor = 'default'; // Reset cursor
});

// Add text to the canvas
addTextButton.addEventListener('click', () => {
    const text = prompt("Enter your text:");
    if (text) {
        photoStripContext.font = "20px Arial";
        photoStripContext.fillStyle = "#ff7eb9";
        photoStripContext.fillText(text, 10, 50);
    }
});

// Save the edited photo
saveButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = photoStripCanvas.toDataURL('image/png');
    link.download = 'photo_strip.png';
    link.click();
});
