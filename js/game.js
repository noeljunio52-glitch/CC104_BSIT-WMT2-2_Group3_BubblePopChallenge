const AREA_W = 320;
const AREA_H = 420;
const START_SIZE_MIN = 36;
const START_SIZE_MAX = 46;
const MAX_SIZE = 90;
const GROW_PER_TICK = 1;
const TICK_MS = 100;
const SPAWN_EVERY_TICKS = 15;
const POINTS_PER_POP = 10;
const START_LIVES = 3;

const FACES = [
  "assets/faces/face1.jpg",
  "assets/faces/face2.jpg",
  "assets/faces/face3.jpg"
];

let bubbles = [];
let nextId = 1;
let score = 0;
let lives = START_LIVES;
let ticks = 0;
let gameOver = false;
let timerId = null;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnBubble() {
  const half = MAX_SIZE / 2 + 2;
  const bubble = {
    id: nextId,
    face: Math.floor(Math.random() * FACES.length),
    size: Math.round(randomBetween(START_SIZE_MIN, START_SIZE_MAX)),
    x: Math.round(randomBetween(half, AREA_W - half)),
    y: Math.round(randomBetween(half, AREA_H - half))
  };

  nextId++;
  bubbles.push(bubble);
}

function growBubbles() {
  bubbles.forEach(function (b) {
    b.size += GROW_PER_TICK;
  });
}

function findBubble(id) {
  return bubbles.find(function (b) {
    return b.id === id;
  });
}

function popBubble(id) {
  if (gameOver) return;

  const bubble = findBubble(id);
  if (bubble === undefined) return;

  bubbles = bubbles.filter(function (b) {
    return b.id !== id;
  });

  score += POINTS_PER_POP;
  showMessage("Pop! +" + POINTS_PER_POP + " points.", "success");
  render();
}

function burstOversizeBubbles() {
  const burst = bubbles.filter(function (b) {
    return b.size > MAX_SIZE;
  });

  if (burst.length === 0) return;

  bubbles = bubbles.filter(function (b) {
    return b.size <= MAX_SIZE;
  });

  lives -= burst.length;
  if (lives < 0) lives = 0;

  flashArea();

  if (lives === 0) {
    endGame();
  } else {
    showMessage("A bubble burst! Lives left: " + lives, "warning");
  }
}

function tick() {
  if (gameOver) return;

  ticks++;

  growBubbles();
  burstOversizeBubbles();

  if (!gameOver && ticks % SPAWN_EVERY_TICKS === 0) {
    spawnBubble();
  }

  render();
}

function endGame() {
  gameOver = true;
  clearInterval(timerId);
  $("#area").addClass("over");
  showMessage("Game over! Final score: " + score + ". Press Reset to play again.", "danger");
}

function resetGame() {
  clearInterval(timerId);
  bubbles = [];
  nextId = 1;
  score = 0;
  lives = START_LIVES;
  ticks = 0;
  gameOver = false;

  $("#area").removeClass("over hit").empty();

  spawnBubble();
  showMessage("Click the bubbles to pop them before they burst!", "info");
  render();

  timerId = setInterval(tick, TICK_MS);
}

function render() {
  const $area = $("#area");

  bubbles.forEach(function (b) {
    let $b = $("#bubble-" + b.id);

    if ($b.length === 0) {
      $b = $("<button>", {
        type: "button",
        "class": "bubble",
        id: "bubble-" + b.id,
        "data-id": b.id,
        "aria-label": "Bubble, click to pop"
      }).appendTo($area);

      if (FACES[b.face] !== undefined) {
        $b.css("background-image", "url('" + FACES[b.face] + "')");
      }
    }

    $b.css({
      width: b.size,
      height: b.size,
      left: b.x - b.size / 2,
      top: b.y - b.size / 2
    });

    $b.toggleClass("danger", b.size > MAX_SIZE * 0.8);
  });

  $area.children(".bubble").each(function () {
    const id = Number($(this).attr("data-id"));

    if (findBubble(id) === undefined) {
      $(this).remove();
    }
  });

  $("#score").text(score);
  $("#lives").text(lives > 0 ? "\u2665".repeat(lives) : "\u2013");
}

function showMessage(text, kind) {
  $("#message")
    .removeClass("alert-info alert-success alert-warning alert-danger")
    .addClass("alert-" + kind)
    .text(text);
}

function flashArea() {
  const $area = $("#area").addClass("hit");

  setTimeout(function () {
    $area.removeClass("hit");
  }, 250);
}

FACES.forEach(function (src) {
  new Image().src = src;
});

$(function () {
  $("#area").css({
    width: AREA_W,
    height: AREA_H
  });

  $("#area").on("click", ".bubble", function () {
    popBubble(Number($(this).attr("data-id")));
  });

  $("#reset-btn").on("click", resetGame);

  resetGame();
});
