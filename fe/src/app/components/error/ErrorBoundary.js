import React from "react";
import ErrorBoundaryContent from "./ErrorBoundaryContent";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("err boundary", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryContent />;
    }

    return this.props.children;
  }
}
