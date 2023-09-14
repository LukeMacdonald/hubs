import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import markdownit from "markdown-it";
import { FormattedMessage } from "react-intl";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import { AuthContextProvider } from "./react-components/auth/AuthContext";
import { store } from "./utils/store-instance";
window.APP = { store };

import registerTelemetry from "./telemetry";
import "./react-components/styles/global.scss";
import "./assets/stylesheets/whats-new.scss";
import { PageContainer } from "./react-components/layout/PageContainer";
import { ThemeProvider } from "./react-components/styles/theme";

registerTelemetry("/canvas", "Canvas");
function formatDate(value) {
  return value && new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

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
    courses: [],
    pullRequests: [],
    moreCursor: null,
    hasMore: true,
    currentDate: null
  };
  async componentDidMount() {
    // Call getCanvas when the component mounts
    await this.getCanvas();
  }

  async getCanvas() {
    const endpoint = "/api/v1/canvas";
    const params = ["source=hubs", this.state.moreCursor ? `cursor=${this.state.moreCursor}` : ""].join("&");

    let moreCursor = null;
    let pullRequests = [];
    try {
      const respJson = await fetch(`${endpoint}?${params}`).then(r => r.json());
      moreCursor = respJson.moreCursor;
      pullRequests = respJson.pullRequests;
    } catch (e) {
      console.error("Error fetching whats-new", e);
    }

    let currentDate = this.state.currentDate;

    for (let i = 0; i < pullRequests.length; i++) {
      const pullRequest = pullRequests[i];
      if (formatDate(pullRequest.mergedAt) === currentDate) {
        pullRequest.mergedAt = null;
      } else {
        currentDate = formatDate(pullRequest.mergedAt);
      }
      pullRequest.body = md.render(pullRequest.body);
    }
    const courses = await getCourses();
    console.log(courses);

    this.setState({
      courses: courses,
      hasMore: !!moreCursor,
      moreCursor,
      currentDate,
      pullRequests: [...this.state.pullRequests, ...pullRequests]
    });
  }

  render() {
    return (
      <PageContainer>
        <div className="container">
          <div className="main">
            <div className="content">
              <h1>
                <FormattedMessage id="canvas.title" defaultMessage="My Courses" />
              </h1>
            </div>
          </div>
        </div>
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
