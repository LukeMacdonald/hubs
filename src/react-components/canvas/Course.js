import React from "react";
import { Link } from "react-router-dom";
import "../canvas/components.css";

function Course(props) {
  const course = props.course;

  return (
    <Link to={`/courses/${course.id}`} className="course-card-link">
      <div className="course-card">
        <h4>{course.name}</h4>
      </div>
    </Link>
  );
}

export default Course;
