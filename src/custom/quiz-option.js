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
    value: { type: "string", default: "" },
    index: { type: "int" }
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
    entity.setAttribute("scale", "0.1 0.1 0.1");

    this.question = document.createElement("a-entity");
    this.question.setAttribute("id", "question-text");
    this.question.setAttribute("text", `value: ${this.data.value}; fontSize: ${0.1}`);
    this.question.setAttribute("position", "-2 0 0");
    this.el.appendChild(this.question);

    this.onHover = () => {
      this.hovering = true;
    };
    this.onHoverOut = () => {
      this.hovering = false;
    };
    this.onClicked = () => {
      this.clicked = !this.clicked;
      const index = this.parentEl.components.quiz.index;
      this.parentEl.components.quiz.data.answers[index] = this.clicked ? this.data.value : null;

      this.question.setAttribute("text", `color: #eb4034;`);

      this.hovering = this.clicked;
      this.data.active = this.clicked;
      if (this.data.tooltip) {
        this.data.tooltip.object3D.visible = true;
      }
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
  tick() {
    const index = this.parentEl.components.quiz.index;
    if (this.parentEl.components.quiz.data.answers[index] !== this.data.value) {
      this.question.removeAttribute("text", "color");
      this.clicked = false;
    } else {
      this.question.setAttribute("text", `color: #eb4034;`);
      this.clicked = true;
    }
  },

  update() {
    this.updateButtonState();
  },
  updateButtonState() {}
});
