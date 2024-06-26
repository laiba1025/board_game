const struct_length = 5;
const ELEMENTS = [
    'img/Item 1.png', 'img/Item 1 - clue_LEFT.png', 'img/Item 1 - clue_RIGHT.png', 'img/Item 1 - clue_DOWN.png', 'img/Item 1 - clue_UP.png',
    'img/Item 2.png', 'img/Item 2 - clue_LEFT.png', 'img/Item 2 - clue_RIGHT.png', 'img/Item 2 - clue_DOWN.png', 'img/Item 2 - clue_UP.png',
    'img/Item 3.png', 'img/Item 3 - clue_LEFT.png', 'img/Item 3 - clue_RIGHT.png', 'img/Item 3 - clue_DOWN.png', 'img/Item 3 - clue_UP.png',
    'img/Hole.png'
];

let hiddenElements = [];
let horizontal_mov, vertical_mov, playerName, T_water, cataches, locates, oasesVisited;
let timerInterval;
let elapsedTime = 0;
let gameDuration = 0;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start-button').addEventListener('click', startExploring);
});

function startExploring() {
    playerName = document.getElementById('player-name').value;
    const gameDurationInput = document.getElementById('game-duration').value;

    if (playerName.trim() === '' || gameDurationInput.trim() === '') {
        alert('Please enter your name and set the game duration.');
        return; 
    }

    gameDuration = parseInt(gameDurationInput);


    if (gameDuration <= 0) {
        alert('Game duration should be greater than 0.');
        return; 
    }

    T_water = 6; 
    cataches = 3;
    locates = 0;
    oasesVisited = 0;

    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';

    startTimer();

    document.getElementById('player_name').innerText = `Name: ${playerName}`;
    document.getElementById('water-supply-display').innerText = T_water;
    document.getElementById('next_remain_action').innerText = cataches;

    initializestruct();
}


function startTimer() {
    timerInterval = setInterval(function () {
        elapsedTime++;
        const remainingTime = gameDuration * 60 - elapsedTime;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('countdown-timer').innerText = `Time Remaining: ${formattedTime}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            endExploration('Game Over - Time Limit Exceeded');
        }
    }, 1000);
}

function initializestruct() {
    const structElement = document.getElementById('struct');
    structElement.innerHTML = '';

    hiddenElements = []; 

    const shuffledElements = ELEMENTS.slice().sort(() => Math.random() - 0.5);
    const placedElements = {};

    for (let row = 0; row < struct_length; row++) {
        for (let col = 0; col < struct_length; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            let placed = false;

            if (shuffledElements.length > 0) {
                const nextElement = shuffledElements.pop();
                if (!nextElement.includes('img/Hole.png') && !placedElements[nextElement]) {
                    hiddenElements.push({ row, col, element: nextElement }); 
                    placedElements[nextElement] = true;
                    placed = true;
                }
            }

            if (!placed) {
                hiddenElements.push({ row, col, element: 'img/Hole.png' });
            }

            structElement.appendChild(cell);
        }
    }

    placePlayerInCenter();
    placeOases();
}

function placePlayerInCenter() {
    horizontal_mov = Math.floor(struct_length / 2);
    vertical_mov = Math.floor(struct_length / 2);
    const playerCell = document.querySelector(`.cell[data-row="${horizontal_mov}"][data-col="${vertical_mov}"]`);
    playerCell.classList.add('player');
}

function placeOases() {
    const oasisPositions = [
        { row: 0, col: 0 },
        { row: struct_length - 1, col: 0 },
        { row: 0, col: struct_length - 1 },
        { row: struct_length - 1, col: struct_length - 1 }
    ];

    let waterCount = 0;

    oasisPositions.forEach(pos => {
        const oasisRow = pos.row;
        const oasisCol = pos.col;

        const oasisCell = document.querySelector(`.cell[data-row="${oasisRow}"][data-col="${oasisCol}"]`);
        oasisCell.classList.add('oasis');

        if (waterCount < 3) {
            oasisCell.classList.add('water');
            waterCount++;
        } else {
            oasisCell.classList.add('drought');
        }
    });
}

function takeAction(action) {
    if (T_water > 0) {
        switch (action) {
            case 'Move':
                movePlayerRandomly();
                break;
            case 'Dig':
                dig();
                break;
            default:
                console.log("This action is not valid!");
        }

        cataches--;

        updateRemainingActionsDisplay();

        if (cataches === 0) {
            T_water--;

            document.getElementById('water-supply-display').innerText = T_water;

            cataches = 3;
            updateRemainingActionsDisplay();
        }
        if (isExplorationOver()) {
            endExploration('Game Over - Water Supply Exhausted');
        }
    }
}

function dig() {
    if (isExplorationOver()) {
        return;
    }

    const currentCell = document.querySelector(`.cell[data-row="${horizontal_mov}"][data-col="${vertical_mov}"]`);

    if (currentCell) {
        currentCell.classList.add('revealed');

        if (currentCell.classList.contains('oasis')) {
            if (currentCell.classList.contains('water')) {
                currentCell.innerHTML = '<img src="img/Oasis.png" alt="Oasis">';
                console.log('You found water in the oasis!');
                T_water = 6;
                document.getElementById('water-supply-display').innerText = T_water;
                cataches = 3;
                updateRemainingActionsDisplay();
            } else if (currentCell.classList.contains('drought')) {
                currentCell.innerHTML = '<img src="img/Drought.png" alt="Drought">';
                console.log('You found a reservoir in the oasis!');
            } else {
                console.error('Error: Oasis does not have water or drought.');
            }
        } else {
            const hiddenElementIndex = hiddenElements.findIndex(element => element.row === horizontal_mov && element.col === vertical_mov);
            if (hiddenElementIndex !== -1) {
                const hiddenElement = hiddenElements.splice(hiddenElementIndex, 1)[0];
                
                const elementImage = hiddenElement.element;
                currentCell.innerHTML = `<img src="${elementImage}" alt="Revealed Element">`;
                console.log('You found a hidden element!');
                currentCell.classList.remove('player');

                if (elementImage === 'img/Item 1.png' || elementImage === 'img/Item 2.png' || elementImage === 'img/Item 3.png') {
                    locates++;

                    if (locates === 3) {
                        endExploration('Congratulations! You found all items. You win!');
                    }
                }
            } else {
                console.log('Nothing found under the sand.');
            }
        }
    } else {
        console.error('currentCell is null!');
    }
}

function movePlayer(newRow, newCol) {
   
    if (isExplorationOver()) {
        return;
    }

    const currentCell = document.querySelector(`.cell[data-row="${horizontal_mov}"][data-col="${vertical_mov}"]`);
    const newCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);

    if (newCell) {
        currentCell.classList.remove('player');
        newCell.classList.add('player');

        horizontal_mov = newRow;
        vertical_mov = newCol;

        reduceRemainingActions();
    }
}

function movePlayerRandomly() {
  
    if (isExplorationOver()) {
        return;
    }

    const possibleMoves = [];
    if (if_move(horizontal_mov - 1, vertical_mov)) possibleMoves.push({ row: horizontal_mov - 1, col: vertical_mov });
    if (if_move(horizontal_mov + 1, vertical_mov)) possibleMoves.push({ row: horizontal_mov + 1, col: vertical_mov });
    if (if_move(horizontal_mov, vertical_mov - 1)) possibleMoves.push({ row: horizontal_mov, col: vertical_mov - 1 });
    if (if_move(horizontal_mov, vertical_mov + 1)) possibleMoves.push({ row: horizontal_mov, col: vertical_mov + 1 });

    if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        movePlayer(randomMove.row, randomMove.col);
    }
}

function isExplorationOver() {
    return locates === 3 || T_water === 0 || elapsedTime >= gameDuration * 60;
}

function if_move(row, col) {
    return row >= 0 && row < struct_length && col >= 0 && col < struct_length;
}

function isOasis(row, col) {
    const oasisCells = document.querySelectorAll('.cell.oasis');
    for (const cell of oasisCells) {
        if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
            return true;
        }
    }
    return false;
}

function endExploration(message) {
    clearInterval(timerInterval); 
    const explorationMessage = document.createElement('div');
    explorationMessage.classList.add('exploration-message');
    explorationMessage.innerText = message;
    document.getElementById('game-container').appendChild(explorationMessage);

    document.getElementById('move-control').disabled = true;
    document.getElementById('dig-control').disabled = true;
}

function restartGame() {

    location.reload();
}

function updateRemainingActionsDisplay() {
    document.getElementById('next_remain_action').innerText = cataches;
}

function reduceRemainingActions() {
    cataches--;
    updateRemainingActionsDisplay();

    if (cataches === 0) {
        T_water--;

        document.getElementById('water-supply-display').innerText = T_water;
        cataches = 3;
        updateRemainingActionsDisplay();
    }


    if (isExplorationOver()) {
        endExploration('Game Over - Water Supply Exhausted');
    }
}


document.addEventListener('keydown', function (event) {
    if (!isExplorationOver()) {
        let newhorizontal_mov = horizontal_mov;
        let newvertical_mov = vertical_mov;
        switch (event.key) {
            case 'ArrowUp':
                newhorizontal_mov = horizontal_mov - 1;
                break;
            case 'ArrowDown':
                newhorizontal_mov = horizontal_mov + 1;
                break;
            case 'ArrowLeft':
                newvertical_mov = vertical_mov - 1;
                break;
            case 'ArrowRight':
                newvertical_mov = vertical_mov + 1;
                break;
        }
      
        if (if_move(newhorizontal_mov, newvertical_mov)) {
            movePlayer(newhorizontal_mov, newvertical_mov);
        }
    }
});

document.getElementById('move-control').addEventListener('click', function () {
    if (!isExplorationOver()) {
        movePlayerRandomly();
    }
});
