var rs = require('readline-sync');

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * (maxNum +1))

const main = () => {
  const pause = rs.keyInPause('Press any key to start the game.', {
    guide: false,
  });

  let board = initBoard(10);
  let gameOver = false;

  placeShips(board);
  console.log(board)

  while(!gameOver) {
    updateBoard(board, [...getNextMove(board)]);
    if(calcShipsRemaining(board) === 0) gameOver = true;
    console.log(board);
  }

  // Restart game Y/N
  if(rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) return main();
}

// Game start
main();

// Helper functions
function initBoard(gridSize) {
  let board = {};

  for (let i = 0; i < gridSize; i++) {
    board[String.fromCharCode(65 + i)] = '0'.repeat(gridSize).split('').map(Number);
  }

  return board
}

function placeShips(board) {
  const shipLengths = [5, 4, 3, 3.1, 2]
  
  for (let length of shipLengths) {
    let shipCoords = generateRandomCoords(board, length);
    for ([row, col] of shipCoords) {
        board[row][col] = length
    }
  }
}


function generateRandomCoords(board, length) {
  const gridSize = board['A'].length;
  const axisValues = ['x', 'y']
  const directionValues = [-1, 1]
  
  const direction = directionValues[randomNumInRange(1)]
  const axis = axisValues[randomNumInRange(1)]
  const startRow = String.fromCharCode(randomNumInRange(gridSize) + 65)
  const startCol = randomNumInRange(gridSize);
  const coordsArray = [[startRow, startCol]]
  
  if (axis === 'x') {
      for (let i = 1; i < Math.floor(length); i++) {
          coordsArray.push([startRow, startCol + (i * direction)]);
      }
  } else if (axis === 'y'){
      for (let i = 1; i < Math.floor(length); i++) {
          const nextRow = String.fromCharCode(startRow.codePointAt(0) + i)
          coordsArray.push([nextRow, startCol]);
      }
  }
  
  if (!isValidCoords(coordsArray, board)) {
      return generateRandomCoords(board, length);
  }
 
  return coordsArray;
}

// Check if there is already a ship at those coordinates
function isValidCoords(coords, board) {
  const rowsArray = Object.keys(board)
  const colsArray = Object.values(board).map((_, index) => index)
  
  for (let [row, col] of coords) {
      if (!rowsArray.includes(row) || !colsArray.includes(col)  || board[row][col]) {
          return false;
      }
  }
  return true;
}

function getNextMove(board) {
  const regexString = `^[A-${String.fromCharCode(Math.floor(65 + board['A'].length))}][1-9]|10$`
  const regex = new RegExp(regexString)

  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = nextMove.split(/^([a-zA-Z])(\d+)/).slice(1)
  console.log([row, col])
  const boardAtCoords = board[row][getIndex(col)]

  // Location has already been chosen (2 or 3)
  if (boardAtCoords === 1 || boardAtCoords === 9) {
    console.log('You have already picked this location. Miss!')
    return getNextMove(board);
  }

  return [row, col];
}

function updateBoard(board, [row, col]) {
  const valueAtCoords = board[row][getIndex(col)]

  if (valueAtCoords === 0) {            // Location is empty (0): Miss
    board[row][getIndex(col)] = 1
    console.log('You have missed!')
  } else if (valueAtCoords > 1) {    // Location has a ship that hasn't already been selected (1-5): Hit
    board[row][getIndex(col)] = 9
    console.log("value at coords: " + valueAtCoords)

    const hitConfirmationStr = `${isShipSunk(board, valueAtCoords) ? 'Hit. You have sunk a battleship.' : 'Hit.'}`
    const shipsRemainingStr = `${calcShipsRemaining(board) > 1 ? `${calcShipsRemaining(board)} ships` : `1 ship`} remaining.`
    console.log(`${hitConfirmationStr} ${shipsRemainingStr}`)
  }
  
  return board;
}

function calcShipsRemaining(board) {
  const shipValues = [5, 4, 3, 3.1, 2];
  return shipValues.reduce((shipsRemaining, ship) => {
    for (let [_, col] of Object.entries(board)) {
      // if(col.find(value => value === parseInt(ship))) return shipsRemaining += 1;
      if (col.find(value => value === ship)) return shipsRemaining += 1;
    }
    
    return shipsRemaining;
  }, 0);
}

function isShipSunk(board, ship) {
  for (let [_, col] of Object.entries(board)) {
    if(col.find(value => value === ship)) return false;
  }

  return true;
}