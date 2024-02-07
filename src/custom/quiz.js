/**
 * A main quiz component
 * @namespace custom
 * @component quiz
 */
AFRAME.registerComponent("quiz", {
  schema: {
    questions: { type: "array", default: [] },
    qOptions: { type: "array", default: [] },
    value: { type: "string", default: "" },
    answers: { type: "array", default: [] },
    time_limit: { type: "int", default: -1 }
  },

  init() {
    this.index = 0;
    this.startY = 1.5;

    this.el.setAttribute("position", "-5 0 0");

    const prev = document.createElement("a-entity");
    prev.setAttribute("prev-quiz-button", "");
    this.el.appendChild(prev);
    prev.setAttribute("position", "1.5 1 2");

    const next = document.createElement("a-entity");
    next.setAttribute("next-quiz-button", "");
    next.setAttribute("position", "2.5 1 2");
    this.el.appendChild(next);
    this.nextButton = next; // Store a reference to the next button for later use

    if (this.data.time_limit != -1) {
      this.timer = document.createElement("a-entity");
      this.timer.setAttribute("timer", "");

      this.timer.setAttribute("rotation", "45 0 0");
      this.el.appendChild(this.timer);
    }

    this.submitButton = document.createElement("a-entity");
    this.submitButton.setAttribute("submit-button", "");
    this.submitButton.setAttribute("position", "2 0.5 2");
    this.submitButton.setAttribute("scale", "2, 1, 0");
    this.el.appendChild(this.submitButton);

    this.createCanvas();
    this.updateQuestions();
  },
  updateQuestions() {
    const currentQuestion = this.data.questions[this.index];
    const currentOptions = this.data.qOptions[this.index];

    // Remove existing options
    this.el.querySelectorAll("[quiz-option]").forEach(optionEntity => {
      this.el.removeChild(optionEntity);
    });

    this.el.querySelectorAll("[quiz-question]").forEach(optionEntity => {
      this.el.removeChild(optionEntity);
    });

    // Add new options based on the current index
    this.startY = 1.5;
    currentOptions.forEach(option => {
      const optionEntity = document.createElement("a-entity");
      optionEntity.setAttribute("quiz-option", { value: option, index: this.data.index });
      this.el.appendChild(optionEntity);
      optionEntity.setAttribute("position", `3 ${this.startY} 2`);
      this.startY += 0.5;
    });

    const question = document.createElement("a-entity");
    question.setAttribute("quiz-question", `value: ${currentQuestion};`);
    this.el.appendChild(question);
    question.setAttribute("position", `2 ${this.startY} 2`);

    // Dispatch a custom event to notify child components about the update
    this.el.dispatchEvent(new Event("questions-updated"));

    // Get the width of the quiz-question element
    const questionText = this.el.querySelector("[quiz-question]");
    const questionTextWidth = questionText ? questionText.outlineWidth : 20; // Default width if not found

    this.timer.setAttribute("position", `2 ${this.startY + 1} 2.25`);

    // Update the canvas width based on the width of the quiz-question element
    this.updateCanvas(questionTextWidth);
  },

  updateCanvas(width) {
    // Check if the canvas and plane exist
    if (!this.canvas) {
      // Create a new canvas if it doesn't exist
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("id", "quiz-canvas");
      this.canvas.width = width;
      this.canvas.height = (this.startY + 0.5) * 100;
    } else {
      // Clear the canvas and update its size
      const ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = width;
      this.canvas.height = (this.startY + 0.5) * 100;
    }

    // Create a THREE.js texture from the canvas
    const texture = new THREE.CanvasTexture(this.canvas);

    // Remove existing plane if it exists
    if (this.plane) {
      this.el.sceneEl.object3D.remove(this.plane);
    }

    // Create a plane geometry with the texture
    const geometry = new THREE.PlaneGeometry(3, this.startY + 0.5, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      color: new THREE.Color(0, 0, 0), // Black color
      transparent: true,
      opacity: 0.5 // Adjust the opacity as needed
    });

    this.plane = new THREE.Mesh(geometry, material);

    // Set the position of the plane
    this.plane.position.set(-3, 2, 1.98);

    // this.el.appendChild(this.plane);

    // Add the plane to the scene
    this.el.sceneEl.object3D.add(this.plane);
  },
  update() {
    // Add any additional logic for the update if needed
  },

  createCanvas() {
    // Initial canvas creation
    this.updateCanvas(20); // Default width if not found
  }
});

AFRAME.registerComponent("timer", {
  init() {
    this.totalSeconds = this.el.parentElement.components.quiz.data.time_limit * 60; // Initial time in seconds
    this.text = document.createElement("a-entity");
    this.text.setAttribute("id", "timer");
    this.text.setAttribute("text", `value: ${this.formatTime(this.totalSeconds)}; fontSize: ${0.5}}`);
    this.el.appendChild(this.text);

    // Initialize variables for timing
    this.counter = 0;
    this.tickRate = 60; // Assuming 60 ticks per second
  },
  tick() {
    // Increment the counter
    this.counter++;

    // Check if 1 second has passed
    if (this.counter >= this.tickRate) {
      this.totalSeconds -= 1;
      this.text.setAttribute("text", `value: ${this.formatTime(this.totalSeconds)}; fontSize: ${0.5}`);

      // Reset the counter
      this.counter = 0;
    }
  },
  formatTime(totalSeconds) {
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // Ensure leading zeros if necessary
    let hoursStr = String(hours).padStart(2, "0");
    let minutesStr = String(minutes).padStart(2, "0");
    let secondsStr = String(seconds).padStart(2, "0");

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  }
});
AFRAME.registerComponent("submit-button", {
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
    entity.setAttribute("scale", "0.1 0.1 0.1");

    this.text = document.createElement("a-entity");
    this.text.setAttribute("id", "question-text");
    this.text.setAttribute("text", `value: Submit; fontSize: ${0.1}`);
    this.text.setAttribute("position", "0 0 1.25");
    this.el.appendChild(this.text);

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

    this.onClicked = async () => {
      this.clicked = !this.clicked;
      const quizData = this.parentEl.components.quiz.data;
      const answers = quizData.answers;
      const quizID = localStorage.getItem("quiz-id");

      await fetch(`http://localhost:3000/quiz/submit/${quizID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: answers }) // Convert the data object to a JSON string
      });
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
    this.el.object3D.removeListener("interact", this.onClicked);
  },

  update() {
    this.updateButtonState();
  },
  updateButtonState() {
    const hovering = this.hovering;
    const disabled = this.data.disabled;

    if (this.data.tooltip && hovering) {
      const tooltipText =
        (this.data.active ? this.data.activeTooltipText : this.data.tooltipText) + (disabled ? " Disabled" : "");
      this.data.tooltip.querySelector("[text]").setAttribute("text", "value", tooltipText);
    }
  }
});
