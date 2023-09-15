import React from "react";
import { Link } from "react-router-dom";
import "../canvas/components.css";

function Course(props) {
  const course = props.course;

  return (
      <div className="course-card">
        <h4>{course.name}</h4>
      </div>
  );
}

export default Course;
