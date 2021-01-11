const numbers = [
  'zero',
  'one',
  'two',
  'three',
  'five',
  'six',
  'seven',
  'eight',
];

class Board {
  constructor(size = 5, bombCount = 10) {
    this.size = size;
    this.bombCount = bombCount;
    this.gameContainer =$('#game');
    this.mines = [];
    this.board = [];
    this.flaggedCount = 0;
    this.timerInterval = null;
    this.timer = 0;
    this.startGame();
  }

  startGame() {
    this.bombRandomizer();
    this.generateBoard();
    this.debugDraw();
  }

  getSize() {
    return this.size;
  }

  getMines() {
    return this.mines;
  }

  getBoard() {
    return this.board;
  }

  bombRandomizer() {
    let count = 0;
    while (count <= this.bombCount) {
      let mine = {
        x: Math.floor((Math.random() * this.size)),
        y: Math.floor((Math.random() * this.size)),
      };
      if (!this.mines.find(eMine => eMine.x === mine.x && eMine.y === mine.y)) {
        this.mines.push(mine);
        count++;
      }
    }
  }

  isMine(x, y) {
    return typeof this.mines.find(mine =>  mine.x === x && mine.y === y) === 'object';
  }

  generateBoard() {
    for (let x = 0; x < this.size; x++) {
      let row = [];
      for (let y = 0; y < this.size; y++) {
        let field = null;
        if (this.isMine(x, y)) {
          field = {type: 'mine'};
        } else {
          field = {type: 'field', value: 0};
        }
        row.push(field);
      }
      this.board.push(row);
    }
    this.addFieldValues();
  }

  addFieldValues() {

    for (const mine of this.mines) {
      for (let x = mine.x - 1; x <= mine.x + 1; x++) {
        for (let y = mine.y - 1; y <= mine.y + 1; y++) {
          if (this.board[x] && this.board[x][y]) {
            let field = this.board[x][y];
            field.type === 'field' ? field.value++ : null;
          }
        }
      }
    }

  }

  debugDraw() {
    this.gameContainer.append(`
        <div
          id="board" 
          style="
            display: grid; 
            grid-template-rows: repeat(${this.size}, 25px); 
            grid-template-columns: repeat(${this.size}, 25px);">
        </div>
    `);

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        $('#board').append(`<button class="field ${x}-${y}" x="${x}" y="${y}"></button>`)
      }
    }

    $('.field').on('click', event => this._handleLeftClick(event));

    $('.field').mousedown(event => {
      switch (event.which) {
        case 1:
          this._handleLeftClick(event);
          break;
        case 3:
          this._handleRightClick(event);
          break;
      }
    });

    this.timerInterval = setInterval(() => {this.timer++; $('#timer').html(this.timer)}, 1000);
    $(`#flagged-count`).html(`${this.bombCount - this.flaggedCount}`);
  }



  _handleLeftClick(event) {
    const field = $(event.target);
    const x = field.attr('x');
    const y = field.attr('y');
    const value = this.board[x][y];
    if (value.clicked || value.flaged) { return 0 }

    if (value.type === 'field') {
      if (value.value === 0) {
        value.clicked = true;
        if (!value.clicked) {
          field.click();
        }

        let neighbours = [
          [+x-1, +y-1],
          [+x, +y-1],
          [+x+1, +y-1],
          [+x-1, +y],
          [+x+1, +y],
          [+x-1, +y+1],
          [+x, +y+1],
          [+x+1, +y+1]
        ];
        neighbours.forEach(element => $(`.${element.join('-')}`).click());
        field.replaceWith(`<p class='field ${numbers[value.value]} clicked'></p>`);
      } else {
        field.replaceWith(`<p class='field ${numbers[value.value]} clicked'>${value.value}</p>`);
      }
    } else if (value.type === 'mine') {
      this.showAll();
      $(`#flagged-count`).html(0);
      clearInterval(this.timerInterval);
      setTimeout(alert('You are loser!'), 3000)
      //field.replaceWith(`<p class='field ${numbers[value.value]} clicked'>\t💣</p>`)
    }

    //console.log($(event.target).attr('x'), $(event.target).attr('y'))
  }

  showAll() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const value = this.board[x][y];
        const field = $(`.${x}-${y}`);
        if (value.type === 'field') {
          if (value.value === 0) {
            field.replaceWith(`<p class='field ${numbers[value.value]} clicked'></p>`);
          } else {
            field.replaceWith(`<p class='field ${numbers[value.value]} clicked'>${value.value}</p>`);
          }
        } else {
          field.replaceWith(`<p class='field ${numbers[value.value]} clicked'>\t💣</p>`);
        }
      }
    }
  }

  _handleRightClick(event) {
    event.preventDefault();
    const field = $(event.target);
    const x = field.attr('x');
    const y = field.attr('y');
    const value = this.board[x][y];

    if (!value.flaged) {
      value.flaged = true;
      this.flaggedCount++;
      field.html('☣️')
    } else {
      value.flaged = false;
      this.flaggedCount--;
      field.html('')
    }
    $(`#flagged-count`).html(`${this.bombCount - this.flaggedCount}`);
    this.checkWin();
  }

  checkWin() {
    let counter = 0;
    this.mines.forEach(mine => {
      this.board[mine.x][mine.y].flaged === true && counter++;
    });
    if (counter === this.bombCount+1) {
      alert('You are winner!')
    }
  };

  destroy() {
    $('#game').html('');
    clearInterval(this.timerInterval);
    $(`#flagged-count`).html(0);
    $('#timer').html(0);
  }

}

function createGame() {
  if (typeof window.gameBoard === 'object') {
    window.gameBoard.destroy();
  }
  window.gameBoard = new Board(15, 40);

}

$('#reset-game').on('click', () => createGame());
createGame();
