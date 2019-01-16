import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';

import { themed, colors } from './theme';
import settingsModel from './components/settings/settings.model';
import SettingsExample from './components/settings';
import OrderExample from './components/order';
import UserExample from './components/user';

class App extends Component {
  static propTypes = {
    themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  };

  render() {
    const { themeMode } = this.props;
    return (
      <ThemeProvider theme={{ mode: themeMode }}>
        <AppContainer>
          <Container>
            <Section>
              <OrderExample />
            </Section>

            <Section>
              <UserExample />
            </Section>

            <Section>
              <SettingsExample />
            </Section>
          </Container>
        </AppContainer>
      </ThemeProvider>
    );
  }
}

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  transition: background-color 0.2s ease-out;
  background-color: ${themed({
    light: colors.gray[200],
    dark: colors.gray[900],
  })};
  color: ${themed({
    light: colors.black,
    dark: colors.white,
  })};
`;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 48px;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 32px;
  box-shadow: ${themed({
    light: '0px 4px 16px rgba(0, 0, 0, 0.1)',
    dark: '0px 4px 16px rgba(0, 0, 0, 0.4)',
  })};
  background-color: ${themed({
    light: colors.white,
    dark: colors.gray[800],
  })};
`;

export default connect(state => ({
  themeMode: settingsModel.selectors.getThemeMode(state),
}))(App);
