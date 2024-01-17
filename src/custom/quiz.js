/**
 * A main quiz component
 * @namespace custom
 * @component quiz
 */
AFRAME.registerComponent("quiz", {
  schema: {
    questions: { type: "array", default: [] },
    qOptions: { type: "array", default: [] },
    value: { type: "string", default: "" }
  },

  init() {
    this.index = 0;
    this.startY = 1.5;

    if (this.data.questions.length === 0 || this.data.qOptions.length === 0) {
      this.data.questions = [
        "What is 1 + 1?",
        "Which of the following is not a programming language?",
        "Earth is the fifth planet from the sun."
      ];
      this.data.qOptions = [
        ["1", "2", "3", "4"],
        ["C#", "Java", "Python", "MaxScript"],
        ["True", "False"]
      ];
    }

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
      optionEntity.setAttribute("quiz-option", `value: ${option}`);
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

    // Update the canvas width based on the width of the quiz-question element
    this.updateCanvas(questionTextWidth);
  },

  updateCanvas(width) {
    console.log(width);
    // Check if the canvas and plane exist
    if (!this.canvas) {
      // Create a new canvas if it doesn't exist
      this.canvas = document.createElement("canvas");
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
