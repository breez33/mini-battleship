var rs = require('readline-sync');

const ships = [5, 4, 3, 3.1, 2];
// Player or Computer
let playerBoard = {};
let computerBoard = {};
let playersTurn = true;

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * (maxNum +1));


// Game start
main();

// Game Logic
function main() {
  const pause = rs.keyInPause(`
  _______    ______   ________  ________  __        ________   ______   __    __  ______  _______  
 /       \\  /      \\ /        |/        |/  |      /        | /      \\ /  |  /  |/      |/       \\ 
 $$$$$$$  |/$$$$$$  |$$$$$$$$/ $$$$$$$$/ $$ |      $$$$$$$$/ /$$$$$$  |$$ |  $$ |$$$$$$/ $$$$$$$  |
 $$ |__$$ |$$ |__$$ |   $$ |      $$ |   $$ |      $$ |__    $$ \\__$$/ $$ |__$$ |  $$ |  $$ |__$$ |
 $$    $$< $$    $$ |   $$ |      $$ |   $$ |      $$    |   $$      \\ $$    $$ |  $$ |  $$    $$/ 
 $$$$$$$  |$$$$$$$$ |   $$ |      $$ |   $$ |      $$$$$/     $$$$$$  |$$$$$$$$ |  $$ |  $$$$$$$/  
 $$ |__$$ |$$ |  $$ |   $$ |      $$ |   $$ |_____ $$ |_____ /  \\__$$ |$$ |  $$ | _$$ |_ $$ |      
 $$    $$/ $$ |  $$ |   $$ |      $$ |   $$       |$$       |$$    $$/ $$ |  $$ |/ $$   |$$ |      
 $$$$$$$/  $$/   $$/    $$/       $$/    $$$$$$$$/ $$$$$$$$/  $$$$$$/  $$/   $$/ $$$$$$/ $$/       
                                                                                                   

  Press any key to start the game.`, {
    guide: false
  });
  
  let gameOver = false;

  initBoard(10, playerBoard);
  initBoard(10, computerBoard);
  placeShips(playerBoard);
  placeShips(computerBoard);

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
  const randomRow = String.fromCharCode(65 + randomNumInRange(gridSize - 1));
  const randomCol = randomNumInRange(gridSize);

  if (!playersTurn && !isValidCoords(board, [[randomRow, randomCol]])) generateRandomCoord(board, gridSize);

  return [randomRow, randomCol];
}

// Check if there is already a ship at specific coordinates
function isValidCoords(board, coords) {
  const rowsArray = Object.keys(board)
  const colsArray = Object.values(board).map((_, index) => index)
  
  for (let [row, col] of coords) {
    if (!playersTurn && [1,9].includes(board[row][col])) {
      // Computer has already chosen location
      return false;
    } else if (playersTurn && (!rowsArray.includes(row) || !colsArray.includes(col)  || board[row][col])) {
      return false;
    }
  }

  return true;
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
  if (playersTurn) drawBoard(board);

  let nextMove = playersTurn ? getNextMove(board) : generateRandomCoord(board, Object.keys(board).length);
  updateBoard(board, nextMove);
}

function getNextMove(board) {
  const maxRowLetter = String.fromCharCode(Math.floor(65 + (board['A'].length - 1)))
  const regexString = `^[a-${maxRowLetter.toLowerCase()}A-${maxRowLetter}][1-9]|10$`
  const regex = new RegExp(regexString)

  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = nextMove.toUpperCase().split(/^([a-zA-Z])(\d+)/).slice(1)
  const valueAtCoords = board[row][getIndex(col)]

  // Location has already been chosen - 1: Previous Miss or 9: Previous Hit
  if (valueAtCoords === 1 || valueAtCoords === 9) return getNextMove(board);

  return [row, col];
}

function updateBoard(board, coords) {
  const [row, col] = coords;
  const valueAtCoords = board[row][playersTurn ? getIndex(col) : col];
  let updatedValue = 0

  if (valueAtCoords === 0) {            // Location is empty (0): Miss
    board[row][getIndex(col)] = 1;
    updatedValue = 1;
  } else if (valueAtCoords > 1) {      // Location has a ship that hasn't already been selected (1-5): Hit
    board[row][getIndex(col)] = 9;
    updatedValue = 9;
  } else {
    console.log('There was an issue updating the board! Try again')
    return;
  }

  notifyPlayer(board, valueAtCoords, updatedValue);
}

function notifyPlayer(board, shipValue, currentValue) {
  const isSunk = isShipSunk(board, shipValue);
  const computerHitConfirmation = `${isSunk ? 'Hit. Your battleship has been sunk.' : 'Hit.'}`
  const playerHitConfirmation = `${isSunk ? 'Hit. You have sunk a battleship.' : 'Hit.'}`
  const activePlayerString = playersTurn ? playerHitConfirmation : computerHitConfirmation;
  const shipsRemainingStr = `${calcShipsRemaining(board) === 1 ? `1 ship` : `${calcShipsRemaining(board)} ships`} remaining.`

  console.clear();
  if (playersTurn) {
    drawBoard(board);
  } else {
    console.log('The computer takes a turn...')
    console.log(`
    __       __  ______   ______    ______   ______  __        ________ 
   /  \\     /  |/      | /      \\  /      \\ /      |/  |      /        |
   $$  \\   /$$ |$$$$$$/ /$$$$$$  |/$$$$$$  |$$$$$$/ $$ |      $$$$$$$$/ 
   $$$  \\ /$$$ |  $$ |  $$ \\__$$/ $$ \\__$$/   $$ |  $$ |      $$ |__    
   $$$$  /$$$$ |  $$ |  $$      \\ $$      \\   $$ |  $$ |      $$    |   
   $$ $$ $$/$$ |  $$ |   $$$$$$  | $$$$$$  |  $$ |  $$ |      $$$$$/    
   $$ |$$$/ $$ | _$$ |_ /  \\__$$ |/  \\__$$ | _$$ |_ $$ |_____ $$ |_____ 
   $$ | $/  $$ |/ $$   |$$    $$/ $$    $$/ / $$   |$$       |$$       |
   $$/      $$/ $$$$$$/  $$$$$$/   $$$$$$/  $$$$$$/ $$$$$$$$/ $$$$$$$$/ 
   __         ______   __    __  __    __   ______   __    __  ________  _______  
  /  |       /      \\ /  |  /  |/  \\  /  | /      \\ /  |  /  |/        |/       \\ 
  $$ |      /$$$$$$  |$$ |  $$ |$$  \\ $$ |/$$$$$$  |$$ |  $$ |$$$$$$$$/ $$$$$$$  |
  $$ |      $$ |__$$ |$$ |  $$ |$$$  \\$$ |$$ |  $$/ $$ |__$$ |$$ |__    $$ |  $$ |
  $$ |      $$    $$ |$$ |  $$ |$$$$  $$ |$$ |      $$    $$ |$$    |   $$ |  $$ |
  $$ |      $$$$$$$$ |$$ |  $$ |$$ $$ $$ |$$ |   __ $$$$$$$$ |$$$$$/    $$ |  $$ |
  $$ |_____ $$ |  $$ |$$ \\__$$ |$$ |$$$$ |$$ \\__/  |$$ |  $$ |$$ |_____ $$ |__$$ |
  $$       |$$ |  $$ |$$    $$/ $$ | $$$ |$$    $$/ $$ |  $$ |$$       |$$    $$/ 
  $$$$$$$$/ $$/   $$/  $$$$$$/  $$/   $$/  $$$$$$/  $$/   $$/ $$$$$$$$/ $$$$$$$/  
                                                                                                                                                               
  `)
  }

  const pause = rs.keyInPause(`${currentValue === 9 ? activePlayerString : 'Miss.'} ${shipsRemainingStr} (Presse any key to pass turn)`, {
    guide: false
  });
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
