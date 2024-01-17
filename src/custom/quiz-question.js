/**
 * A component for quiz question to be displayed
 * @namespace custom
 * @component quiz-question
 */
AFRAME.registerComponent("quiz-question", {
  schema: {
    value: { type: "string", default: "" }
  },
  init: function () {
    // Create a box geometry and material
    const geometry = new THREE.BoxGeometry(0, 1, 1);
    const material = new THREE.MeshPhysicalMaterial();

    // Create the mesh
    this.boxMesh = new THREE.Mesh(geometry, material);

    // Add the mesh to the object3D of the A-Frame entity
    // this.el.object3D.add(this.boxMesh);
    this.question = document.createElement("a-entity");
    this.question.setAttribute("id", "question-text");
    this.question.setAttribute("text", `value: ${this.data.value}; fontSize: ${0.2}; maxWidth: 2; textAlign:center;`);
    // this.question.setAttribute("position", "0 0 0");
    this.el.appendChild(this.question);
  }
});
