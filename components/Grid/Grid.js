import Component from "../Component.js";

export default class Grid extends Component {
  constructor({ className, items, onClick, type, onContext }) {
    super({ className });

    if (items) {
      this.unpackingItems(items, type);
    }

    if (className === "grid__cell" && onClick) {
      this.onClick = onClick;
      this.addListener("click", () => {
        this.checkNonogram();
      });

      this.addListener("contextmenu", (event) => {
        event.preventDefault();
        this.addCrossCell();
      });
    }

    if (onContext) {
      this.onContext = onContext;
      this.addListener("contextmenu", () => {
        this.onContext();
      });
    }
  }

  unpackingItems(items, type) {
    if (!Array.isArray(items[0])) {
      this.appendChildren(items);
    } else {
      items.forEach((element) => {
        if (element.length !== 1 && type === "col") {
          this.append(
            new Component({ className: "grid__container-col" }, ...element),
          );
        } else if (element.length !== 1 && type === "row") {
          this.append(
            new Component({ className: "grid__container-row" }, ...element),
          );
        } else {
          this.appendChildren(element);
        }
      });
    }
  }

  checkNonogram() {
    this.toggleClass("grid__cell--active");
    this.onClick(this.getNode().getAttribute("data-position"));

    if (
      this.getNode().classList.contains("grid__cell--cross") &&
      this.getNode().classList.contains("grid__cell--active")
    ) {
      this.addCrossCell();
    }
  }

  addCrossCell() {
    this.toggleClass("grid__cell--cross");

    if (this.getNode().classList.contains("grid__cell--cross")) {
      this.appendChildren([
        new Component({ className: `grid__cell-line first-line` }),
        new Component({
          className: `grid__cell-line second-line`,
        }),
      ]);

      if (this.getNode().classList.contains("grid__cell--active")) {
        this.checkNonogram();
      }
    } else {
      this.destroyChildren();
    }
  }

  offClick() {
    this.addClass("no-point");
  }
}
