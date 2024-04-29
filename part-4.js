var rs = require('readline-sync');

const ships = [5, 4, 3, 3.1, 2];
// Player or Computer
let playerBoard = {}
let computerBoard = {}
let playersTurn = true

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * (maxNum +1))


// Game start
main();

// Game Logic
function main() {
  const pause = rs.keyInPause('Press any key to start the game.', {
    guide: false,
  });
  
  let gameOver = false;

  initBoard(10, playerBoard);
  initBoard(10, computerBoard);
  placeShips(playerBoard);
  placeShips(computerBoard);

  drawBoard(playerBoard);

  while(!gameOver) {
    const activeBoard = playersTurn ? playerBoard : computerBoard;

    takeTurn(activeBoard);
    playersTurn = !playersTurn;

    if (calcShipsRemaining(activeBoard) === 0) gameOver = true;
  }

  // Restart game Y/N
  if (rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) return main();
}

function initBoard(gridSize, board) {
  // Clear board when new game started
  if (Object.keys(board).length) clearBoard(board);

  for (let i = 0; i < gridSize; i++) {
    board[String.fromCharCode(65 + i)] = '0'.repeat(gridSize).split('').map(Number);
  }
}

function clearBoard() {
  for (const row in board) {
    delete board[row];
  }
}

function placeShips(board) {
  for (let shipLength of ships) {
    let shipCoords = generateShipCoords(board, shipLength);
    for ([row, col] of shipCoords) {
        board[row][col] = shipLength
    }
  }
}

function generateShipCoords(board, length) {
  const gridSize = Object.values(board)[0].length;
  const shipLength = Math.floor(length)
  const axisValues = ['x', 'y']
  const directionValues = [-1, 1]
  
  const [startRow, startCol] = generateRandomCoord(board, gridSize);
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
  
  if (!isValidCoords(board, coordsArray)) return generateShipCoords(board, length);
 
  return coordsArray;
}

function generateRandomCoord(board, gridSize) {
  const randomRow = String.fromCharCode(randomNumInRange(gridSize) + 65);
  const randomCol = randomNumInRange(gridSize);

  if (!isValidCoords(board, [randomRow, randomCol])) generateRandomCoord;

  return [randomRow, randomCol];
}

function drawBoard(board) {
  const boardArray = Object.entries(board);
  const gridSize = boardArray.length
  const divider = '   -' + '------'.repeat(gridSize)
  let header = "   ";

  console.clear();
  // Log column numbers
  for (let i = 1; i <= gridSize; i++){
    header += `   ${i}  `
  }
  console.log(header);
  console.log(divider);

  // Log each row
  for (let [row, col] of boardArray) {
    let rowStr = `${row}  |`
    for (let value of col) {
        if (value === 1) {
            rowStr += `  O  |`
        } else if (value === 9) {
            rowStr += `  X  |`
        } else {
            rowStr += `     |`
        }
    }
    console.log(rowStr)
    console.log(divider)
  }
}

function takeTurn(board) {
  let nextMove = playersTurn ? getNextMove(board) : generateRandomCoord(Object.keys(board).length);
  updateBoard(board, nextMove);
}

// Check if there is already a ship at specific coordinates
function isValidCoords(board, coords) {
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
  const maxRowLetter = String.fromCharCode(Math.floor(64 + board['A'].length))
  const regexString = `^[a-${maxRowLetter.toLowerCase()}A-${maxRowLetter}][1-9]|10$`
  const regex = new RegExp(regexString)

  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = nextMove.toUpperCase().split(/^([a-zA-Z])(\d+)/).slice(1)
  const valueAtCoords = board[row][getIndex(col)]

  // Location has already been chosen - 1: Previous Miss or 9: Previous Hit
  if (valueAtCoords === 1 || valueAtCoords === 9) return getNextMove();

  return [row, col];
}

function updateBoard(board, coords) {
  const [row, col] = coords
  const valueAtCoords = board[row][getIndex(col)]

  if (valueAtCoords === 0) {            // Location is empty (0): Miss
    board[row][getIndex(col)] = 1;
    drawBoard();
  } else if (valueAtCoords > 1) {      // Location has a ship that hasn't already been selected (1-5): Hit
    board[row][getIndex(col)] = 9;
    if (playersTurn) drawBoard();

    if (isShipSunk(board, valueAtCoords)) {
      console.log(`You have sunk a battleship. ${calcShipsRemaining() == 1 ? '1 ship' : `${calcShipsRemaining()} ships`} remaining.`)
    }
  } else {
    if (playersTurn) drawBoard();
    console.log('There was an issue updating the board! Try again')
  }
}

function calcShipsRemaining(board) {
  return ships.reduce((shipsRemaining, ship) => {
    for (let [_, col] of Object.entries(board)) {
      if (col.find(value => value === ship)) return shipsRemaining += 1;
    }
    
    return shipsRemaining;
  }, 0);
}

function isShipSunk(board, ship) {
  for (let [_, col] of Object.entries(board)) {
    if (col.find(value => value === ship)) return false;
  }

  return true;
}
