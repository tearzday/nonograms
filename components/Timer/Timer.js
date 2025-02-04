import Component from "../Component.js";

export default class Timer extends Component {
  minutes = 0;

  second = 0;

  timer = null;

  isStart = false;

  constructor({ className, onClick, text }) {
    super({ className, text });

    if (onClick) {
      this.onClick = onClick;
      this.addListener("click", () => {
        this.onClick();
      });
    }
  }

  startTimer() {
    this.isStart = true;
    this.timer = setInterval(() => {
      if (this.second === 60) {
        this.minutes += 1;
        this.second = 0;
      } else {
        this.second += 1;
      }

      this.setTextContent(
        `${this.minutes < 10 ? `0${this.minutes}` : this.minutes}:${this.second < 10 ? `0${this.second}` : this.second}`,
      );
    }, 1000);
  }

  stopTimer() {
    console.log("test");
    this.isStart = false;
    clearInterval(this.timer);
    this.second = 0;
    this.minutes = 0;
  }

  getTime() {
    return `${this.minutes < 10 ? `0${this.minutes}` : this.minutes}:${this.second < 10 ? `0${this.second}` : this.second}`;
  }

  getIsStart() {
    return this.isStart;
  }

  getSeconds() {
    return this.second;
  }

  getMinutes() {
    return this.minutes;
  }

  setSaveTime() {
    if (localStorage.getItem("seconds") || localStorage.getItem("minutes")) {
      this.second = +localStorage.getItem("seconds");
      this.minutes = +localStorage.getItem("minutes");

      this.setTextContent(this.getTime());
    }
  }
}
