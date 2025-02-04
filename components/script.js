import Component from "./Component.js";
import Grid from "./Grid/Grid.js";
import Modal from "./Modal/Modal.js";
import Select from "./Select/Select.js";
import Button from "./Button/Button.js";
import Timer from "./Timer/Timer.js";

const matrixes = await fetch("../nonograms/assets/nonograms.json")
  .then((response) => response.json())
  .then((matrix) => matrix);

const matrix = [
  [0, 0, 0, 1, 1],
  [0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 0, 1, 0],
];

class App {
  container = null;

  grid = null;

  isDark = false;

  cells = [];

  scoreList = [];

  nonogramCol = [];

  nonogramRow = [];

  nonogramIndex = [];

  currentIndex = [];

  crossIndex = [];

  isSolution = false;

  isSound = true;

  nonogramName = "dinosaur";

  constructor(nonogram) {
    this.nonogram = nonogram;
    this.generateCells(25);
    this.generateNonogramInfo(this.nonogram);

    this.timer = new Timer({ className: "timer", text: "00:00" });
    this.modal = new Modal({
      className: "modal",
      text: "",
      timer: this.timer,
    });
    this.modal.toggleClass("modal--hidden");

    if (localStorage.getItem("gamesScore") !== null) {
      this.scoreList = JSON.parse(localStorage.gamesScore);
    }

    this.btnReset = new Button({
      className: "button button-reset",
      text: "Reset Game",
      onClick: () => {
        this.resetGame();
        this.timer.stopTimer();
      },
    });

    this.audioClick = new Audio("./assets/audio/click.mp3");
    this.audioWin = new Audio("./assets/audio/win.mp3");

    this.btnSong = new Button({
      className: "button-icon",
      tag: "img",
      onClick: () => {
        this.isSound = !this.isSound;
        const color = this.isDark ? "white" : "black";
        if (this.isSound) {
          this.btnSong.setAttribute("src", `./assets/img/volume-${color}.svg`);
        } else {
          this.btnSong.setAttribute(
            "src",
            `./assets/img/volume-${color}-off.svg`,
          );
        }
      },
    });

    this.btnSong.setAttribute("src", "./assets/img/volume-black.svg");

    this.btnMode = new Button({
      className: "button-icon",
      tag: "img",
      onClick: () => {
        this.selectColorMode();
      },
    });

    this.btnMode.setAttribute("src", "./assets/img/moon.svg");

    this.btnScore = new Button({
      className: "button",
      text: "Score",
      onClick: () => {
        this.modal.toggleClass("modal--hidden");
        this.modal.generateScoreList(this.scoreList);
      },
    });

    this.btnLastGame = new Button({
      className: "button button-last",
      text: "Continue Last Game",
      onClick: () => {
        this.getLastGame();
        this.timer.setSaveTime();
      },
    });

    this.btnRandomGame = new Button({
      className: "button",
      text: "Random Game",
      onClick: () => {
        this.randomGame();
      },
    });

    this.btnSaveGame = new Button({
      className: "button button-save",
      text: "Save Game",
      onClick: () => {
        if (this.currentIndex.length !== 0) {
          localStorage.setItem("game", this.currentIndex);
        } else if (localStorage.getItem("game")) {
          localStorage.removeItem("game");
        }
        localStorage.setItem("seconds", this.timer.getSeconds());
        localStorage.setItem("minutes", this.timer.getMinutes());
        if (this.crossIndex.length !== 0) {
          localStorage.setItem("cross", this.crossIndex);
        } else if (localStorage.getItem("cross")) {
          localStorage.removeItem("cross");
        }
      },
    });

    this.btnSolution = new Button({
      className: "button button-solution",
      text: "Solution",
      onClick: () => {
        this.getSolutions();
      },
    });

    this.select = new Select({
      className: "select",
      tag: "select",
      options: ["dinosaur", "camel", "rabbit", "chicken", "fountain"],
      onClick: (item) => {
        this.getMatrix("easy", item);
        this.timer.stopTimer();
        this.isSolution = false;
        this.nonogramName = item;
        this.timer.setTextContent("00:00");
      },
    });

    this.navigation = new Component(
      {
        className: "navigation",
      },
      this.btnRandomGame,
      this.btnSolution,
      this.btnLastGame,
      this.btnSaveGame,
      this.btnReset,
      this.btnScore,
      this.btnMode,
      this.btnSong,
    );

    this.container = new Component(
      {
        tag: "div",
        className: "container",
      },
      this.navigation,
      this.select,
      this.timer,
      this.modal,
    );

    this.generateGrid();
  }

  render(root) {
    root.append(this.container.getNode());
  }

  generateGrid() {
    console.log(this.nonogram);
    this.gridCol = new Grid({
      className: "grid__col",
      items: this.nonogramCol,
      type: "col",
    });

    this.gridRow = new Grid({
      className: "grid__row",
      items: this.nonogramRow,
      type: "row",
    });

    this.cellsContainer = new Grid({
      className: "grid__cells",
      items: this.cells,
    });

    this.grid = new Grid({
      className: `grid`,
      items: [this.gridCol, this.gridRow, this.cellsContainer],
    });

    this.container.append(this.grid);
  }

  generateCells(count) {
    this.cells = [];
    for (let i = 0; i < count; i += 1) {
      const cell = new Grid({
        className: "grid__cell",
        onClick: (item) => {
          this.checkNonogram(item);
          this.controlSound(this.audioClick);
          if (!this.timer.getIsStart()) {
            this.timer.startTimer();
          }
        },
        onContext: (item) => {
          console.log(this.crossIndex);
          const index = this.crossIndex.indexOf(item);
          if (index !== -1) {
            this.crossIndex.splice(index, 1);
          } else {
            this.crossIndex.push(item);
          }

          this.controlSound(this.audioClick);
          if (!this.timer.getIsStart()) {
            this.timer.startTimer();
          }
        },
      });
      cell.setAttribute("data-position", i);
      this.cells.push(cell);
    }
  }

  generateClearNonogram() {
    this.nonogramIndex = this.nonogram
      .flat()
      .map((item, index) => (item === 1 ? index : false))
      .filter((item) => item);
  }

  checkNonogram(item) {
    const index = this.currentIndex.indexOf(item);
    if (!this.timer.getIsStart()) {
      this.timer.startTimer();
    }
    if (index !== -1) {
      this.currentIndex.splice(index, 1);
    } else {
      this.currentIndex.push(item);
    }

    if (this.currentIndex.length === this.nonogramIndex.length) {
      this.currentIndex.sort((a, b) => a - b);
      if (
        this.currentIndex.toString() === this.nonogramIndex.toString() &&
        !this.isSolution
      ) {
        // this.timer.stopTimer();
        setTimeout(() => {
          this.grid.offClick();
          this.controlSound(this.audioWin);
          this.modal.updateTextContent(
            `Great! You have solved the nonogram in ${this.timer.getMinutes() * 60 + this.timer.getSeconds()} seconds!`,
          );
          this.modal.toggleClass("modal--hidden");
          this.saveScore();
          this.timer.stopTimer();
        });
      }
    }
  }

  saveScore() {
    if (this.scoreList.length < 5) {
      this.scoreList.push(
        `${this.timer.getTime()} - ${this.nonogramName[0].toUpperCase() + this.nonogramName.slice(1)} - Easy`,
      );
    } else {
      this.scoreList.shift();
      this.scoreList.push(
        `${this.timer.getTime()} - ${this.nonogramName[0].toUpperCase() + this.nonogramName.slice(1)} - Easy`,
      );
    }

    localStorage.setItem("gamesScore", JSON.stringify(this.scoreList));
    // localStorage.setItem("gamesScore", [0, 1, 2, 3, 4]);
  }

  generateNonogramInfo(nonogram) {
    this.nonogramRow = [];
    this.nonogramCol = [];
    for (let i = 0; i < nonogram.length; i += 1) {
      let countStr = 0;
      let countCol = 0;
      const currentCountStr = [];
      const currentCountCol = [];
      for (let j = 0; j < nonogram[i].length; j += 1) {
        if (nonogram[i][j] === 1) {
          countStr += 1;
        } else if (countStr !== 0) {
          currentCountStr.push(
            new Component({ className: "grid__row-item", text: countStr }),
          );
          countStr = 0;
        }

        if (nonogram[j][i] === 1) {
          countCol += 1;
        } else if (countCol !== 0) {
          currentCountCol.push(
            new Component({ className: "grid__col-item", text: countCol }),
          );
          countCol = 0;
        }

        if (j === nonogram[i].length - 1) {
          this.nonogramRow.push(currentCountStr);
          this.nonogramCol.push(currentCountCol);
        }
      }
      if (countStr !== 0) {
        currentCountStr.push(
          new Component({ className: "grid__row-item", text: countStr }),
        );
      }
      if (countCol !== 0) {
        currentCountCol.push(
          new Component({ className: "grid__col-item", text: countCol }),
        );
      }
    }

    this.generateClearNonogram();
  }

  getMatrix(level, name) {
    this.grid.destroy();
    matrixes.forEach((element) => {
      if (element.level === level) {
        element.nonograms.forEach((item) => {
          if (item.name === name) {
            this.nonogram = item.matrix;
          }
        });
      }
    });

    this.currentIndex = [];
    this.crossIndex = [];
    this.generateCells(25);
    this.generateNonogramInfo(this.nonogram);
    this.generateGrid();
  }

  resetGame() {
    this.grid.destroy();
    this.cellsContainer.destroy();
    this.currentIndex = [];
    this.generateCells(25);
    this.generateGrid();
    this.isSolution = false;
    this.timer.setTextContent("00:00");
    this.crossIndex = [];
  }

  getLastGame() {
    this.resetGame();

    if (localStorage.getItem("game")) {
      const lastIndexGame = localStorage.getItem("game").split(",");
      this.currentIndex = lastIndexGame;

      lastIndexGame.forEach((item) => {
        this.cellsContainer.getChildren()[item].addClass("grid__cell--active");
      });
    }

    if (localStorage.getItem("cross")) {
      const lastCrossIndexGame = localStorage.getItem("cross").split(",");
      this.crossIndex = lastCrossIndexGame;

      lastCrossIndexGame.forEach((item) => {
        this.cellsContainer.getChildren()[item].addClass("grid__cell--cross");
        this.cellsContainer.getChildren()[item].appendChildren([
          new Component({ className: `grid__cell-line first-line` }),
          new Component({
            className: `grid__cell-line second-line`,
          }),
        ]);
      });
    }
  }

  getSolutions() {
    if (!this.isSolution) {
      this.resetGame();
      this.grid.offClick();
      this.isSolution = true;
      for (let i = 0; i < this.nonogramIndex.length; i += 1) {
        this.cells[this.nonogramIndex[i]].checkNonogram();
      }
    }
    this.timer.stopTimer();
    this.timer.setTextContent("00:00");
  }

  selectColorMode() {
    this.isDark = !this.isDark;
    document.body.classList.toggle("body--dark");
    this.select.toggleClass("select--dark");

    if (this.isDark) {
      this.btnMode.getNode().setAttribute("src", "./assets/img/sun.svg");
      if (this.isSound) {
        this.btnSong.setAttribute("src", `./assets/img/volume-white.svg`);
      } else {
        this.btnSong.setAttribute("src", `./assets/img/volume-white-off.svg`);
      }
    } else {
      this.btnMode.getNode().setAttribute("src", "./assets/img/moon.svg");
      if (this.isSound) {
        this.btnSong.setAttribute("src", `./assets/img/volume-black.svg`);
      } else {
        this.btnSong.setAttribute("src", `./assets/img/volume-black-off.svg`);
      }
    }
  }

  controlSound(sound) {
    if (this.isSound) {
      sound.currentTime = 0;
      sound.play();
    } else {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  randomGame() {
    const nonogramsName = [
      "dinosaur",
      "camel",
      "rabbit",
      "chicken",
      "fountain",
    ];
    const random = Math.floor(0 + Math.random() * (4 + 1));

    const value = nonogramsName[random];

    if (this.nonogramName === value) {
      this.randomGame();
    } else {
      this.getMatrix("easy", value);
      this.timer.stopTimer();
      this.isSolution = false;
      this.nonogramName = value;
      this.select.getNode().value = value;
    }
  }
}
const app = new App(matrix);

app.render(document.body);
