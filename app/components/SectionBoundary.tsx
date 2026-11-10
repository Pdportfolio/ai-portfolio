"use client";

import { Component, Fragment, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; generation: number; retries: number };

export class SectionBoundary extends Component<Props, State> {
  state: State = { hasError: false, generation: 0, retries: 0 };
  retryTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch() {
    if (this.state.retries >= 3) return;
    this.retryTimer = setTimeout(() => {
      this.setState((current) => ({
        hasError: false,
        generation: current.generation + 1,
        retries: current.retries + 1,
      }));
    }, 120);
  }

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  render() {
    if (this.state.hasError) return null;

    return <Fragment key={this.state.generation}>{this.props.children}</Fragment>;
  }
}
