// The state of the game
let state = {}
let isDragging = false
let dragStartX = undefined
let dragStartY = undefined

// the main canvas element and its drawing context
const canvas = document.getElementById('game')

// left info panel
const angle1DOM = document.querySelector('#info-left .angle')
const velocity1DOM = document.querySelector('#info-left .velocity')

// right info panel
const angle2DOM = document.querySelector('#info-right .angle')
const velocity2DOM = document.querySelector('#info-right .velocity')

// the bomb's grab area
const bombGrabAreaDOM = document.getElementById('bomb-grab-area')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')

// Event Handlers
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  calculateScale()
  initializeBombPosition()
  draw()
})

// mouse events
bombGrabAreaDOM.addEventListener('mousedown', (event) => {
  if (state.phase === 'aiming') {
    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY

    document.body.style.cursor = 'grabbing'
  }
})

window.addEventListener('mousemove', (event) => {
  if (isDragging) {
    let deltaX = event.clientX - dragStartX
    let deltaY = event.clientY - dragStartY

    state.bomb.velocity.x = -deltaX
    state.bomb.velocity.y = deltaY
    setInfo(deltaX, deltaY)

    draw()
  }
})

window.addEventListener('mouseup', (event) => {
  if (isDragging) {
    isDragging = false
    document.body.style.cursor = 'default'

    throwBomb()
  }
})

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
    scale: 1,
  }

  // generate background buildings
  for (let i = 0; i < 11; i++) {
    generateBackgroundBuilding(i)
  }

  //generate buildings
  for (let i = 0; i < 9; i++) {
    generateBuilding(i)
  }

  calculateScale()

  initializeBombPosition()

  draw()
}

function calculateScale() {
  const lastBuilding = state.buildings.at(-1)
  const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width
  state.scale = window.innerWidth / totalWidthOfTheCity
}

function generateBackgroundBuilding(index) {
  const previousBuilding = state.backgroundBuildings[index - 1]

  const x = previousBuilding ? previousBuilding.x + previousBuilding.width + 4 : -30

  const minWidth = 60
  const maxWidth = 110
  const width = minWidth + Math.random() * (maxWidth - minWidth)

  const minHeight = 80
  const maxHeight = 350
  const height = minHeight + Math.random() * (maxHeight - minHeight)

  state.backgroundBuildings.push({ x, width, height })
}

function generateBuilding(index) {
  const previousBuilding = state.buildings[index - 1]
  const x = previousBuilding ? previousBuilding.x + previousBuilding.width + 4 : 0

  const minWidth = 80
  const maxWidth = 130
  const width = minWidth + Math.random() * (maxWidth - minWidth)

  const platformWithGorilla = index === 1 || index === 6

  const minHeight = 40
  const maxHeight = 300
  const minHeightGorilla = 30
  const maxHeightGorilla = 150

  const height = platformWithGorilla
    ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
    : minHeight + Math.random() * (maxHeight - minHeight)

  const lightsOn = []
  for (let i = 0; i < 50; i++) {
    const light = Math.random() <= 0.33 ? true : false
    lightsOn.push(light)
  }

  state.buildings.push({ x, width, height, lightsOn })
}

function initializeBombPosition() {
  const building = state.currentPlayer === 1 ? state.buildings.at(1) : state.buildings.at(-2)
  const gorillaX = building.x + building.width / 2
  const gorillaY = building.height
  const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28
  const gorillaHandOffsetY = 107

  state.bomb.x = gorillaX + gorillaHandOffsetX
  state.bomb.y = gorillaY + gorillaHandOffsetY

  state.bomb.velocity.x = 0
  state.bomb.velocity.y = 0

  // initialize the position of the grab area in HTML
  const grabAreaRadius = 15
  const left = state.bomb.x * state.scale - grabAreaRadius
  const bottom = state.bomb.y * state.scale - grabAreaRadius
  bombGrabAreaDOM.style.left = `${left}px`
  bombGrabAreaDOM.style.bottom = `${bottom}px`
}

function draw() {
  ctx.save()
  // flip coordinate system upside down
  ctx.translate(0, window.innerHeight)
  ctx.scale(1, -1)
  ctx.scale(state.scale, state.scale)

  //draw scene
  drawBackground()
  drawBackgroundBuildings()
  drawBuildings()
  drawGorilla(1)
  drawGorilla(2)
  drawBomb()

  //restore transformation
  ctx.restore()
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight / state.scale)
  gradient.addColorStop(1, '#F8BA85')
  gradient.addColorStop(0, '#FFC28E')

  //draw sky
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, window.innerWidth / state.scale, window.innerHeight / state.scale)

  // draw moon
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.beginPath()
  ctx.arc(300, 350, 60, 0, 2 * Math.PI)
  ctx.fill()
}

function drawBackgroundBuildings() {
  state.backgroundBuildings.forEach((building) => {
    ctx.fillStyle = '#947285'
    ctx.fillRect(building.x, 0, building.width, building.height)
  })
}

function throwBomb() {}

function animate(timestamp) {}

function drawBuildings() {
  state.buildings.forEach((building) => {
    //draw a building
    ctx.fillStyle = '#4A3C68'
    ctx.fillRect(building.x, 0, building.width, building.height)

    // draw windows
    const windowWidth = 10
    const windowHeight = 12
    const gap = 15

    const numberOfFloors = Math.ceil((building.height - gap) / (windowHeight + gap))
    const numberOfRoomsPerFloor = Math.floor((building.width - gap) / (windowWidth + gap))

    for (let floor = 0; floor < numberOfFloors; floor++) {
      for (let room = 0; room < numberOfRoomsPerFloor; room++) {
        if (building.lightsOn[floor * numberOfRoomsPerFloor + room]) {
          ctx.save()
          ctx.translate(building.x + gap, building.height - gap)
          ctx.scale(1, -1)

          const x = room * (windowWidth + gap)
          const y = floor * (windowHeight + gap)

          ctx.fillStyle = '#EBB6A2'
          ctx.fillRect(x, y, windowWidth, windowHeight)

          ctx.restore()
        }
      }
    }
  })
}

function drawGorilla(player) {
  ctx.save()
  const building = player === 1 ? state.buildings.at(1) : state.buildings.at(-2)

  ctx.translate(building.x + building.width / 2, building.height)
  drawGorillaBody()
  drawGorillaLeftArm(player)
  drawGorillaRightArm(player)
  drawGorillaFace(player)
  ctx.restore()
}

function drawGorillaBody() {
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(0, 15)
  ctx.lineTo(-7, 0)
  ctx.lineTo(-20, 0)
  ctx.lineTo(-17, 18)
  ctx.lineTo(-20, 44)

  ctx.lineTo(-11, 77)
  ctx.lineTo(0, 84)
  ctx.lineTo(11, 77)

  ctx.lineTo(20, 44)
  ctx.lineTo(17, 18)
  ctx.lineTo(20, 0)
  ctx.lineTo(7, 0)
  ctx.fill()
}

function drawGorillaLeftArm(player) {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(-14, 50)
  if (state.phase === 'aiming' && state.currentPlayer === 1 && player === 1) {
    ctx.quadraticCurveTo(-44, 63, -28 - state.bomb.velocity.x / 6.25, 107 - state.bomb.velocity.y / 6.25)
  } else if (state.phase === 'celebrating' && state.currentPlayer === player) {
    ctx.quadraticCurveTo(-44, 63, -28, 107)
  } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12)
  }
  ctx.stroke()
}

function drawGorillaRightArm(player) {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(+14, 50)
  if (state.phase === 'aiming' && state.currentPlayer === 2 && player === 2) {
    ctx.quadraticCurveTo(+44, 63, +28 - state.bomb.velocity.x / 6.25, 107 - state.bomb.velocity.y / 6.25)
  } else if (state.phase === 'celebrating' && state.currentPlayer === player) {
    ctx.quadraticCurveTo(+44, 63, +28, 107)
  } else {
    ctx.quadraticCurveTo(+44, 45, +28, 12)
  }
  ctx.stroke()
}

function drawBomb() {
  ctx.save()
  ctx.translate(state.bomb.x, state.bomb.y)

  if (state.phase === 'aiming') {
    ctx.translate(-state.bomb.velocity.x / 6.25, -state.bomb.velocity.y / 6.25)

    //draw throwing trajectory
    ctx.strokestyle = 'rgba(255,255,255,0.7)'
    ctx.setLineDash([3, 8])
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(state.bomb.velocity.x, state.bomb.velocity.y)
    ctx.stroke()
  }

  //draw circle
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(0, 0, 6, 0, 2 * Math.PI)
  ctx.fill()

  // restore transformation
  ctx.restore()
}

function drawGorillaFace(player) {
  // face
  ctx.fillStyle = 'lightgray'
  ctx.beginPath()
  ctx.arc(0, 63, 9, 0, 2 * Math.PI)
  ctx.moveTo(-3.5, 70)
  ctx.arc(-3.5, 70, 4, 0, 2 * Math.PI)
  ctx.moveTo(+3.5, 70)
  ctx.arc(+3.5, 70, 4, 0, 2 * Math.PI)
  ctx.fill()

  // eyes
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.arc(-3.5, 70, 1.4, 0, 2 * Math.PI)
  ctx.moveTo(+3.5, 70)
  ctx.arc(+3.5, 70, 1.4, 0, 2 * Math.PI)
  ctx.fill()

  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1.4

  // nose
  ctx.beginPath()
  ctx.moveTo(-3.5, 66.5)
  ctx.lineTo(-1.5, 65)
  ctx.moveTo(3.5, 66.5)
  ctx.lineTo(1.5, 65)
  ctx.stroke()

  // mouth
  ctx.beginPath()
  if (state.phase === 'celebrating' && state.currentPlayer === player) {
    ctx.moveTo(-5, 60)
    ctx.quadraticCurveTo(0, 56, 5, 60)
  } else {
    ctx.moveTo(-5, 56)
    ctx.quadraticCurveTo(0, 60, 5, 56)
  }

  ctx.stroke()
}

// bomb velocity angle info
function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2)
  const angleInRadians = Math.asin(deltaY / hypotenuse)
  const angleInDegrees = (angleInRadians / Math.PI) * 180

  if (state.currentPlayer === 1) {
    angle1DOM.innerText = Math.round(angleInDegrees)
    velocity1DOM.innerText = Math.round(hypotenuse)
  } else {
    angle2DOM.innerText = Math.round(angleInDegrees)
    velocity2DOM.innerText = Math.round(hypotenuse)
  }
}
