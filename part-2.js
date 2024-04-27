var rs = require('readline-sync');

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * (maxNum +1))

const pause = rs.keyInPause('Press any key to start the game.', {
  guide: false,
});

const startGame = () => {
  let gameBoard = initGameBoard(10);
  let gameOver = false;

  while(!gameOver) {
    gameBoard = updateGameBoard(gameBoard, [...getNextMove(gameBoard)]);
    if(getShipsRemaining(gameBoard) === 0) gameOver = true;
  }

  // Restart game Y/N
  if(rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) return startGame();
}

// Game start
startGame();

// Helper functions
function initGameBoard(gridSize) {
  let board = {};

  for (let i = 0; i < gridSize; i++) {
    board[String.fromCharCode(65 + i)] = '0'.repeat(gridSize).split('').map(Number);
  }

  initShips(board);
  return board
}

function initShips(board) {
  const shipLengths = [5, 4, 3, 3, 2]
  
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
  const startRow = String.fromCharCode(randomNumInRange(gridSize - length) + 65)
  const startCol = randomNumInRange(gridSize);
  const coordsArray = [[startRow, startCol]]
  
  if (axis === 'x') {
      for (let i = 1; i < length; i++) {
          coordsArray.push([startRow, startCol + (i * direction)]);
      }
  } else if (axis === 'y'){
      for (let i = 1; i < length; i++) {
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
  console.log(regex);
  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = [...nextMove]
  const boardAtCoords = board[row][getIndex(col)]

  // Location has already been chosen (2 or 3)
  if (boardAtCoords === 2 || boardAtCoords === 3) {
    console.log('You have already picked this location. Miss!')
    return getNextMove(board);
  }

  return [...nextMove];
}

function updateGameBoard(board, [row, col]) {
  let boardAtCoords = board[row][getIndex(col)]

  if (boardAtCoords === 0) {            // Location is empty (0): Miss
    board[row][getIndex(col)] = 3
    console.log('You have missed!')
  } else if (boardAtCoords === 1) {    // Location has a ship that hasn't already been selected (1): Hit
    board[row][getIndex(col)] = 2
    console.log(`Hit. You have sunk a battleship. ${getShipsRemaining(board) > 1 ? `${getShipsRemaining(board)} ships` : `1 ship`} remaining.`)
  }
  
  return board;
}

function getShipsRemaining(board) {
  return Object.entries(board).reduce((shipCount, [_, col]) => {
    let count = 0

    for (let elem of col) {
      if(elem === 1) count++
    }

    return shipCount += count;
  }, 0);
}