// Inisialisasi elemen canvas dan konteksnya
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ukuran bola
const ballRadius = 10;
// Posisi awal bola
let x = canvas.width / 2;
let y = canvas.height - 30;
// Kecepatan bola
let dx = 3;
let dy = -3;

// Ukuran paddle
const paddleHeight = 10;
const paddleWidth = 75;
// Posisi awal paddle
let paddleX = (canvas.width - paddleWidth) / 2;

// Status tombol yang ditekan
let rightPressed = false;
let leftPressed = false;

// Konfigurasi bricks
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Array untuk menyimpan bricks
let bricks = [];

// Status permainan
let gameStarted = false;
let currentLevel = 0;

// Daftar level
const baseBrickWidth = 75;
const baseBrickHeight = 20;
const baseRowCount = 3;
const baseColumnCount = 5;

// Konfigurasi level
const levels = [
    { rowCount: baseRowCount, columnCount: baseColumnCount, brickWidth: baseBrickWidth, brickHeight: baseBrickHeight, speedMultiplier: 1 },
    { rowCount: baseRowCount + 1, columnCount: baseColumnCount + 1, brickWidth: baseBrickWidth - 5, brickHeight: baseBrickHeight - 2, speedMultiplier: 1.2 },
    { rowCount: baseRowCount + 2, columnCount: baseColumnCount + 2, brickWidth: baseBrickWidth - 10, brickHeight: baseBrickHeight - 4, speedMultiplier: 1.4 }
];

// Mendengarkan peristiwa tombol ditekan
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Handler ketika tombol ditekan
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === " " || e.code === "Space") {
        if (!gameStarted) {
            gameStarted = true;
            document.getElementById("message").style.display = "none";
            document.getElementById("winMessage").style.display = "none";
            if (currentLevel >= levels.length) {
                currentLevel = 0; // Reset level jika sudah melewati semua level
            }
            setupLevel(currentLevel); // Siapkan level yang sesuai
            requestAnimationFrame(draw); // Mulai animasi
        }
    }
}

// Handler ketika tombol dilepas
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Setup level berdasarkan konfigurasi level
function setupLevel(level) {
    let levelConfig = levels[level];
    bricks = [];
    for (let c = 0; c < levelConfig.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < levelConfig.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // Status 1 menandakan brick masih ada
        }
    }
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3 * levelConfig.speedMultiplier; // Sesuaikan kecepatan bola
    dy = -3 * levelConfig.speedMultiplier;
    paddleX = (canvas.width - paddleWidth) / 2; // Reset posisi paddle
}

// Deteksi tabrakan antara bola dan bricks
function collisionDetection() {
    for (let c = 0; c < bricks.length; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            let b = bricks[c][r];
            if (b.status === 1) { // Jika brick masih ada
                if (x > b.x && x < b.x + levels[currentLevel].brickWidth && y > b.y && y < b.y + levels[currentLevel].brickHeight) {
                    dy = -dy;
                    b.status = 0; // Brick dihancurkan
                    checkWin(); // Cek apakah semua brick sudah dihancurkan
                }
            }
        }
    }
}

// Memeriksa apakah pemain menang
function checkWin() {
    for (let c = 0; c < bricks.length; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) { // Jika masih ada brick yang tersisa
                return;
            }
        }
    }
    // Jika semua bricks dihancurkan, tampilkan pesan kemenangan
    document.getElementById("winMessage").style.display = "block";
    gameStarted = false; // Hentikan permainan
    currentLevel++; // Naik ke level berikutnya
}

// Menggambar bola
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6f61";
    ctx.shadowColor = "#ff6f61";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
}

// Menggambar paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#f5a623";
    ctx.shadowColor = "#f5a623";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
}

// Menggambar bricks
function drawBricks() {
    let levelConfig = levels[currentLevel];
    let totalBrickWidth = levelConfig.columnCount * levelConfig.brickWidth + (levelConfig.columnCount - 1) * brickPadding;
    let offsetX = (canvas.width - totalBrickWidth) / 2;

    for (let c = 0; c < bricks.length; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) { // Jika brick masih ada
                let brickX = c * (levelConfig.brickWidth + brickPadding) + offsetX;
                let brickY = r * (levelConfig.brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, levelConfig.brickWidth, levelConfig.brickHeight);
                ctx.fillStyle = "#29a19c";
                ctx.shadowColor = "#29a19c";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Fungsi utama untuk menggambar dan mengatur permainan
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
    drawBricks(); // Gambar bricks
    drawBall(); // Gambar bola
    drawPaddle(); // Gambar paddle
    collisionDetection(); // Deteksi tabrakan

    // Tabrakan bola dengan dinding
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;

            // Menambahkan variasi acak pada dx
            let randomFactor = (Math.random() - 0.5) * 2; // Nilai acak antara -1 dan 1
            dx += randomFactor;

            // Membatasi nilai dx agar tidak terlalu kecil atau terlalu besar
            if (dx > 5) dx = 5;
            if (dx < -5) dx = -5;
        } else {
            document.location.reload(); // Jika bola jatuh, restart game
        }
    }

    // Gerakkan paddle sesuai input pengguna
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx; // Update posisi bola
    y += dy;

    if (gameStarted) {
        requestAnimationFrame(draw); // Lanjutkan animasi
    }
}