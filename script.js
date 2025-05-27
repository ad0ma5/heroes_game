
const showCoords = false;
const passableTerrain = [
    "grass","dirt","road","stoneroad","desert","castle","tavern","well","goldmine","bridge"        
];
const defaultMaps = ["heroes","heroes1","heroes2", "heroes6"];
const terrainDescriptions = {
    road: "move 2x",
    stoneroad: "move 2x",
    castle: "can recruit units",
    well: "can heal",
    bridge: "can cross river",
    goldmine: "can dig 5gold, goblins dig 20gold"
};
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
const input_map_name = document.querySelector('#map_name');
const map_menu = document.querySelector('#map_menu');
const menu = document.getElementById('menu');
const editormenu = document.getElementById('editor-controls');
const gridSize = 20;
const cellSize = 40;
let currentPlayer = 1;
let players = [newPlayer(0), newPlayer(1), newPlayer(2)];
let currentPlayerObj = players[0];
let selectedUnit = null;
let gameMap = createEmptyMap();
let gameUnits = [];
let mapList = [];
let mode = 'game';
let turnCount = 0;
let currentMapName = '';

let dirtSpriteLoaded = false;
let unitSpriteLoaded = false;

//ASSETS
//const dirt = new Image();
//dirt.src = "dirt.png";

const dirtSprite = new Image();
dirtSprite.src = "dirt_sprite.png"; // Your sprite sheet path

const dirtSpriteNew = new Image();
dirtSpriteNew.src = "dirt_sprite_new.png"; // Your sprite sheet path

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
function toggleControls(){
    if(editormenu.style.display === 'none')
        editormenu.style.display = 'inline-block';
        else
        editormenu.style.display = 'none';
}
function toggleMenu(){
    if(menu.style.display === 'none')
        menu.style.display = 'inline-block';
        else
        menu.style.display = 'none';
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
        //alert('You have bought '+type);

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
        //money: 0,
        //exp: 0,
        //level: 1,
    }
}
function goInit(){
    if(dirtSpriteLoaded && unitSpriteLoaded){
        console.log('goInit');
        // Initialize
        switchMode('game');
        defaultLoad();
        //    loadMap();
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
        map_name.value = currentMapName;
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
const DIRT_SPRITE_MAP = {
    dirt: [0,0],
    grass: [0,1],
    road: [0,2],
    stoneroad: [0,3],
    desert: [0,4],

    lava: [1,0],
    ice: [1,1],
    forest: [1,2],
    mountain: [1,3],
    water: [1,4],

    castle: [2,0],
    well: [2,1],
    goldmine: [2,2],
    tavern: [2,3],
    bridge: [2,4]
};

function drawGrid(ctx){
    // Draw terrain
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const tile = gameMap[y][x];
            const sprite = DIRT_SPRITE_MAP[tile];
            const sx = sprite[1] * SPRITE_WIDTH ;
            const sy = sprite[0] * SPRITE_HEIGHT ;

            ctx.drawImage(
                dirtSpriteNew,
                sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT,
                x * cellSize, y * cellSize,
                SPRITE_WIDTH, SPRITE_HEIGHT
            );

            ctx.strokeStyle = '#00000033';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if(showCoords){
                ctx.fillStyle = 'black';
                ctx.font = '10px monospace';
                ctx.fillText(`${x},${y}`, x * cellSize + 2, y * cellSize + 12);
            }
        }
    }

}

function drawUnits(ctx){
    //check if currently drawing selected unit
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
        const barHeight = 2;
        const hpRatio = unit.health / unitsBlueprint[unit.type].health;
        const mvRatio = unit.movesLeft / unitsBlueprint[unit.type].movesLeft;

        //console.log('unit', unit, currentPlayer);
        if(currentPlayer === unit.player){
            if(unit.movesLeft === 0 ) 
                ctx.strokeStyle = 'red';
                else if (unit.player === 1)
                    ctx.strokeStyle = 'blue';
                    else
                    ctx.strokeStyle = 'magenta';

        }else{

            if (unit.player === 1)
                ctx.strokeStyle = 'lightblue';
                else if (unit.player === 2)
                    ctx.strokeStyle = 'pink';
        }
        if(unit.type !== 'coin'){
            if(unit.player === 0)
                ctx.lineWidth = 1;
            else
                ctx.lineWidth = 2;
            ctx.strokeRect( (unit.x * cellSize), (unit.y * cellSize), cellSize-2, cellSize-2);
            ctx.strokeStyle = 'black';
        }

        //if(unit.health > 0){
        if(unit.type !== 'coin'){
            gameCtx.fillStyle = 'black';
            gameCtx.fillRect(px + 2, py+2 , barWidth, barHeight+1);
            gameCtx.fillStyle = hpRatio > 0.5 ? 'lightgreen' : hpRatio > 0.25 ? 'orange' : 'red';
            gameCtx.fillRect(px + 2, py+2, barWidth * hpRatio, barHeight);
        }
        // Draw move bar
        if(unit.type !== 'coin'){
            gameCtx.fillStyle = 'black';
            gameCtx.fillRect(px + 2, py + cellSize - barHeight-4, barWidth, barHeight+1);
            gameCtx.fillStyle = mvRatio > 1 ? 'pink' : mvRatio > 0.5 ? 'yellow' : mvRatio > 0.25 ? 'orange' : 'red';
            if(mvRatio > 1) 
                gameCtx.fillRect(px + 2, py + cellSize - barHeight-4, barWidth * 1, barHeight);
            else
                gameCtx.fillRect(px + 2, py + cellSize - barHeight-4, barWidth * mvRatio, barHeight);
        }
    });
    if (selectedUnit) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect( (selectedUnit.x * cellSize), (selectedUnit.y * cellSize), cellSize-2, cellSize-2);
        ctx.strokeStyle = 'black';

    }

}
function printUnit(unit){
    return `<ul>
<li>t: ${unit.type} </li>
<li>movesLeft: ${unit.movesLeft} </li>
<li>hlf: ${unit.health} </li>
<li>atk:${unit.attack}</li>
<li>p:${unit.player}</li>
<li>gold=${unit.gold}</li>
</ul>`;
}

function drawGame() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawGrid(gameCtx);
    drawUnits(gameCtx);
    //if(selectedUnit) selectedStatus.innerHTML = printUnit(selectedUnit);
    //else selectedStatus.innerHTML = '';
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
    //console.log('checking win 1=',count1,'2=',count2);
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
    //console.log('menu for unit ',selectedUnit, ' player', currentPlayer);
    castleMenu.style.display = "block";
}

function attakUnit(selectedUnit, unit){
    console.log(selectedUnit, unit);
    unit.health -= selectedUnit.attack;
    selectedUnit.movesLeft -= movesPerAttack;
    if (unit.health <= 0) {
        //selectedUnit.x = x;
        //selectedUnit.y = y;
        selectedUnit.gold += unit.gold;
        gameUnits = gameUnits.filter(u => u !== unit);
        checkWin();
    }

}
//GAME LOOP
gameCanvas.addEventListener('click', (e) => {
    castleMenu.style.display = "none";
    if (mode !== 'game') return;
    const rect = gameCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    const unit = getUnitAt(x, y);
    //console.log('click over ', x,y, gameMap[y][x], unit)
    let pass = "passable terrain";
    if(!isPassableTerrain(gameMap[y][x]))
        pass =  "non"+pass;
    let desc = terrainDescriptions[gameMap[y][x]] || '';
    
    let punit = '';
    if(unit) punit = printUnit(unit);
    selectedStatus.innerHTML = gameMap[y][x]+ " is "+pass +" "+desc+" "+ punit;

    if (unit && unit.player === currentPlayer) {
        if(  !selectedUnit || selectedUnit !== unit){
            if(!unit.gold) unit.gold = 0;
            selectedUnit = unit;
            if(gameMap[y][x] === "castle"){
                //this unit is inside castle so lets present on usin select menu
                printCastleMenu();
            }
            drawGame();
        }else{
            selectedUnit = null;
        }
    } else if (selectedUnit) {
        let movesToDo = Math.abs(selectedUnit.x - x) + Math.abs(selectedUnit.y - y);
        let movesToDeduct = movesToDo;
        let currentTile = gameMap[selectedUnit.y][selectedUnit.x];
        let nextTile = gameMap[y][x];

        console.log('half move? movesToDo ',movesToDo, currentTile,nextTile);
        if(
            ["road","stoneroad"].indexOf(currentTile) !== -1 &&
                ["road","stoneroad"].indexOf(nextTile) !== -1 
        ){
            console.log('half move');
            movesToDeduct -= movesToDeduct/2;
        }else{
        }

        //console.log('it will move',selectedUnit, movesToDo);
        if (unit && unit.player !== currentPlayer ) {
            if(!unit.gold) unit.gold = 0;
            // Attack
            if( unit.type === 'coin' && selectedUnit.movesLeft >= movesToDo && movesToDo <= 1 ){
                selectedUnit.movesLeft -= movesToDo;
                selectedUnit.x = x;
                selectedUnit.y = y;
                selectedUnit.gold += unit.gold;
                gameUnits = gameUnits.filter(u => u !== unit);

            }
            else if( 
                movesPerAttack <= selectedUnit.movesLeft 
                    && 
                    movesToDo <= selectedUnit.movesLeft 
                    && 
                    movesToDo <= selectedUnit.move 
            ){
                attakUnit(selectedUnit, unit);
                /*
                        unit.health -= selectedUnit.attack;
                        selectedUnit.movesLeft -= movesPerAttack;
                        if (unit.health <= 0) {// coin, maybe something else later who is collectable 
                            selectedUnit.x = x;
                            selectedUnit.y = y;
                            selectedUnit.gold += unit.gold;
                            gameUnits = gameUnits.filter(u => u !== unit);
                            checkWin();
                        }*/

            }
            //console.log('it did attack',selectedUnit, movesToDo, movesPerAttack);
        } else if (!unit &&  0.5 <= movesToDo && movesToDo <= 1  /*selectedUnit.move*/ ) {

            console.log('here we move? else', movesToDo, movesToDeduct);
            // Move if terain allows
            if(
                isPassableTerrain(gameMap[y][x]) && movesToDeduct <= selectedUnit.movesLeft
            ){
                selectedUnit.x = x;
                selectedUnit.y = y;
                selectedUnit.movesLeft -= movesToDeduct;
                //console.log('it moved',selectedUnit);
            }else{
                selectedUnit = null;
            }

        }else{
            console.log('here we no move?', movesToDo, movesToDeduct);
            selectedUnit = null;// unselect unit after every move/action

        }

    }else{
    }
    drawGame();
});
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function checkForUnitsArround(unit){
    let move = unit.move;
    for (let xi = unit.x-move; xi <= unit.x+move; xi++){
        for (let yi = unit.y-move; yi <= unit.y+move; yi++){
            let unitAt = getUnitAt(xi,yi);
            //console.log('unit at ',xi,yi,unitAt);
            if(unitAt && unitAt.player !== 0) return unitAt ;
        }
    }

    return null;
}
function doAI(){
    console.log("AI DOING AI SUFF hERE...");
    gameUnits.forEach(unit => {
        if(unit.player === 0 && unit.type !== 'coin'){
            let x,y;
            //should maybe check first all locations for possible attack before / if doing random move
            let unitAt = null;
            unitAt = checkForUnitsArround(unit);
            //if(unitAt)
            if(!unitAt || unitAt.player === 0 || unitAt.type === 'coin'){
                console.log('ai did not found unit', );
                let r = getRandomInt(4);
                switch(r){
                    case 0: //go up
                        x = unit.x;
                        y = unit.y -1;
                        break;
                    case 1: //go l
                        x = unit.x -1;
                        y = unit.y;
                        break;
                    case 2: //go down
                        x = unit.x;
                        y = unit.y +1;
                        break;
                    case 3: //go r
                        x = unit.x +1;
                        y = unit.y;
                }
                if (x < 0) x = 0;
                if (x > gridSize-1) x = gridSize-1;
                if (y < 0) y = 0;
                if (y > gridSize-1) y = gridSize-1;

                //console.log(x,y, gameMap[y][x],'dd');
                if(isPassableTerrain(gameMap[y][x]) && !getUnitAt(x,y)){
                    unit.x = x;
                    unit.y = y;
                }
            }else{
                console.log(unit.move,'ai attak unit', unitAt);
                if(unitAt.player !== 0){
                    attakUnit(unit, unitAt);
                    console.log('ai did hurt unit', unitAt);
                }
            }
        }
    });
}

function endTurn() {
    currentPlayer++;
    currentPlayer = currentPlayer === 3 ? 0 : currentPlayer;
    currentPlayerObj = players[currentPlayer-1];
    if(currentPlayer === 1) turnCount++;

    autosave();

    selectedUnit = null;
    // refill moves left for units
    gameUnits.forEach(unit => {
        unit.movesLeft = unitsBlueprint[unit.type].movesLeft;
        //console.log('looping units', unit);
        if(gameMap[unit.y][unit.x] === "tavern"){
            //console.log('you are on the well');
            unit.movesLeft += unitsBlueprint[unit.type].movesLeft/2;

            if(unit.movesLeft > unitsBlueprint[unit.type].movesLeft * 2){ unit.movesLeft = unitsBlueprint[unit.type].movesLeft * 2; }
        }
        if(gameMap[unit.y][unit.x] === "well"){
            //console.log('you are on the well');
            unit.health += 10;
            if(unit.health > unitsBlueprint[unit.type].health){ unit.health = unitsBlueprint[unit.type].health; }
        }
        if(gameMap[unit.y][unit.x] === "goldmine"){
            //console.log('you are on the goldmine',unit);
            unit.gold += 5;
            if(unit.type === "goblin"){
                unit.gold += 20;
            }
        }
        if(gameMap[unit.y][unit.x] === "castle"){
            console.log('you are on the castle and if you have enough money you will gain one more unit');

        }
    });


    if(currentPlayer === 0){ 
        doAI();
        endTurn();
        drawGame();
    }else{
        document.getElementById('status').textContent = printPlayer(currentPlayerObj);
        drawGame();
        showOverlay("Turn for Player "+currentPlayer);
    }
}
function printPlayer(player){
    //return `Player ${currentPlayer}'s Turn, turnCount=${turnCount} \nMoney:${player.money} exp:${{player}.exp}`;
    return `Player ${currentPlayer}' turn:${turnCount} map:${currentMapName}`;
}

function defaultLoad(){
    if(loadAutosave()){
        drawGame();
        showOverlay("Turn for Player "+currentPlayer);
        document.getElementById('status').textContent = printPlayer(currentPlayerObj);
        return;
    }
    alert('autosave not found, please load a map');
    loadMap();
}

function printSavedMap(maps){
    let list = `<p onclick="this.parentNode.innerHTML = ''">close</p><p class="d" onclick="this.parentNode.innerHTML=''">&times;</p><br />`;
    for(let i = 0; i<maps.length; i++){
        list += `<p onclick="loadMapByName('${maps[i]}')">${maps[i]} </p><p class="d" onclick="deleteMap('${maps[i]}')">del</p><br />`;
    }
    map_menu.innerHTML = list;
}

function deleteMap(name){
    const savedMapsStr = localStorage.getItem('savedMaps');
    let savedMaps = [];
    if(savedMapsStr){
        savedMaps = JSON.parse(savedMapsStr);
        //return;
    }
    savedMaps.pop(name);
    localStorage.setItem('savedMaps',JSON.stringify(savedMaps));
    localStorage.removeItem(name);
    printSavedMap(savedMaps);
}
function loadMapByName(name){
    currentMapName = name;
    if(defaultMaps.indexOf(name) !== -1){
        fetch(name+".json")
            .then(response => response.json())
            .then(saved => { 
                //console.log(saved) 
                gameMap = saved.map;
                gameUnits = saved.units;
                currentPlayer = 1;
                map_menu.innerHTML = "";
                turnCount = 0;
                document.getElementById('status').textContent = printPlayer(currentPlayerObj);
                drawGame();
                showOverlay("Turn for Player "+currentPlayer);
            });
        return;
    }
    const loadMapStr = localStorage.getItem(name);
    if(loadMapStr){
        const loadMapObj = JSON.parse(loadMapStr);
        gameMap = loadMapObj.map;
        gameUnits = loadMapObj.units;
        currentPlayer = 1;
        currentPlayerObj = players[1];
        turnCount = 0;
        document.getElementById('status').textContent = printPlayer(currentPlayerObj);
        //alert(`loaded ${name}`)
        map_menu.innerHTML = "";
        drawGame();
        showOverlay("Turn for Player "+currentPlayer);
    }else{

        alert(`not found ${name}`)
    }

}
function loadMap() {
    //alert('will load maps');
    const savedMapsStr = localStorage.getItem('savedMaps');
    let savedMaps = [];
    if(savedMapsStr){
        savedMaps = JSON.parse(savedMapsStr);
        //return;
    }
    for(let i = 0; i< defaultMaps.length;i++){
        if(savedMaps.indexOf(defaultMaps[i]) === -1){
            console.log('pushing',defaultMaps[i]);
            savedMaps.push(defaultMaps[i]);
        }
    }
    printSavedMap(savedMaps);
    return
    //console.log('load?');

    //console.log('preload?');

    //if no maps at all just get one from there
    fetch("heroes.json")
        .then(response => response.json())
        .then(saved => { 
            //console.log(saved) 
            gameMap = saved.map;
            gameUnits = saved.units;
            drawGame();
            showOverlay("Turn for Player "+currentPlayer);
        });
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
        //console.log('editor',unitObj,gameUnits);
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

    if(input_map_name.value === ""){
        alert('fill in the name for the map to save it');
        return;
    }
    console.log(input_map_name.value, 'name of save');
    const toSave = {
        map: gameMap,
        units: gameUnits,
        current: currentPlayer
    }
    localStorage.setItem(input_map_name.value, JSON.stringify(toSave));
    const savedMapsStr = localStorage.getItem('savedMaps');
    let savedMaps = [];
    if(savedMapsStr) savedMaps = JSON.parse(savedMapsStr);
    if(savedMaps.indexOf(input_map_name.value) === -1){
        console.log('pushing hard',input_map_name.value);
        savedMaps.push(input_map_name.value)
    }

    localStorage.setItem('savedMaps', JSON.stringify(savedMaps));
    alert('Map "'+input_map_name.value+'" saved! ');
    return;
    localStorage.setItem('gameMap', JSON.stringify(gameMap));
    localStorage.setItem('gameUnits', JSON.stringify(gameUnits));
    alert('Map saved! 1111');
}

/*
        function loadSavedMaps(){
            let savedMaps = localStorage.getItem('savedMaps');
            if(savedMaps) mapList = JSON.parse(savedMaps);
            mapList.push("heroes");
            mapList.push("heroes6");

            //map_menu.innerHTML = savedMaps;

        }
*/
function loadAutosave(){
    if(localStorage.getItem('autosave')){
        const autosave = JSON.parse(localStorage.getItem('autosave'));
        gameMap = autosave.map;
        gameUnits = autosave.units;
        currentPlayer = autosave.current;
        currentPlayerObj = players[currentPlayerObj];
        currentMapName = autosave.currentMapName;
        turnCount = autosave.turnCount || 0;
        return true;
    }
    return false;
}
function autosave(){
    const toSave = {
        map: gameMap,
        units: gameUnits,
        current: currentPlayer,
        currentMapName: currentMapName,
        turnCount: turnCount
    }
    localStorage.setItem('autosave', JSON.stringify(toSave));
}

function clearMap() {
    gameMap = createEmptyMap();
    gameUnits = [];
    map_name.value = '';
    drawEditor();
}

function downloadMap(){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({map:gameMap,units:gameUnits}));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", currentMapName+".json");
    dlAnchorElem.click();
}
async function readText(event) {
    const file = event.target.files.item(0)
    const text = await file.text();

    const obj = JSON.parse(text);
    if (obj.map) gameMap = obj.map;
    if (obj.units) gameUnits = obj.units;
    //console.log(obj);
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
