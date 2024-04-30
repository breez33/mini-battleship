var rs = require('readline-sync');

const ships = [5, 4, 3, 3.1, 2];
// Player or Computer
let playerBoard = {};
let computerBoard = {};
let playersTurn = true;
let activeBoard = playerBoard;

// Utils
const getIndex = column => column - 1;
const randomNumInRange = maxNum => Math.floor(Math.random() * maxNum);


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
    takeTurn(activeBoard);
    if (calcShipsRemaining(activeBoard) === 0) gameOver = true;

    playersTurn = !playersTurn;
    activeBoard = playersTurn ? playerBoard : computerBoard;
  }

  // Restart game Y/N
  if (rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) {
    playersTurn = true;
    activeBoard = playerBoard;
    return main();
  }
}

function initBoard(gridSize, board) {
  // Clear board when new game started
  if (Object.keys(board).length) clearBoard(board);

  for (let i = 0; i < gridSize; i++) {
    board[String.fromCharCode(65 + i)] = '0'.repeat(gridSize).split('').map(Number);
  }
}

function clearBoard(board) {
  for (const row in board) {
    delete board[row];
  }
}

function placeShips(board) {
  for (let shipLength of ships) {
    let shipCoords = generateShipCoords(shipLength);
    for ([row, col] of shipCoords) {
        board[row][col] = shipLength;
    }
  }
}

function generateShipCoords(length) {
  const shipLength = Math.floor(length);
  const axisValues = ['x', 'y'];
  const directionValues = [-1, 1];
  
  const [startRow, startCol] = generateRandomCoord();
  const direction = directionValues[randomNumInRange(1)];
  const axis = axisValues[randomNumInRange(1)];
  const coordsArray = [[startRow, startCol]];
  
  if (axis === 'x') {
    for (let i = 1; i < shipLength; i++) {
      const nextCol = startCol + (i * direction);
      coordsArray.push([startRow, nextCol]);
    }
  } else {
    for (let i = 1; i < shipLength; i++) {
        const nextRow = String.fromCharCode(startRow.codePointAt(0) + i);
        coordsArray.push([nextRow, startCol]);
    }
  }
  
  if (!isValidCoords(coordsArray)) return generateShipCoords(length);
 
  return coordsArray;
}

function generateRandomCoord() {
  const gridSize = Object.keys(activeBoard).length;
  const randomRow = String.fromCharCode(65 + randomNumInRange(gridSize));
  const randomCol = randomNumInRange(gridSize);

  if (!playersTurn && !isValidCoords([[randomRow, randomCol]])) return generateRandomCoord();

  return [randomRow, randomCol];
}

// Check if there is already a ship at specific coordinates
function isValidCoords(coords) {
  const rowsArray = Object.keys(activeBoard);
  const colsArray = Object.values(activeBoard).map((_, index) => index);
  
  for (let [row, col] of coords) {
    if (!playersTurn && [1,9].includes(activeBoard[row][col])) {
      // Computer has already chosen location
      return false;
    } else if (playersTurn && (!rowsArray.includes(row) || !colsArray.includes(col)  || activeBoard[row][col])) {
      return false;
    }
  }

  return true;
}

function drawBoard() {
  const boardArray = Object.entries(activeBoard);
  const gridSize = boardArray.length;
  const divider = '   -' + '------'.repeat(gridSize);
  let header = "   ";

  console.clear();
  // Log column numbers
  for (let i = 1; i <= gridSize; i++){
    header += `   ${i}  `;
  }
  console.log(header);
  console.log(divider);

  // Log each row
  for (let [row, col] of boardArray) {
    let rowStr = `${row}  |`
    for (let value of col) {
        if (value === 1) {
            rowStr += `  O  |`;
        } else if (value === 9) {
            rowStr += `  X  |`;
        } else {
            rowStr += `     |`;
        }
    }
    console.log(rowStr);
    console.log(divider);
  }
}

function takeTurn() {
  if (playersTurn) drawBoard();

  let nextMove = playersTurn ? getNextMove() : generateRandomCoord();
  updateBoard(nextMove);
}

function getNextMove() {
  const maxRowLetter = String.fromCharCode(Math.floor(64 + (Object.keys(activeBoard).length)));
  const regexString = `^[A-${maxRowLetter}][1-9]|[A-${maxRowLetter}]10$`;
  const regex = new RegExp(regexString, "i");

  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: regex,
    limitMessage: "Invalid coordinates. Please use this format: 'A2'"
  })
  const [row, col] = nextMove.toUpperCase().split(/^([a-zA-Z])(\d+)/).slice(1);
  const valueAtCoords = activeBoard[row][getIndex(col)];

  // Location has already been chosen - 1: Previous Miss or 9: Previous Hit
  if (valueAtCoords === 1 || valueAtCoords === 9) {
    console.log('This location has already been chosen.');
    return getNextMove();
  }

  return [row, col];
}

function updateBoard(coords) {
  const [row, col] = coords;
  const valueAtCoords = activeBoard[row][playersTurn ? getIndex(col) : col];
  let currentValue = 0;

  if (valueAtCoords === 0) {            // Location is empty (0): Miss
    activeBoard[row][getIndex(col)] = 1;
    currentValue = 1;
  } else if (valueAtCoords > 1) {      // Location has a ship that hasn't already been selected (1-5): Hit
    activeBoard[row][getIndex(col)] = 9;
    currentValue = 9;
  } else {
    console.log('There was an issue updating the board! Try again');
    return;
  }

  notifyPlayer(valueAtCoords, currentValue);
}

function notifyPlayer(shipValue, currentValue) {
  const isSunk = isShipSunk(shipValue);
  const computerHitConfirmation = `${isSunk ? 'Hit. Your battleship has been sunk.' : 'Hit.'}`;
  const playerHitConfirmation = `${isSunk ? 'Hit. You have sunk a battleship.' : 'Hit.'}`;
  const activePlayerString = playersTurn ? playerHitConfirmation : computerHitConfirmation;
  const shipsRemainingStr = `${calcShipsRemaining() === 1 ? `1 ship` : `${calcShipsRemaining()} ships`} remaining.`;

  console.clear();
  if (playersTurn) {
    drawBoard();
  } else {
    console.log('The computer takes a turn...');
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
                                                                                                                                                               
  `);
  }

  const pause = rs.keyInPause(`${currentValue === 9 ? activePlayerString : 'Miss.'} ${shipsRemainingStr} (Presse any key to pass turn)`, {
    guide: false
  });
}

function calcShipsRemaining() {
  return ships.reduce((shipsRemaining, ship) => {
    for (let [_, col] of Object.entries(activeBoard)) {
      if (col.find(value => value === ship)) return shipsRemaining += 1;
    }
    
    return shipsRemaining;
  }, 0);
}

function isShipSunk(ship) {
  for (let [_, col] of Object.entries(activeBoard)) {
    if (col.find(value => value === ship)) return false;
  }

  return true;
}
