let grid = [];
let playerPos = { r: 0, c: 0 };
let gameWon = false;
let history = []; 

function initGame() {
    gameWon = false;
    history = [];
    document.getElementById('win-message').style.display = 'none';
    document.getElementById('btn-next').style.display = 'none';
    
    // levelMap viene del archivo HTML
    grid = levelMap.map(row => row.split(''));
    
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === '@' || grid[r][c] === '+') {
                playerPos = { r, c };
            }
        }
    }
    render();
}

function saveState() {
    history.push({
        grid: grid.map(row => [...row]),
        playerPos: { r: playerPos.r, c: playerPos.c }
    });
}

function undo() {
    if (history.length > 0 && !gameWon) {
        const lastState = history.pop();
        grid = lastState.grid.map(row => [...row]);
        playerPos = { r: lastState.playerPos.r, c: lastState.playerPos.c };
        render();
    }
}

function render() {
    const board = document.getElementById('game-board');
    board.style.gridTemplateColumns = `repeat(${grid[0].length}, 40px)`;
    board.innerHTML = '';

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const char = grid[r][c];

            if (char === '#') cell.classList.add('wall');
            else cell.classList.add('floor');
            if (char === '.' || char === '*' || char === '+') cell.classList.add('goal');
            
            if (char === '$' || char === '*') {
                const box = document.createElement('div');
                box.classList.add('box');
                if (char === '*') box.classList.add('on-goal');
                cell.appendChild(box);
            }
            if (char === '@' || char === '+') {
                const player = document.createElement('div');
                player.classList.add('player');
                cell.appendChild(player);
            }
            board.appendChild(cell);
        }
    }
}

function handleMove(dr, dc) {
    if (gameWon) return;

    let nr = playerPos.r + dr;
    let nc = playerPos.c + dc;

    if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return;
    let target = grid[nr][nc];

    if (target === '#') return;

    if (target === ' ' || target === '.') {
        saveState();
        updatePlayerPos(nr, nc);
    } 
    else if (target === '$' || target === '*') {
        let nnr = nr + dr;
        let nnc = nc + dc;
        if (nnr < 0 || nnr >= grid.length || nnc < 0 || nnc >= grid[0].length) return;
        
        let pushTarget = grid[nnr][nnc];
        if (pushTarget === ' ' || pushTarget === '.') {
            saveState();
            grid[nnr][nnc] = pushTarget === '.' ? '*' : '$';
            grid[nr][nc] = target === '*' ? '.' : ' ';
            updatePlayerPos(nr, nc);
            checkWin();
        }
    }
}

function updatePlayerPos(nr, nc) {
    let currentCell = grid[playerPos.r][playerPos.c];
    grid[playerPos.r][playerPos.c] = currentCell === '+' ? '.' : ' ';
    let newCell = grid[nr][nc];
    grid[nr][nc] = newCell === '.' ? '+' : '@';
    playerPos = { r: nr, c: nc };
    render();
}

function checkWin() {
    let boxesRemaining = false;
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === '$') boxesRemaining = true;
        }
    }
    
    if (!boxesRemaining) {
        gameWon = true;
        const msg = document.getElementById('win-message');
        msg.style.display = 'block';
        
        if (nextLevelUrl) {
            document.getElementById('btn-next').style.display = 'inline-block';
            document.getElementById('btn-next').onclick = () => window.location.href = nextLevelUrl;
        } else {
            msg.innerText = '🏆 ¡Juego Completado! Eres un genio 🏆';
        }
    }
}

// Controles Teclado
window.addEventListener('keydown', (e) => {
    if (gameWon) return;
    let dr = 0, dc = 0;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') dr = -1;
    else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') dr = 1;
    else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') dc = -1;
    else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') dc = 1;
    else if (e.key.toLowerCase() === 'z') { undo(); return; }
    else return; 
    e.preventDefault(); 
    handleMove(dr, dc);
});

// Controles Táctiles
let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: false});

window.addEventListener('touchend', e => {
    if (gameWon || e.target.tagName === 'BUTTON') return;
    let dx = e.changedTouches[0].screenX - touchStartX;
    let dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        Math.abs(dx) > Math.abs(dy) ? handleMove(0, dx > 0 ? 1 : -1) : handleMove(dy > 0 ? 1 : -1, 0);
    }
});

window.onload = initGame;
