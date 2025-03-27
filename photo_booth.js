// photo_booth.js
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const retakeAllButton = document.getElementById('retakeAll');
const countdownElement = document.getElementById('countdown');
const canvases = [
    document.getElementById('canvas1'),
    document.getElementById('canvas2'),
    document.getElementById('canvas3')
];
const contexts = canvases.map(canvas => canvas.getContext('2d'));
const deleteButtons = document.querySelectorAll('.delete-btn');

let photoCount = 0;

// เข้าถึงกล้อง
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing camera:', error);
    });

// นับถอยหลังและถ่ายรูป
captureButton.addEventListener('click', () => {
    if (photoCount >= 3) return; // ถ้าถ่ายครบ 3 ภาพแล้ว ไม่ต้องทำอะไร

    startCountdown();
});

function startCountdown() {
    let count = 3;
    countdownElement.textContent = count;
    countdownElement.style.display = 'block';

    const countdownInterval = setInterval(() => {
        count--;
        countdownElement.textContent = count;

        if (count === 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    const canvas = canvases[photoCount];
    const context = contexts[photoCount];
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block'; // แสดง canvas

    photoCount++;

    // เปิดใช้งานปุ่ม Retake All
    if (photoCount === 3) {
        retakeAllButton.disabled = false;
        createPhotoStrip();
    }
}

// ลบรูป
deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const canvas = canvases[index];
        canvas.style.display = 'none'; // ซ่อน canvas
        photoCount--;

        // ปิดใช้งานปุ่ม Retake All
        if (photoCount < 3) {
            retakeAllButton.disabled = true;
        }
    });
});

// ลบรูปทั้งหมด
retakeAllButton.addEventListener('click', () => {
    canvases.forEach(canvas => {
        canvas.style.display = 'none'; // ซ่อน canvas ทั้งหมด
    });
    photoCount = 0;
    retakeAllButton.disabled = true;
});

// สร้างภาพรวม (Photo Strip)
function createPhotoStrip() {
    const photoWidth = canvases[0].width;
    const photoHeight = canvases[0].height;

    // สร้าง canvas ใหม่สำหรับรวมภาพ
    const photoStrip = document.createElement('canvas');
    photoStrip.width = photoWidth;
    photoStrip.height = photoHeight * 3; // เรียงภาพในแนวตั้ง
    const photoStripContext = photoStrip.getContext('2d');

    // วาดภาพทั้ง 3 ภาพลงใน photoStrip
    contexts.forEach((context, index) => {
        photoStripContext.drawImage(canvases[index], 0, index * photoHeight, photoWidth, photoHeight);
    });

    // บันทึก photoStrip ลงใน localStorage เพื่อส่งไปยังหน้าตกแต่งรูป
    localStorage.setItem('photoStrip', photoStrip.toDataURL('image/png'));

    // ไปยังหน้าตกแต่งรูป
    window.location.href = 'edit/edit_photo.html';
}