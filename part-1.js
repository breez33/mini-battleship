var rs = require('readline-sync');

// Converts user input for Column to index
const getIndex = column => column - 1

const pause = rs.keyInPause('Press any key to start the game.', {
  guide: false,
});

const startGame = () => {
  let gameBoard = initGameBoard(2);
  let gameOver = false;

  console.log('Gameboard initialized: ', gameBoard)

  while(!gameOver) {
    gameBoard = updateGameBoard(gameBoard, [...getNextMove(gameBoard)]);
    console.log('Gameboard move 1: ', gameBoard)
    if(getShipsRemaining(gameBoard) === 0) gameOver = true;
  }

  // Restart game Y/N
  if(rs.keyInYN('You have destroyed all battleships. Would you like to play again?') === true) return startGame();
}

// Game start
startGame();

// Helper functions
function initGameBoard(shipCount) {
  let board = {
    'A': [0, 0, 0],
    'B': [0, 0, 0],
    'C': [0, 0, 0]
  };

  for (let i = 0; i < shipCount; i++) {
    const [rowCoord, colCoord] = generateRandomCoords(Object.entries(board));
    board[rowCoord][colCoord] = 1;
  }

  return board
}

function generateRandomCoords(coordsArray) {
  const coordsList = coordsArray;
  const randCoords = [String.fromCharCode(Math.floor(Math.random() * 3) + 65), Math.floor(Math.random() * 3)];

  // Check if there is already a ship at those coordinates
  if (coordsList.find(([rowCoord, colCoord]) => rowCoord === randCoords[0] && colCoord[randCoords] == 1)) {
    return generateRandomCoords(coordsList);
  }

  return randCoords;
}

function getNextMove(board) {
  const nextMove = rs.question("Enter a location to strike ie 'A2': ", {
    limit: /^[A-C][1-3]$/g,
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

