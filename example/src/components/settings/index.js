import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { themed, colors } from '../../theme';
import settingsDuck from './settings.duck';

class Settings extends Component {
  static propTypes = {
    gpsEnabled: PropTypes.bool.isRequired,
    darkModeEnabled: PropTypes.bool.isRequired,
    notificationsEnabled: PropTypes.bool.isRequired,
    toggleNotifications: PropTypes.func.isRequired,
    toggleGps: PropTypes.func.isRequired,
    toggleDarkMode: PropTypes.func.isRequired,
    testThunk: PropTypes.func.isRequired,
  };

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
    gpsEnabled: settingsDuck.selectors.getGpsEnabled(state),
    // OR: gpsEnabled: settingsDuck.selectors.get('gpsEnabled', state),
    darkModeEnabled: settingsDuck.selectors.getDarkModeEnabled(state),
    notificationsEnabled: settingsDuck.selectors.getNotificationsEnabled(state),
  }),
  {
    toggleNotifications: settingsDuck.actions.toggleNotifications,
    toggleGps: settingsDuck.actions.toggleGps,
    toggleDarkMode: settingsDuck.actions.toggleDarkMode,
    testThunk: settingsDuck.actions.testThunk,
  }
)(Settings);
