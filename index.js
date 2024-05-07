// The state of the game
let state = {}

// the main canvas element and its drawing context
const canvas = document.getElementById('game')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')

newGame()

function newGame() {
  //reset game state
  state = {
    phase: 'aiming', //aiming | in flight | celebrating
    currentPlayer: 1,
    bomb: {
      x: undefined,
      y: undefined,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    },
    // buildings
    backgroundBuildings: [],
    buildings: [],
    blastHoles: [],
  }

  // generate background buildings
  for (let i = 0; i < 11; i++) {
    generateBackgroundBuilding(i)
  }

  //generate buildings
  for (let i = 0; i < 8; i++) {
    generateBuilding(i)
  }

  initializeBombPosition()

  draw()
}

function generateBackgroundBuilding() {}

function generateBuilding() {}

function initializeBombPosition() {}

function draw() {}

function throwBomb() {}

function animate(timestamp) {}
