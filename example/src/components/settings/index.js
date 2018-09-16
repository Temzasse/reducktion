import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { themed, colors } from '../../theme';
import settingsDucks from './settings.ducks';

class Settings extends Component {
  static propTypes = {
    gpsEnabled: PropTypes.bool.isRequired,
    darkModeEnabled: PropTypes.bool.isRequired,
    notificationsEnabled: PropTypes.bool.isRequired,
    toggleNotifications: PropTypes.func.isRequired,
    toggleGps: PropTypes.func.isRequired,
    toggleDarkMode: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Container>
        <h1>Settings example</h1>
        <Options>
          <Label>
            Dark mode on
            <Checkbox
              checked={this.props.darkModeEnabled}
              onChange={this.props.toggleDarkMode}
            />
          </Label>

          <Label>
            Notifications enabled
            <Checkbox
              checked={this.props.notificationsEnabled}
              onChange={this.props.toggleNotifications}
            />
          </Label>

          <Label>
            GPS enabled
            <Checkbox
              checked={this.props.gpsEnabled}
              onChange={this.props.toggleGps}
            />
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

export default connect(
  state => ({
    gpsEnabled: settingsDucks.selectors.getGpsEnabled(state),
    darkModeEnabled: settingsDucks.selectors.getDarkModeEnabled(state),
    notificationsEnabled: settingsDucks.selectors.getNotificationsEnabled(
      state
    ),
  }),
  {
    toggleNotifications: settingsDucks.actions.toggleNotifications,
    toggleGps: settingsDucks.actions.toggleGps,
    toggleDarkMode: settingsDucks.actions.toggleDarkMode,
  }
)(Settings);
