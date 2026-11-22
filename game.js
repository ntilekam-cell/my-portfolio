const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const jumpBtn = document.getElementById("button");

// Game variables
let birdY = 180;
let birdVelocity = 0;
const gravity = 0.4;
const jumpStrength = -7.5;
const bounceDamping = 0.75; // Controls how high the ball bounces off floor/ceiling
const birdX = 100;
const birdRadius = 15;

let pipes = [];
const pipeWidth = 50;
const pipeGap = 130;
const pipeSpeed = 3;
let frameCount = 0;

let score = 0;
let highScore = 0;
let gameOver = false;

// Jump / Restart action
function handleJump() {
  if (gameOver) {
    resetGame();
  } else {
    birdVelocity = jumpStrength;
  }
}

// Listen for button click, Spacebar, or canvas tap
jumpBtn.addEventListener("click", handleJump);
canvas.addEventListener("click", handleJump);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    handleJump();
  }
});

// Create a new top & bottom pipe pair
function spawnPipe() {
  const minHeight = 40;
  const maxHeight = canvas.height - pipeGap - minHeight;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    passed: false
  });
}

// Reset everything after Game Over
function resetGame() {
  birdY = 180;
  birdVelocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameOver = false;
  jumpBtn.textContent = "Jump";
}

// Update game physics and check collisions
function update() {
  if (gameOver) return;

  birdVelocity += gravity;
  birdY += birdVelocity;

  // Bouncy ceiling (top wall)
  if (birdY - birdRadius < 0) {
    birdY = birdRadius;
    birdVelocity = Math.abs(birdVelocity) * bounceDamping;
  }

  // Bouncy floor (bottom wall)
  if (birdY + birdRadius > canvas.height) {
    birdY = canvas.height - birdRadius;
    birdVelocity = -Math.abs(birdVelocity) * bounceDamping;
  }

  // Spawn a pipe every 100 frames
  if (frameCount % 100 === 0) {
    spawnPipe();
  }
  frameCount++;

  // Move pipes and check collisions (Game Over ONLY on pipe hit)
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= pipeSpeed;

    const hitX = birdX + birdRadius > p.x && birdX - birdRadius < p.x + pipeWidth;
    const hitTop = birdY - birdRadius < p.topHeight;
    const hitBottom = birdY + birdRadius > p.bottomY;

    if (hitX && (hitTop || hitBottom)) {
      endGame();
    }

    // Score point when passing pipe
    if (!p.passed && p.x + pipeWidth < birdX) {
      p.passed = true;
      score++;
      if (score > highScore) highScore = score;
    }

    // Remove off-screen pipes
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  }
}

function endGame() {
  gameOver = true;
  jumpBtn.textContent = "Play Again";
}

// Draw everything on the canvas
function draw() {
  // Clear canvas
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw subtle bouncy border lines on top & bottom walls
  ctx.fillStyle = "#00e5ff";
  ctx.fillRect(0, 0, canvas.width, 4);
  ctx.fillRect(0, canvas.height - 4, canvas.width, 4);

  // Draw pipes
  ctx.fillStyle = "#4caf50";
  pipes.forEach((p) => {
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
    ctx.fillRect(p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);
  });

  // Draw player (ball)
  ctx.beginPath();
  ctx.arc(birdX, birdY, birdRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700";
  ctx.fill();
  ctx.closePath();

  // Draw Score
  ctx.fillStyle = "white";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 15, 32);
  ctx.fillText("Best: " + highScore, 15, 57);

  // Draw Game Over overlay
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 15);

    ctx.font = "18px sans-serif";
    ctx.fillText("Click 'Play Again' or press Space to restart", canvas.width / 2, canvas.height / 2 + 20);
  }
}

// Main game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start the game
loop();
