import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Last-resort fallback so a crash never leaves a blank page.
 * Kept in plain English and free of app context, because the context itself may be what failed.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TINwise crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="mt-3 text-mute">
          Please reload the page. Nothing you entered was saved or sent anywhere. For official information, visit{" "}
          <a className="text-accent underline" href="https://www.ird.gov.lk">ird.gov.lk</a>.
        </p>
        <button className="btn-primary mt-8 px-6 py-3" onClick={() => location.reload()}>
          Reload
        </button>
      </main>
    );
  }
}
