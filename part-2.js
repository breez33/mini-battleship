var rs = require('readline-sync');

let board = {}
const ships = [5, 4, 3, 3.1, 2];

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * (maxNum +1))

const main = () => {
  const pause = rs.keyInPause('Press any key to start the game.', {
    guide: false,
  });

  initBoard(10);
  placeShips();
  let gameOver = false;

  while(!gameOver) {
    updateBoard([...getNextMove()]); 
    if (calcShipsRemaining(board) === 0) gameOver = true;
  }

  // Restart game Y/N
  if (rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) return main();
}

// Game start
main();

// Game Logic
function initBoard(gridSize) {
  // Clear board when new game started
  if (Object.keys(board).length) clearBoard();

  for (let i = 0; i < gridSize; i++) {
    board[String.fromCharCode(65 + i)] = '0'.repeat(gridSize).split('').map(Number);
  }
}

function clearBoard() {
  for (const row in board) {
    delete board[row];
  }
}

function placeShips() {
  for (let shipLength of ships) {
    let shipCoords = generateRandomCoords(shipLength);
    for ([row, col] of shipCoords) {
        board[row][col] = shipLength
    }
  }
}


function generateRandomCoords(length) {
  const gridSize = Object.values(board)[0].length || 0;
  const shipLength = Math.floor(length)
  const axisValues = ['x', 'y']
  const directionValues = [-1, 1]
  
  const startRow = String.fromCharCode(randomNumInRange(gridSize) + 65)
  const startCol = randomNumInRange(gridSize);
  const direction = directionValues[randomNumInRange(1)]
  const axis = axisValues[randomNumInRange(1)]
  const coordsArray = [[startRow, startCol]]
  
  if (axis === 'x') {
      for (let i = 1; i < shipLength; i++) {
        const nextCol = startCol + (i * direction)
        coordsArray.push([startRow, nextCol]);
      }
  } else {
      for (let i = 1; i < shipLength; i++) {
          const nextRow = String.fromCharCode(startRow.codePointAt(0) + i)
          coordsArray.push([nextRow, startCol]);
      }
  }
  
  if (!isValidCoords(coordsArray)) generateRandomCoords(length);
 
  return coordsArray;
}

// Check if there is already a ship at specific coordinates
function isValidCoords(coords) {
  const rowsArray = Object.keys(board)
  const colsArray = Object.values(board).map((_, index) => index)
  
  for (let [row, col] of coords) {
      if (!rowsArray.includes(row) || !colsArray.includes(col)  || board[row][col]) {
          return false;
      }
  }

  return true;
}

function getNextMove() {
  const regexString = `^[A-${String.fromCharCode(Math.floor(65 + board['A'].length))}][1-9]|10$`
  const regex = new RegExp(regexString)

  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = nextMove.split(/^([a-zA-Z])(\d+)/).slice(1)
  const valueAtCoords = board[row][getIndex(col)]

  // Location has already been chosen - 1: Previous Miss or 9: Previous Hit
  if (valueAtCoords === 1 || valueAtCoords === 9) {
    console.log('You have already picked this location. Miss!')
    return getNextMove();
  }

  return [row, col];
}

function updateBoard(coords) {
  const [row, col] = coords
  const valueAtCoords = board[row][getIndex(col)]

  if (valueAtCoords === 0) {            // Location is empty (0): Miss
    board[row][getIndex(col)] = 1
    console.log('You have missed!')
  } else if (valueAtCoords > 1) {      // Location has a ship that hasn't already been selected (1-5): Hit
    board[row][getIndex(col)] = 9
    console.log("value at coords: " + valueAtCoords)

    const hitConfirmationStr = `${isShipSunk(valueAtCoords) ? 'Hit. You have sunk a battleship.' : 'Hit.'}`
    const shipsRemainingStr = `${calcShipsRemaining() > 1 ? `${calcShipsRemaining()} ships` : `1 ship`} remaining.`
    console.log(`${hitConfirmationStr} ${shipsRemainingStr}`)
  } else {
    console.log('There was an issue updating the board! Try again')
  }
}

function calcShipsRemaining() {
  return ships.reduce((shipsRemaining, ship) => {
    for (let [_, col] of Object.entries(board)) {
      if (col.find(value => value === ship)) return shipsRemaining += 1;
    }
    
    return shipsRemaining;
  }, 0);
}

function isShipSunk(ship) {
  for (let [_, col] of Object.entries(board)) {
    if (col.find(value => value === ship)) return false;
  }

  return true;
}
