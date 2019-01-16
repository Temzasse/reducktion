import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { themed, colors } from '../../theme';
import settingsModel from './settings.model';

interface Props {
  gpsEnabled: boolean;
  darkModeEnabled: boolean;
  notificationsEnabled: boolean;
  toggleNotifications: () => any;
  toggleGps: () => any;
  toggleDarkMode: () => any;
  testThunk: () => any;
}

class Settings extends Component<Props> {
  render() {
    const {
      gpsEnabled,
      darkModeEnabled,
      notificationsEnabled,
      toggleNotifications,
      toggleGps,
      toggleDarkMode,
      testThunk,
    } = this.props;

    return (
      <Container>
        <h1>Settings example</h1>

        <Button onClick={testThunk}>Test Thunk</Button>

        <Options>
          <Label>
            Dark mode on
            <Checkbox checked={darkModeEnabled} onChange={toggleDarkMode} />
          </Label>

          <Label>
            Notifications enabled
            <Checkbox
              checked={notificationsEnabled}
              onChange={toggleNotifications}
            />
          </Label>

          <Label>
            GPS enabled
            <Checkbox checked={gpsEnabled} onChange={toggleGps} />
          </Label>
        </Options>
      </Container>
    );
  }
}

const Container = styled.div`
  flex: 1;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
`;

/* eslint-disable indent */
const Label = styled.label`
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  max-width: 300px;
  margin-bottom: 16px;

  &:hover {
    background-color: ${themed({
      light: colors.gray[200],
      dark: colors.gray[900],
    })};
  }
`;
/* eslint-enable indent */

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-left: 16px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border: none;
  background-color: slategray;
  color: #fff;
  border-radius: 4px;
  width: 200px;
  margin-bottom: 32px;
`;

export default connect(
  state => ({
    gpsEnabled: settingsModel.selectors.get('gpsEnabled')(state),
    darkModeEnabled: settingsModel.selectors.get('darkModeEnabled')(state),
    notificationsEnabled: settingsModel.selectors.get('notificationsEnabled')(state),
  }),
  {
    toggleNotifications: settingsModel.actions.toggleNotifications,
    toggleGps: settingsModel.actions.toggleGps,
    toggleDarkMode: settingsModel.actions.toggleDarkMode,
    testThunk: settingsModel.actions.testThunk,
  }
)(Settings);
