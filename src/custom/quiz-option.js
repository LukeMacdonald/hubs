/**
 * A component to represent the options to quizzes
 * @namespace custom
 * @component quiz-option
 */
AFRAME.registerComponent("quiz-option", {
  schema: {
    image: { type: "string" },
    hoverImage: { type: "string" },
    activeImage: { type: "string" },
    activeHoverImage: { type: "string" },
    disabledImage: { type: "string" },
    active: { type: "boolean" },
    disabled: { type: "boolean" },
    tooltip: { type: "selector" },
    tooltipText: { type: "string" },
    activeTooltipText: { type: "string" },
    value: { type: "string", default: "" }
  },

  init() {
    this.el.object3D.matrixNeedsUpdate = true;
    this.clicked = false;
    this.parentEl = this.el.parentElement;

    this.el.setAttribute("is-remote-hover-target", "");
    this.el.setAttribute("tags", "singleActionButton:true;");
    this.el.setAttribute("mixin", "rounded-text-action-button");

    const entity = document.createElement("a-entity");
    this.el.appendChild(entity);
    entity.setAttribute("sprite", "");
    entity.setAttribute("icon-button", "");
    entity.setAttribute("scale", "0.1 0.1 0.1");

    this.question = document.createElement("a-entity");
    this.question.setAttribute("id", "question-text");
    this.question.setAttribute("text", `value: ${this.data.value}; fontSize: ${0.1}`);
    this.question.setAttribute("position", "-2 0 0");
    this.el.appendChild(this.question);

    this.onHover = () => {
      console.log("Hovered over parent element:", this.parentEl);
      this.hovering = true;
      if (this.data.tooltip) {
        this.data.tooltip.object3D.visible = true;
      }
    };
    this.onHoverOut = () => {
      this.hovering = false;
      if (this.data.tooltip) {
        this.data.tooltip.object3D.visible = false;
      }
    };
    this.onClicked = () => {
      this.clicked = !this.clicked;
      console.log(this.data.value);
    };
  },

  play() {
    this.el.object3D.addEventListener("hovered", this.onHover);
    this.el.object3D.addEventListener("unhovered", this.onHoverOut);
    this.el.object3D.addEventListener("interact", this.onClicked);
  },

  pause() {
    this.el.object3D.removeEventListener("hovered", this.onHover);
    this.el.object3D.removeEventListener("unhovered", this.onHoverOut);
  },

  update() {
    this.updateButtonState();
  },
  updateButtonState() {
    const hovering = this.hovering;
    const active = this.data.active;
    const disabled = this.data.disabled;

    let image;
    if (disabled) {
      image = "disabledImage";
    } else if (active) {
      image = hovering ? "activeHoverImage" : "activeImage";
    } else {
      image = hovering ? "hoverImage" : "image";
    }

    if (this.el.components.sprite) {
      if (this.data[image]) {
        this.el.setAttribute("sprite", "name", this.data[image]);
      } else {
        console.warn(`No ${image} image on me.`, this);
      }
    } else {
      console.error("No sprite.");
    }

    if (this.data.tooltip && hovering) {
      const tooltipText =
        (this.data.active ? this.data.activeTooltipText : this.data.tooltipText) + (disabled ? " Disabled" : "");
      this.data.tooltip.querySelector("[text]").setAttribute("text", "value", tooltipText);
    }
  }
});
