import Component from "../Component.js";

export default class Button extends Component {
  constructor({ className, text, onClick, tag }) {
    super({ className, text, tag });

    if (onClick) {
      this.onClick = onClick;
      this.addListener("click", () => {
        this.onClick();
      });
    }
  }
}
