import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import userModel from './user.model';
import LoginForm from './LoginForm';
import Profile from './Profile';

class User extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    error: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    profile: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string.isRequired,
      githubUrl: PropTypes.string.isRequired,
    }),
  };

  render() {
    const {
      error,
      loading,
      profile,
      isAuthenticated,
      login,
      logout,
    } = this.props;

    return (
      <Container>
        {!isAuthenticated ? (
          <LoginForm onSubmit={login} error={error} loading={loading} />
        ) : (
          <Fragment>
            <Profile profile={profile} />
            <LogoutWrapper>
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </LogoutWrapper>
          </Fragment>
        )}
      </Container>
    );
  }
}

const Container = styled.div`
  flex: 1;
`;

const LogoutWrapper = styled.div`
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const LogoutButton = styled.button`
  padding: 8px 12px;
  border: none;
  background-color: slategray;
  color: #fff;
  border-radius: 4px;
  width: 120px;
`;

// You can also destruct `selectors` and `actions` for brewity
const { selectors, actions } = userModel;

export default connect(
  state => ({
    isAuthenticated: selectors.getIsAuthenticated(state),
    // profile: selectors.getProfile(state),
    profile: selectors.get('profile', state),
    loading: selectors.getLoading(state),
    error: selectors.getError(state),
  }),
  {
    login: actions.login,
    logout: actions.logout,
  }
)(User);
