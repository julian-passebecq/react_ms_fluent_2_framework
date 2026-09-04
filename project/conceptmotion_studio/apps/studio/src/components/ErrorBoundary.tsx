import React from 'react';
import { Button, MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';

interface State { error?: Error }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="route-error" role="alert">
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>This surface could not render.</MessageBarTitle>
            {this.state.error.message}
          </MessageBarBody>
        </MessageBar>
        <Button onClick={() => this.setState({ error: undefined })}>Try again</Button>
      </div>
    );
  }
}
