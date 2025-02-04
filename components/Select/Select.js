import Component from "../Component.js";

export default class Select extends Component {
  options = null;

  constructor({ className, tag, options, onClick }) {
    super({ className, tag });
    this.options = options;
    this.createOptions();

    if (onClick) {
      this.onClick = onClick;
      this.addListener("change", (event) => {
        this.onClick(event.target.value);
      });
    }
  }

  createOptions() {
    this.options = this.options.map((item) => {
      const option = new Component({
        className: "select__item",
        tag: "option",
        text: item,
      });

      option.setAttribute("value", item);

      return option;
    });
    this.appendChildren(this.options);
  }
}
