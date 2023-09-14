import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import InfiniteScroll from "react-infinite-scroller";
import markdownit from "markdown-it";
import { FormattedMessage } from "react-intl";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import { AuthContextProvider } from "./react-components/auth/AuthContext";
import { store } from "./utils/store-instance";
import { Row, Col } from "react-bootstrap";
import Course from "./react-components/canvas/Course";

window.APP = { store };

import registerTelemetry from "./telemetry";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/whats-new.scss";
import { PageContainer } from "./react-components/layout/PageContainer";
import { Spinner } from "./react-components/misc/Spinner";
import { ThemeProvider } from "./react-components/styles/theme";

registerTelemetry("/canvas", "Canvas");

const md = markdownit();
const DOMAIN = "http://131.170.250.239:49152";

async function getCourses() {
  try {
    const endpoint = `${DOMAIN}/course/teacher`;

    const params = { method: "GET", headers: { "Content-Type": "application/json" } };

    const response = await fetch(endpoint, params);
    const courses = await response.json();
    return courses;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

class Canvas extends Component {
  state = {
    courses: []
  };

  async getCanvas() {
    const courses = await getCourses();

    this.setState({ courses: courses });
  }

  render() {
    return (
      <PageContainer>
        <InfiniteScroll
          hasMore={this.state.hasMore}
          loader={
            <div key="loader" className="loader">
              <Spinner />
            </div>
          }
          useWindow={false}
          getScrollParent={() => document.body}
        >
          <div className="container">
            <div className="main">
              <div className="content">
                <h1>
                  <FormattedMessage id="whats-new-page.title" defaultMessage="My Course's" />
                </h1>
                <Row>
                  {this.courses.map((course, index) => (
                    <Col key={index} lg={4} md={6} sm={12}>
                      {" "}
                      {/* Use Bootstrap Col with size 4 for large screens */}
                      <Course course={course} />
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </div>
        </InfiniteScroll>
      </PageContainer>
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("ui-root");

  const root = createRoot(container);
  root.render(
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <AuthContextProvider store={store}>
          <Canvas />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>
  );
});
