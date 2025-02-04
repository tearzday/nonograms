import Component from "../Component.js";

export default class Modal extends Component {
  text = "";

  constructor({ className, text }) {
    super({ className });

    if (text) {
      this.text = text;
    }

    this.close = new Component(
      { className: "modal__close" },
      new Component({ className: "modal__line modal__line--first" }),
      new Component({ className: "modal__line modal__line--second" }),
    );

    this.close.addListener("click", () => {
      this.toggleClass("modal--hidden");
    });

    this.content = new Component({
      className: "modal__content",
      text: this.text,
    });

    this.container = new Component(
      { className: "modal__container" },
      this.close,
      this.content,
    );

    this.addListener("click", (event) => {
      if (event.target.className === "modal") {
        this.toggleClass("modal--hidden");
      }
    });

    this.append(this.container);
  }

  updateTextContent(text) {
    this.content.setTextContent(text);
  }

  generateScoreList(list) {
    this.updateTextContent("Last games:");

    list.sort((a, b) => {
      if (a.slice(0, 2) > b.slice(0, 2)) {
        return 1;
      }

      if (a.slice(0, 2) < b.slice(0, 2) || a.slice(3) < b.slice(3)) {
        return -1;
      }

      if (a.slice(0, 2) > b.slice(0, 2) || a.slice(3) > b.slice(3)) {
        return 1;
      }

      return 0;
    });
    const listNode = [];
    list.forEach((element, index) => {
      listNode.push(
        new Component({
          className: "modal__rating",
          text: `${index + 1}) ${element}`,
        }),
      );
    });

    this.content.appendChildren(listNode);
  }
}
