// The state of the game
let state = {}

// the main canvas element and its drawing context
const canvas = document.getElementById('game')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')

newGame()

function newGame() {
  state = {}
}

function draw() {}

function throwBomb() {}

function animate(timestamp) {}
