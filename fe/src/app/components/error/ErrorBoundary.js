import React from "react";
import ErrorBoundaryContent from "./ErrorBoundaryContent";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, hasError: true });

    console.error("err boundary", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryContent error={this.state.error} />;
    }

    return this.props.children;
  }
}
