
        const passableTerrain = [
                "grass","dirt","road","stoneroad","castle","shipyard","well","goldmine","bridge"        
        ];
        const unitsBlueprint = {
            "knight": {
                "x":0,"y":0,
                "type":"knight",
                "health":100,
                "attack":20,
                "move":1,
                "movesLeft":5,
                "player":0,
                "gold": 10
            },
            "archer": {
                "x":0,"y":0,
                "type":"archer",
                "health":50,
                "attack":10,
                "move":2,
                "movesLeft":6,
                "player":0,
                "gold": 5
            },
            "goblin": {
                "x":0,"y":0,
                "type":"goblin",
                "health":70,
                "attack":15,
                "move":1,
                "movesLeft":4,
                "player":0,
                "gold": 15
            },
            "coin": {
                "x":0,"y":0,
                "type":"coin",
                "health":0,
                "attack":0,
                "move":0,
                "movesLeft":0,
                "player":0,
                "gold": 50
            }
        };

        const gameCanvas = document.getElementById('game-canvas');
        const gameCtx = gameCanvas.getContext('2d');
        const movesPerAttack = 3;
        gameCtx.strokeStyle = 'black';
        const editorCanvas = document.getElementById('editor-canvas');
        const editorCtx = editorCanvas.getContext('2d');
        const selectedStatus = document.getElementById('selected_status');
        const castleMenu = document.getElementById('castle_menu');
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

        function showOverlay(msg){
            const over = document.querySelector("#overlay p");
            over.innerHTML = msg;
            over.parentNode.style.display = "block";
        }

        function buy(type){
            const price = unitsBlueprint[type].health*10;
            if(selectedUnit.gold >= price){
                selectedUnit.gold -= price;
                let unitObj = Object.assign({}, unitsBlueprint[type]);
                unitObj.player = currentPlayer;
                unitObj.x = selectedUnit.x+1;
                unitObj.y = selectedUnit.y;
                gameUnits.push(unitObj);
                drawUnits(gameCtx);
                alert('bought');
            }else{
                alert('come back when you have '+price+'. you have only '+selectedUnit.gold );
            }
        }
        function isPassableTerrain(terrain){
            if(passableTerrain.indexOf(terrain) === -1) return false;
            return true;
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
                showOverlay("Turn for Player "+currentPlayer);
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
                0: 6, // blue knight row
                1: 0, // blue knight row
                2: 1  // red knight row
            },
            archer: {
                0: 7, // blue knight row
                1: 2,
                2: 3
            },
            goblin:{
                0: 8, // blue knight row
                1: 4,
                2: 5
            },
            coin:{
                0: 9
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
                    else if(gameMap[y][x] === 'stoneroad')
                        ctx.drawImage(
                            dirtSprite,
                            100, 485, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
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
                    else if(gameMap[y][x] === 'goldmine')
                        ctx.drawImage(
                            dirtSprite,
                            50, 777, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'shipyard')
                        ctx.drawImage(
                            dirtSprite,
                            50, 825, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'lava')
                        ctx.drawImage(
                            dirtSprite,
                            685, 300, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'ice')
                        ctx.drawImage(
                            dirtSprite,
                            685, 200, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
                            x * cellSize, y* cellSize,
                            DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT
                        );
                    else if(gameMap[y][x] === 'bridge')
                        ctx.drawImage(
                            dirtSprite,
                            5, 870, DIRT_SPRITE_WIDTH, DIRT_SPRITE_HEIGHT,
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
                const px = unit.x * cellSize;
                const py = unit.y * cellSize;
                // Draw health bar above unit
                const barWidth = cellSize - 4;
                const barHeight = 6;
                const hpRatio = unit.health / unitsBlueprint[unit.type].health;
                const mvRatio = unit.movesLeft / unitsBlueprint[unit.type].movesLeft;

                if(unit.health > 0){
                gameCtx.fillStyle = 'black';
                gameCtx.fillRect(px + 2, py , barWidth, barHeight);
                gameCtx.fillStyle = hpRatio > 0.5 ? 'green' : hpRatio > 0.25 ? 'orange' : 'red';
                gameCtx.fillRect(px + 2, py, barWidth * hpRatio, barHeight);
                }
                // Draw move bar
                if(unit.movesLeft > 0){
                gameCtx.fillStyle = 'black';
                gameCtx.fillRect(px + 2, py + cellSize - barHeight, barWidth, barHeight);
                gameCtx.fillStyle = mvRatio > 0.5 ? 'yellow' : mvRatio > 0.25 ? 'blue' : 'grey';
                gameCtx.fillRect(px + 2, py + cellSize - barHeight, barWidth * mvRatio, barHeight);
                }
                //console.log('unit', unit, currentPlayer);
                if(currentPlayer === unit.player){
                    if(unit.movesLeft === 0 ) 
                        ctx.strokeStyle = 'red';
                    else
                        ctx.strokeStyle = 'orange';
                    ctx.lineWidth = 5;
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
                <li>player=${unit.player}</li>
                <li>gold=${unit.gold}</li>
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
            console.log('checking win 1=',count1,'2=',count2);
            if(count1 ===0){
                alert("player 2 won!!!");
                reinit();
                loadMap();
            }
            if(count2 ===0){
                alert("player 1 won!!!");
                reinit();
                loadMap();
            }

        }
        function reinit(){
            currentPlayer = 1;
            currentPlayerObj = players[currentPlayer];
            turnCount = 0;
            document.getElementById('status').textContent = printPlayer(currentPlayerObj);
            gameUnits.forEach(unit => {
                let unitObj = Object.assign({}, unitsBlueprint[unit.type]);
                unitObj.x = unit.x;
                unitObj.y = unit.y;
                unit = unitObj;
            });
        }
        function getUnitAt(x, y) {
            return gameUnits.find(unit => unit.x === x && unit.y === y);
        }

        function printCastleMenu(){
            console.log('menu for unit ',selectedUnit, ' player', currentPlayer);
            castleMenu.style.display = "block";
        }

        gameCanvas.addEventListener('click', (e) => {
            castleMenu.style.display = "none";
            if (mode !== 'game') return;
            const rect = gameCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            const unit = getUnitAt(x, y);
            console.log('click over ', x,y, gameMap[y][x], unit)
            if (unit && unit.player === currentPlayer && !selectedUnit) {
                if(!unit.gold) unit.gold = 0;
                selectedUnit = unit;
                if(gameMap[y][x] === "castle"){
                    //this unit is inside castle so lets present on usin select menu
                    printCastleMenu();
                }
                drawGame();
            } else if (selectedUnit) {
                let movesToDo = Math.abs(selectedUnit.x - x) + Math.abs(selectedUnit.y - y);
                        console.log('it will move',selectedUnit, movesToDo);
                if (unit && unit.player !== currentPlayer ) {
                    if(!unit.gold) unit.gold = 0;
                        console.log('it will attack',selectedUnit, movesToDo);
                    // Attack
                    if( unit.health === 0 && selectedUnit.movesLeft >= movesToDo){
                        selectedUnit.movesLeft -= movesToDo;
                        selectedUnit.x = x;
                        selectedUnit.y = y;
                        selectedUnit.gold += unit.gold;
                        gameUnits = gameUnits.filter(u => u !== unit);
                    }
                    else if( movesPerAttack <= selectedUnit.movesLeft ){
                        unit.health -= selectedUnit.attack;
                        selectedUnit.movesLeft -= movesPerAttack;
                        if (unit.health <= 0) {
                            selectedUnit.x = x;
                            selectedUnit.y = y;
                            selectedUnit.gold += unit.gold;
                            gameUnits = gameUnits.filter(u => u !== unit);
                            checkWin();
                        }

                    }
                } else if (!unit &&  movesToDo <= selectedUnit.move ) {

                    // Move if terain allows
                    if(
                        isPassableTerrain(gameMap[y][x]) && movesToDo <= selectedUnit.movesLeft
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
                if(!isPassableTerrain(gameMap[y][x]))
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
                unit.movesLeft = unitsBlueprint[unit.type].movesLeft;
                if(gameMap[unit.y][unit.x] === "well"){
                    console.log('you are on the well');
                    unit.health += 10;
                    if(unit.health > unitsBlueprint[unit.type].health){ unit.health = unitsBlueprint[unit.type].health; }
                }
                if(gameMap[unit.y][unit.x] === "goldmine"){
                    console.log('you are on the goldmine');
                    unit.gold += 5;
                    if(unit.type === "goblin"){
                        unit.gold += 20;
                    }
                }
                if(gameMap[unit.y][unit.x] === "castle"){
                    console.log('you are on the castle and if you have enough money you will gain one more unit');
                    
                }
            });
            if(currentPlayer === 1) turnCount++;
            document.getElementById('status').textContent = printPlayer(currentPlayerObj);
            drawGame();
            showOverlay("Turn for Player "+currentPlayer);
        }
        function printPlayer(player){
            return `Player ${currentPlayer}'s Turn, turnCount=${turnCount} \nMoney:${player.money} exp:${{player}.exp}`;
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
                showOverlay("Turn for Player "+currentPlayer);
            }else{

                console.log('preload?');

                fetch("heroes.json")
                  .then(response => response.json())
                  .then(saved => { 
                        console.log(saved) 
                        gameMap = saved.map;
                        gameUnits = saved.units;
                        drawGame();
                        showOverlay("Turn for Player "+currentPlayer);
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
                //if (player !== 0) {
                //let clone = Object.assign({}, userDetails)
                let unitObj = Object.assign({}, unitsBlueprint[unitType]);
                unitObj.x = x;
                unitObj.y = y;
                unitObj.player = player;
                gameUnits.push(unitObj);
                console.log('editor',unitObj,gameUnits);
                /*
                    gameUnits.push({
                        x, y, type: unitType, player,
                        health: unitType === 'knight' ? 100 : 50,
                        attack: unitType === 'knight' ? 20 : 10,
                        move: unitType === 'knight' ? 1 : 2,
                        movesLeft: unitType === 'knight' ? 5 : 6
                    });
                */
                //}
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

        function downloadMap(){
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({map:gameMap,units:gameUnits}));
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "heroes.json");
            dlAnchorElem.click();
        }
        async function readText(event) {
          const file = event.target.files.item(0)
          const text = await file.text();
          
            const obj = JSON.parse(text);
            if (obj.map) gameMap = obj.map;
            if (obj.units) gameUnits = obj.units;
            console.log(obj);
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
