/*PROGRAM ZA GENERIRANJE LABIRINT (ni moj program) ccredits: */

// Initialize the canvas
let maze = document.querySelector("canvas");
maze.style.background = "transparent"
let ctx = maze.getContext("2d");

let container = document.getElementById("container");
let status = document.getElementById("status");
status.innerHTML = "Status: press any key";



function content(){ 
  container.style.top = "20%";
  maze.style.background = "rgba(255, 255, 255, 0.3)";
  maze.classList.add("labirint");
 
  let audio = new Audio("sounds/generating.mp3");
  audio.loop = true;
  audio.autoplay = true;
  audio.load();
  audio.play();

  let current;
  let goal;
  let generationComplete = false;

  class Maze {
    constructor(size, rows, columns) {
      this.size = size;
      this.columns = columns;
      this.rows = rows;
      this.grid = [];
      this.stack = [];
    }

    // Set the grid: Create new this.grid array based on number of instance rows and columns
    async setup() {
      for (let r = 0; r < this.rows; r++) {
        let row = [];
        for (let c = 0; c < this.columns; c++) {
          // Create a new instance of the Cell class for each element in the 2D array and push to the maze grid array
          let cell = new Cell(r, c, this.grid, this.size);
          row.push(cell);
        }
        this.grid.push(row);
      }
      // Set the starting grid
      current = this.grid[0][0];
      this.grid[this.rows - 1][this.columns - 1].goal = true;
    }

    // Draw the canvas by setting the size and placing the cells in the grid array on the canvas.
    async draw() {
      status.innerHTML =  "Status: Generating labirint"
      maze.width = this.size;
      maze.height = this.size;
      // Set the first cell as visited
      current.visited = true;
      // Loop through the 2d grid array and call the show method for each cell instance
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.columns; c++) {
          this.grid[r][c].show(this.size, this.rows, this.columns);
        }
      }
      // This function will assign the variable 'next' to random cell out of the current cells available neighbouting cells
      let next = current.checkNeighbours();
      // If there is a non visited neighbour cell
      if (next) {
        next.visited = true;
        // Add the current cell to the stack for backtracking
        this.stack.push(current);
        // this function will highlight the current cell on the grid. The parameter columns is passed
        // in order to set the size of the cell
        current.highlight(this.columns);
        // This function compares the current cell to the next cell and removes the relevant walls for each cell
        current.removeWalls(current, next);
        // Set the nect cell to the current cell
        current = next;

        // Else if there are no available neighbours start backtracking using the stack
      } else if (this.stack.length > 0) {
        let cell = this.stack.pop();
        current = cell;
        current.highlight(this.columns);
      }
      // If no more items in the stack then all cells have been visted and the function can be exited
      if (this.stack.length === 0) {
        generationComplete = true;
      }

      // Recursively call the draw function. This will be called up until the stack is empty
      if(!generationComplete){
        setTimeout(async ()=>{  
          this.draw();
        }, 13);
      }
    }
  }

  class Cell {
    // Constructor takes in the rowNum and colNum which will be used as coordinates to draw on the canvas.
    constructor(rowNum, colNum, parentGrid, parentSize) {
      this.rowNum = rowNum;
      this.colNum = colNum;
      this.visited = false;
      this.solverVisited = false;
      this.walls = {
        topWall: true,
        rightWall: true,
        bottomWall: true,
        leftWall: true,
      };
      this.goal = false
      // parentGrid is passed in to enable the checkneighbours method.
      // parentSize is passed in to set the size of each cell on the grid
      this.parentGrid = parentGrid;
      this.parentSize = parentSize;
    }

    checkNeighbours() {
      let grid = this.parentGrid;
      let row = this.rowNum;
      let col = this.colNum;
      let neighbours = [];

      // The following lines push all available neighbours to the neighbours array
      // undefined is returned where the index is out of bounds (edge cases)
      let top = row !== 0 ? grid[row - 1][col] : undefined;
      let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
      let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
      let left = col !== 0 ? grid[row][col - 1] : undefined;

      // if the following are not 'undefined' then push them to the neighbours array
      if (top && !top.visited) neighbours.push(top);
      if (right && !right.visited) neighbours.push(right);
      if (bottom && !bottom.visited) neighbours.push(bottom);
      if (left && !left.visited) neighbours.push(left);

      // Choose a random neighbour from the neighbours array
      if (neighbours.length !== 0) {
        let random = Math.floor(Math.random() * neighbours.length);
        return neighbours[random];
      } else {
        return undefined;
      }
    }

    checkNeighboursWithoutWalls(){
      let grid = this.parentGrid;
      let row = this.rowNum;
      let col = this.colNum;
      let walls = this.walls;
      let neighbours = [];

      // The following lines push all available neighbours to the neighbours array
      // undefined is returned where the index is out of bounds (edge cases)
      let top = row !== 0 && !walls.topWall ? grid[row - 1][col] : undefined;
      let right = col !== grid.length - 1 && !walls.rightWall ? grid[row][col + 1] : undefined;
      let bottom = row !== grid.length - 1 && !walls.bottomWall ? grid[row + 1][col] : undefined;
      let left = col !== 0  && !walls.leftWall? grid[row][col - 1] : undefined;

      // if the following are not 'undefined' then push them to the neighbours array
      if (top && !top.solverVisited) neighbours.push(top);
      if (right && !right.solverVisited) neighbours.push(right);
      if (bottom && !bottom.solverVisited) neighbours.push(bottom);
      if (left && !left.solverVisited) neighbours.push(left);

      return neighbours;
    }


    // Wall drawing functions for each cell. Will be called if relevent wall is set to true in cell constructor
    drawTopWall(x, y, size, columns, rows) {
      ctx.strokeStyle = "#000000"
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size / columns, y);
      ctx.stroke();
    }

    drawRightWall(x, y, size, columns, rows) {
      ctx.strokeStyle = "#000000"
      ctx.beginPath();
      ctx.moveTo(x + size / columns, y);
      ctx.lineTo(x + size / columns, y + size / rows);
      ctx.stroke();
    }

    drawBottomWall(x, y, size, columns, rows) {
      ctx.strokeStyle = "#000000"
      ctx.beginPath();
      ctx.moveTo(x, y + size / rows);
      ctx.lineTo(x + size / columns, y + size / rows);
      ctx.stroke();
    }

    drawLeftWall(x, y, size, columns, rows) {
      ctx.strokeStyle = "#000000"
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + size / rows);
      ctx.stroke();
    }

    changeBackground(columns, color) {
      // z piko oznaci celico (kadar algoritem isce pot)
      let x = ((this.colNum * this.parentSize) / columns) + ((this.parentSize / columns) / 2);
      let y = ((this.rowNum * this.parentSize) / columns) + ((this.parentSize / columns) / 2);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.ellipse(
        x,
        y,
        (this.parentSize / columns) / 7 ,
        (this.parentSize / columns) / 7 ,
        Math.PI / 4,
        0,
        2 * Math.PI
      );
      if (this.goal) {
        ctx.fillStyle = "rgba(35, 56, 173, 1)";
        ctx.fillRect(x + 2, y + 2, size / columns - 4, size / rows - 4);
        ctx.ellipse(
          x,
          y,
          (this.parentSize / columns) / 7 ,
          (this.parentSize / columns) / 7 ,
          Math.PI / 4,
          0,
          2 * Math.PI
        );
      }
      ctx.fill();
      ctx.closePath();
    }

    drawAlien(columns, image){
      // narise vesoljcka kadar isce pot
      let x = ((this.colNum * this.parentSize) / columns) + ((this.parentSize / columns) / 6);
      let y = ((this.rowNum * this.parentSize) / columns) + ((this.parentSize / columns) / 6);
      ctx.beginPath();
      ctx.drawImage(
        image,
        x,
        y,
        (this.parentSize / columns) / 1.5,
        (this.parentSize / columns) / 1.5
      );
      ctx.closePath();
    }

    removeWalls(cell1, cell2) {
      // compares to two cells on x axis
      let x = cell1.colNum - cell2.colNum;
      // Removes the relevant walls if there is a different on x axis
      if (x === 1) {
        cell1.walls.leftWall = false;
        cell2.walls.rightWall = false;
      } else if (x === -1) {
        cell1.walls.rightWall = false;
        cell2.walls.leftWall = false;
      }
      // compares to two cells on y axis
      let y = cell1.rowNum - cell2.rowNum;
      // Removes the relevant walls if there is a different on y axis
      if (y === 1) {
        cell1.walls.topWall = false;
        cell2.walls.bottomWall = false;
      } else if (y === -1) {
        cell1.walls.bottomWall = false;
        cell2.walls.topWall = false;
      }
    }

    // Highlights the current cell on the grid. Columns is once again passed in to set the size of the grid.
    highlight(columns) {
      // Additions and subtractions added so the highlighted cell does cover the walls
      let x = (this.colNum * this.parentSize) / columns - 1;
      let y = (this.rowNum * this.parentSize) / columns - 1;
      ctx.fillStyle = "rgba(55, 120, 44, 1)";
      ctx.fillRect(
        x,
        y,
        this.parentSize / columns,
        this.parentSize / columns
      );
    }

    clear(size, rows, columns) {
      // Additions and subtractions added so the highlighted cell does cover the walls
      let x = (this.colNum * this.parentSize) / columns - 1;
      let y = (this.rowNum * this.parentSize) / columns - 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.clearRect(x + 2, y + 2, size / columns - 4, size / rows - 4);
      ctx.fillRect(x + 2, y + 2, size / columns - 4, size / rows - 4);
      if (this.goal) {
        ctx.fillStyle = "rgba(35, 56, 173, 1)";
        ctx.fillRect(x + 2, y + 2, size / columns - 4, size / rows - 4);
      }
    }

    // Draws each of the cells on the maze canvas
    show(size, rows, columns) {
      let x = (this.colNum * size) / columns;
      let y = (this.rowNum * size) / rows;
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
      if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
      if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
      if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
      ctx.fillRect(x, y , size / columns , size / rows );
      if (this.goal) {
        ctx.fillStyle = "rgba(35, 56, 173, 1)";
        ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
      }
    }
  }
 
  /*PROGRAM ZA ISKANJE POTI (moj program)*/
  
  let mazeGenerator = new Maze(600, 25, 25);
  mazeGenerator.setup(); // naredi tabelo  s celicami
  mazeGenerator.draw(); // narise labirint


  let trenuten;
  let prejsnji;
  let sosedi;
  let labirint = mazeGenerator.grid;
  let cilj = labirint[labirint.length - 1][labirint.length - 1];
  let zacetek = labirint[0][0];
  let stack = [];
  let pot = [];
  stack.push(labirint[0][0]);
  let req;
  let x;
  let neobiskani;
  let resen = false;
  //slika vesoljcka
  let alien = new Image();
  alien.src = "../images/alien.png"

  let ufo = document.getElementById("ufo");
  
  async function resiLabirint(){ 
    status.innerHTML =  "Status: Finding path";

    trenuten = stack[stack.length - 1]; // uzame prvega iz kupa
    trenuten.solverVisited = true; // oznaci da je bil obiskan
    
    //sproti brise vesoljcke in rise sled
    if(stack.length > 4){
      trenuten.drawAlien(mazeGenerator.columns, alien);
      stack[stack.length - 4].clear(mazeGenerator.size, mazeGenerator.rows, mazeGenerator.columns);
      stack[stack.length - 4].changeBackground(mazeGenerator.columns, "rgba(55, 120, 44, 0.8)");
    }
    if(stack.length > 3){
      trenuten.drawAlien(mazeGenerator.columns, alien);
      stack[stack.length - 3].clear(mazeGenerator.size, mazeGenerator.rows, mazeGenerator.columns);
      stack[stack.length - 3].changeBackground(mazeGenerator.columns, "rgba(55, 120, 44, 0.8)");
    }
    if(stack.length > 2){
        trenuten.drawAlien(mazeGenerator.columns, alien);
        stack[stack.length - 2].clear(mazeGenerator.size, mazeGenerator.rows, mazeGenerator.columns);
        stack[stack.length - 2].changeBackground(mazeGenerator.columns, "rgba(55, 120, 44, 0.8)");
    }
  
    if(trenuten === cilj){ // preveri ali je na cilju
      console.log("konec");
      resen = true;
    }

    if(!resen && generationComplete){ // ponavlja dokler ni resen in pocaka da se labirint zgenerira
      setTimeout(() => {
        resiLabirint();
      }, 80);
    } else { // ce je konec obarvaj pot
      status.innerHTML =  "Status: Path found";
      fadeAudio();
      maze.classList.add("fade-out");
      ufo.style.animation = "move 5s infinite";
    }

    neobiskani = 0;
    sosedi = trenuten.checkNeighboursWithoutWalls(); // preveri kateri sosedje so na voljo
    sosedi.forEach(celica =>{
      if(!celica.solverVisited){ // neobiskane sosede doda na kup
        stack.push(celica);
        neobiskani +=1;
      }
    });

    if(neobiskani === 0){ // ce ni vec sosedov brise kup in brise sled ter vesoljcka
      stack[stack.length - 2].drawAlien(mazeGenerator.columns, alien);
      stack[stack.length - 1].clear(mazeGenerator.size, mazeGenerator.rows, mazeGenerator.columns);
      stack.pop();
    }

  }

  let pizkusaj  = setInterval(() => { 
    // poizkusa zagnati funkcijo resi labirint vendar caka  da se labirint narise
    if(generationComplete) {
      resiLabirint();
      clearInterval(pizkusaj);
    }
  }, 150);


  function fadeAudio () { // naredi fade effekt na zvoku
    let fade = setInterval(() => {
        if ((audio.volume != 0.0)) { // zmanjsuje volumen
          audio.volume -= 0.1;
          if(audio.volume <= 0.0) {
            audio.volume = 0.0;
            clearInterval(fade);
          }
        }  else {
          audio.volume = 0.0;
          clearInterval(fade);
        } 
    }, 200);
  }
}

let playing = false;

window.addEventListener("keydown", function start(){
    window.removeEventListener("keydown", start, false);
    content();
});












 
