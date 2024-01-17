/**
 * A button with an image, tooltip, hover states.
 * @namespace custom
 * @component next-quiz-button
 */
AFRAME.registerComponent("next-quiz-button", {
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
    activeTooltipText: { type: "string" }
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
    entity.setAttribute("icon-button", "image: next.png; hoverImage: next.png");
    entity.setAttribute("scale", "0.075 0.075 0.075");
    entity.setAttribute("position", "0 0 0.001");

    this.onHover = () => {
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
      this.incrementQuizIndex();
      // this.updateQuestionText();
    };
    this.onQuestionUpdated = () => {
      // You might want to update the button state based on the new index here
      // For example, you can check if the current index is the last one and update accordingly
      const quizComponent = this.parentEl.components.quiz;
      if (quizComponent && quizComponent.index === quizComponent.questions.length - 1) {
        // Handle reaching the last question
        console.log("Reached the last question!");
      }
    };
  },

  play() {
    //this.updateButtonState();
    this.el.object3D.addEventListener("hovered", this.onHover);
    this.el.object3D.addEventListener("unhovered", this.onHoverOut);
    this.el.object3D.addEventListener("interact", this.onClicked);

    this.el.sceneEl.addEventListener("questions-updated", this.onQuestionUpdated);
  },

  pause() {
    this.el.object3D.removeEventListener("hovered", this.onHover);
    this.el.object3D.removeEventListener("unhovered", this.onHoverOut);
  },

  update() {
    this.updateButtonState();
  },
  incrementQuizIndex() {
    const quizComponent = this.parentEl.components.quiz;
    if (quizComponent) {
      quizComponent.index += 1;
      if (quizComponent.index >= quizComponent.data.questions.length) {
        quizComponent.index = 0;
      }
      quizComponent.updateQuestions();
    } else {
      console.error("Quiz component not found.");
    }
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
