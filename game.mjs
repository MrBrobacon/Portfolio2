import { print, askQuestion } from "./io.mjs"
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
let isPvCMode = true



const MENU_CHOICES = {
    MENU_CHOICE_START_GAME_PLAYER: 1,
    MENU_CHOICE_START_GAME_COMPUTER: 2,
    MENU_CHOICE_CHANGE_LANGUAGE: 3,
    MENU_CHOICE_EXIT_GAME: 4,
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;


clearScreen();
showSplashScreen(); 
setTimeout(start, 2500);  





async function start() {

    do {

        let chosenAction = NO_CHOICE;
        chosenAction = await showMenu();

        if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_PLAYER) {
            isPvCMode = false
            await runGame();
          } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_COMPUTER) {
            isPvCMode = true
            await runGame();
          } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_CHANGE_LANGUAGE) {
            await changeLanguage();    
          } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_EXIT_GAME) {
            clearScreen();
            process.exit();

        }
        if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_PLAYER || chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_COMPUTER) {
            await runGame();
          }
    } while (true)

}

async function runGame() {

    let isPlaying = true;

    while (isPlaying) { 
        initializeGame(); 
        isPlaying = await playGame(); 
    }
}

async function showMenu() {
  let choice = NO_CHOICE; 
  let validChoice = false; 

  while (!validChoice) {
      
      clearScreen();
      print(ANSI.COLOR.YELLOW + language.MENU_TITLE + ANSI.RESET); 
      print("1. " + language.MENU_PLAY_PLAYER); 
      print("2. " + language.MENU_PLAY_COMPUTER); 
      print("3. " + language.MENU_SETTINGS); 
      print("4. " + language.MENU_EXIT); 

      
      choice = await askQuestion("");

      
      if ([
          MENU_CHOICES.MENU_CHOICE_START_GAME_PLAYER, 
          MENU_CHOICES.MENU_CHOICE_START_GAME_COMPUTER, 
          MENU_CHOICES.MENU_CHOICE_CHANGE_LANGUAGE, 
          MENU_CHOICES.MENU_CHOICE_EXIT_GAME
      ].includes(Number(choice))) {
          validChoice = true;
      }
  }

  return choice;
}
async function changeLanguage() {
    let choice = await askQuestion("Select language: (1) English, (2) Norwegian: ");
    if (choice == "1") {
      language = DICTIONARY.en;
    } else if (choice == "2") {
      language = DICTIONARY.no;
    }
    print(language.LANGUAGE_CHANGED);
    await askQuestion("Trykk på enter for å gå tilbake til menyen")
}


async function playGame() {
    let outcome;
    do {
         clearScreen();
        showGameBoardWithCurrentState(); 
        showHUD(); 
        let move = await getGameMoveFromtCurrentPlayer();
        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
  
      
      if (isPvCMode && currentPlayer == PLAYER_2) {
        let computerMove = getComputerMove(); 
        updateGameBoardState(computerMove);
        outcome = evaluateGameState();
        changeCurrentPlayer(); 
      }
    } while (outcome == 0); 
  
    showGameSummary(outcome); 

    return await askWantToPlayAgain(); 
  }
    
  function getComputerMove() {
    
    let row = Math.floor(Math.random() * GAME_BOARD_SIZE);
    let col = Math.floor(Math.random() * GAME_BOARD_SIZE);
  
    while (gameboard[row][col] !== 0) {
      row = Math.floor(Math.random() * GAME_BOARD_SIZE);
      col = Math.floor(Math.random() * GAME_BOARD_SIZE);
    }
  
    return [row, col];
  }

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    let playAgain = true;
    if (answer && answer.toLowerCase()[0] != language.CONFIRM) {
        playAgain = false;
    }
    return playAgain;
}

function showGameSummary(outcome) {
    clearScreen();
  
    if (outcome == -1) {
      print("Oops, no winner!");
    } else {
      let winningPlayer = (outcome > 0) ? 1 : 2;
      print("Winner is player " + winningPlayer);
      showGameBoardWithCurrentState();
      print("GAME OVER"); }
  
   
  }

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let sum = 0;
    let state = 0;
    let isDraw = true;
  
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
      for (let col = 0; col < GAME_BOARD_SIZE; col++) {
        sum += gameboard[row][col];
      }
      if (Math.abs(sum) == 3) {
        state = sum;
      }
      sum = 0;
    }
  
    for (let col = 0; col < GAME_BOARD_SIZE; col++) {
      for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        sum += gameboard[row][col];
      }
      if (Math.abs(sum) == 3) {
        state = sum;
      }
      sum = 0;
    }
  
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
      sum += gameboard[row][row];
    }
    if (Math.abs(sum) == 3) {
      state = sum;
    }
    sum = 0;
  
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
      sum += gameboard[row][GAME_BOARD_SIZE - row - 1];
    }
    if (Math.abs(sum) == 3) {
      state = sum;
    }
  
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
          if (gameboard[row][col] == 0) {
            isDraw = false;
            break;
          }
        }
      }
    
      if (isDraw && state === 0) {
        return -1; // 
      }
      
    let winner = state / 3;
    return winner;  
  }

function updateGameBoardState(move) {
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromtCurrentPlayer() {
    let position = null;
    do {
        let rawInput = await askQuestion("Place your mark at: ");
        position = rawInput.split(" ");
        position[0] = parseInt(position[0]) - 1;
        position[1] = parseInt(position[1]) - 1;
    } while (isValidPositionOnBoard(position) == false)

    return position
}

function isValidPositionOnBoard(position) {

    if (position.length < 2) {
        
        return false;
    }
    
    let isValidInput = true;
    if (position[0] * 1 != position[0] && position[1] * 1 != position[1]) {
        
        inputWasCorrect = false;
    } else if (position[0] > GAME_BOARD_SIZE && position[1] > GAME_BOARD_SIZE) {
        
        inputWasCorrect = false;
    }
    else if (Number.parseInt(position[0]) != position[0] && Number.parseInt(position[1]) != position[1]) {
        // Position taken.
        inputWasCorrect = false;
    }


    return isValidInput;
}

function showHUD() {
    let playerDescription = "one";
    if (PLAYER_2 == currentPlayer) {
        playerDescription = "two";
    }
    print("Player " + playerDescription + " it is your turn");
}

function showGameBoardWithCurrentState() {
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let rowOutput = "";
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++) {
            let cell = gameboard[currentRow][currentCol];
            if (cell == 0) {
                rowOutput += "   ";
            }
            else if (cell > 0) {
                rowOutput += ANSI.COLOR.BLUE + " X " + ANSI.RESET; 
            } else {
                rowOutput += ANSI.COLOR.RED + " O " + ANSI.RESET; 
            }
            if (currentCol < GAME_BOARD_SIZE - 1) {
                rowOutput += "|";
            }
        }

        print(rowOutput);
        if (currentRow < GAME_BOARD_SIZE - 1) {
            print("---+---+---");
    }
}

}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {

    let newBoard = new Array(GAME_BOARD_SIZE);

    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let row = new Array(GAME_BOARD_SIZE);
        for (let currentColumn = 0; currentColumn < GAME_BOARD_SIZE; currentColumn++) {
            row[currentColumn] = 0;
        }
        newBoard[currentRow] = row;
    }

    return newBoard;

}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}


//#endregion

