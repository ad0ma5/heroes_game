
        const gameCanvas = document.getElementById('game-canvas');
        const gameCtx = gameCanvas.getContext('2d');
        const movesPerAttack = 3;
        gameCtx.strokeStyle = 'black';
        const editorCanvas = document.getElementById('editor-canvas');
        const editorCtx = editorCanvas.getContext('2d');
        const selectedStatus = document.getElementById('selected_status');
        const gridSize = 20;
        const cellSize = 40;
        let currentPlayer = 1;
        let players = [newPlayer(1),newPlayer(2)];
        let currentPlayerObj = players[0];
        let selectedUnit = null;
        let gameMap = createEmptyMap();
        let gameUnits = [];
        let mode = 'game';
        let turnCount = 0;

        let dirtSpriteLoaded = false;
        let unitSpriteLoaded = false;

        //ASSETS
        //const dirt = new Image();
        //dirt.src = "dirt.png";

        const dirtSprite = new Image();
        dirtSprite.src = "dirt_sprite.png"; // Your sprite sheet path

        const unitSprite = new Image();
        unitSprite.src = "sprite.png"; // Your sprite sheet path

        dirtSprite.onload = function () {
            dirtSpriteLoaded = true;
            goInit();
        }
        unitSprite.onload = function () {
            unitSpriteLoaded = true;
            goInit();
        }

        function newPlayer(id){
            return {
                id: id,
                money: 0,
                exp: 0,
                level: 1,
            }
        }
        function goInit(){
            if(dirtSpriteLoaded && unitSpriteLoaded){
                // Initialize
                switchMode('game');
                loadMap();
            }
        }
        function createEmptyMap() {
            return Array(gridSize).fill().map(() => Array(gridSize).fill('grass'));
        }

        function switchMode(newMode) {
            mode = newMode;
            document.getElementById('game-container').classList.toggle('active', mode === 'game');
            document.body.classList.toggle('active', mode === 'game');
            document.getElementById('editor-container').classList.toggle('active', mode === 'editor');
            if (mode === 'game') {
                drawGame();
            } else {
                drawEditor();
            }
        }

        const SPRITE_WIDTH = cellSize;
        const SPRITE_HEIGHT = cellSize;
        const DIRT_SPRITE_WIDTH = 90;
        const DIRT_SPRITE_HEIGHT = 90;

        // Example row indexes for each type/player (customize based on your sprite sheet layout)
        const SPRITE_MAP = {
            knight: {
                1: 0, // blue knight row
                2: 1  // red knight row
            },
            archer: {
                1: 2,
                2: 3
            }
        };
        function drawGrid(ctx){

            //console.log('drawGrid', gameMap);
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    ctx.fillStyle = gameMap[y][x] === 'grass' ? '#90EE90' : gameMap[y][x] === 'forest' ? '#228B22' : '#808080';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    if(gameMap[y][x] === 'dirt')
                        ctx.drawImage(
                            dirtSprite,
                            5, 5, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'forest')
                        ctx.drawImage(
                            dirtSprite,
                            490, 5, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'mountain')
                        ctx.drawImage(
                            dirtSprite,
                            300, 595, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'water')
                        ctx.drawImage(
                            dirtSprite,
                            500, 100, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'grass')
                        ctx.drawImage(
                            dirtSprite,
                            825, 5, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'road')
                        ctx.drawImage(
                            dirtSprite,
                            20, 585, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'castle')
                        ctx.drawImage(
                            dirtSprite,
                            5, 780, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'well')
                        ctx.drawImage(
                            dirtSprite,
                            5, 830, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                }
            }
        }
        function drawUnits(ctx){
            gameUnits.forEach(unit => {
                const spriteRow = SPRITE_MAP[unit.type][unit.player];
                const spriteCol = 0; // You can animate later by incrementing this
                const sx = spriteCol * SPRITE_WIDTH;
                const sy = spriteRow * SPRITE_HEIGHT;

                ctx.drawImage(
                    unitSprite,
                    sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT,
                    unit.x * cellSize, unit.y * cellSize,
                    SPRITE_WIDTH, SPRITE_HEIGHT
                );
                //console.log('unit', unit, currentPlayer);
                if(currentPlayer === unit.player){
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(unit.x * cellSize, unit.y * cellSize, cellSize, cellSize);
                    ctx.strokeStyle = 'black';
                }
            });

            //check if currently drawing selected unit
            if (selectedUnit) {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 3;
                ctx.strokeRect(selectedUnit.x * cellSize, selectedUnit.y * cellSize, cellSize, cellSize);
                ctx.strokeStyle = 'black';
            }
        }
        function printUnit(unit){
           return `<ul>
                <li>type=${unit.type} </li>
                <li>movesLeft=${unit.movesLeft} </li>
                <li>health= ${unit.health} </li>
                <li>attack=${unit.attack}</li>
            </ul>`;
        }

        function drawGame() {
            gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            drawGrid(gameCtx);
            drawUnits(gameCtx);
            if(selectedUnit) selectedStatus.innerHTML = printUnit(selectedUnit);
            else selectedStatus.innerHTML = '';
        }

        // Editor Logic
        function drawEditor() {
            editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
            drawGrid(editorCtx);
            drawUnits(editorCtx);
        }

        function checkWin(){
            let count1 = 0;
            let count2 = 0;
            gameUnits.forEach(unit => {
                if(unit.player === 1) count1++;
                else count2++;
            });
            if(count1 ===0){
                alert("player 2 won!!!");
                loadMap();
            }
            if(count2 ===0){
                alert("player 1 won!!!");
                loadMap();
            }

        }
        function getUnitAt(x, y) {
            return gameUnits.find(unit => unit.x === x && unit.y === y);
        }


        gameCanvas.addEventListener('click', (e) => {
            if (mode !== 'game') return;
            const rect = gameCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            const unit = getUnitAt(x, y);
            console.log('click over ', x,y, gameMap[y][x], unit)
            if (unit && unit.player === currentPlayer && !selectedUnit) {
                selectedUnit = unit;
                drawGame();
            } else if (selectedUnit) {
                let movesToDo = Math.abs(selectedUnit.x - x) + Math.abs(selectedUnit.y - y);
                        console.log('it will move',selectedUnit, movesToDo);
                if (unit && unit.player !== currentPlayer ) {
                    // Attack
                    if( movesPerAttack <= selectedUnit.movesLeft){
                        unit.health -= selectedUnit.attack;
                        selectedUnit.movesLeft -= movesPerAttack;
                        if (unit.health <= 0) {
                            gameUnits = gameUnits.filter(u => u !== unit);
                            checkWin();
                        }

                    }
                } else if (!unit &&  movesToDo <= selectedUnit.move ) {

                    // Move if terain allows
                    if(
                        (
                        gameMap[y][x] === "castle" || 
                        gameMap[y][x] === "grass" || 
                        gameMap[y][x] === "road" || 
                        gameMap[y][x] === "dirt") && movesToDo <= selectedUnit.movesLeft
                    ){

                        selectedUnit.x = x;
                        selectedUnit.y = y;
                        selectedUnit.movesLeft -= movesToDo;
                        console.log('it moved',selectedUnit);
                    }

                }
                selectedUnit = null;

                drawGame();
            }else{
                let pass = "passable terrain";
                if(["grass","dirt","road","castle"].indexOf(gameMap[y][x]) === -1)
                    pass =  "non"+pass;
                let punit = '';
                if(unit) punit = printUnit(unit);
                selectedStatus.innerHTML = JSON.stringify(gameMap[y][x])+ " is "+pass +" "+ punit;
            }
        });

        function endTurn() {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            currentPlayerObj = players[currentPlayer-1];
            selectedUnit = null;
            // refill moves left for units
            gameUnits.forEach(unit => {
                unit.movesLeft = unit.type === 'knight' ? 5 : 6
            });

            if(currentPlayer === 1) turnCount++;
            document.getElementById('status').textContent = `Player ${currentPlayer}'s Turn, turnCount=${turnCount} ${printPlayer(currentPlayerObj)}`;
            drawGame();
        }
        function printPlayer(player){
            return `\nMoney:${currentPlayerObj.money} exp:${currentPlayerObj.exp}`;
        }
            

        function loadMap() {
                console.log('load?');
            const savedMap = localStorage.getItem('gameMap');
            const savedUnits = localStorage.getItem('gameUnits');
            if (savedMap && savedUnits) {
                console.log('load saved?');
                gameMap = JSON.parse(savedMap);
                gameUnits = JSON.parse(savedUnits);
                drawGame();
            }else{

                console.log('preload?');

                fetch("game.json")
                  .then(response => response.json())
                  .then(savedMap => { 
                        console.log(savedMap) 
                        gameMap = savedMap;
                        drawGame();
                   });
                fetch("units.json")
                  .then(response => response.json())
                  .then(savedUnits => { 
                        console.log(savedUnits) 
                        gameUnits = savedUnits;
                        drawGame();
                   });
            }
        }


        editorCanvas.addEventListener('click', (e) => {
            if (mode !== 'editor') return;
            const rect = editorCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            const terrain = document.getElementById('terrain-type').value;
            const unitType = document.getElementById('unit-type').value;
            const player = parseInt(document.getElementById('player-type').value);
            gameMap[y][x] = terrain;
            if (unitType !== 'none') {
                gameUnits = gameUnits.filter(unit => unit.x !== x || unit.y !== y);
                if (player !== 0) {
                    gameUnits.push({
                        x, y, type: unitType, player,
                        health: unitType === 'knight' ? 100 : 50,
                        attack: unitType === 'knight' ? 20 : 10,
                        move: unitType === 'knight' ? 1 : 2,
                        movesLeft: unitType === 'knight' ? 5 : 6
                    });
                }
            } else {
                gameUnits = gameUnits.filter(unit => unit.x !== x || unit.y !== y);
            }
            drawEditor();
        });

        function saveMap() {
            localStorage.setItem('gameMap', JSON.stringify(gameMap));
            localStorage.setItem('gameUnits', JSON.stringify(gameUnits));
            alert('Map saved!');
        }

        function clearMap() {
            gameMap = createEmptyMap();
            gameUnits = [];
            drawEditor();
        }

///////////////////////////////////////

        const animeCanvas = document.getElementById('anime-canvas');
        const animeCtx = animeCanvas.getContext('2d');
        const sprite = new Image();
        sprite.src = "sprite_ai.png"; // Make sure this path is correct or serve it locally

        // Sprite settings
        const frameWidth = 164;
        const frameHeight = 180;
        const framesPerRow = 6; // You can count the number of frames in a row
        const rowIndex = 3; // For example: 8th row (choose based on which character to animate)
        const totalFrames = 6

        let currentFrame = 0;
        const animationSpeed = 100; // milliseconds between frames

        sprite.onload_ = function () {
            setInterval(() => {
                animeCtx.clearRect(0, 0, animeCanvas.width, animeCanvas.height);
                drawGame();

                const sx = 25+ (currentFrame * frameWidth);
                const sy = (rowIndex * frameHeight);

                animeCtx.drawImage(sprite, sx, sy, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);

                currentFrame = (currentFrame + 1) % totalFrames;
            }, animationSpeed);
        };
