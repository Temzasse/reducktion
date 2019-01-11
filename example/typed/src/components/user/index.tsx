import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Fetchable } from 'reducktion';

import userDuck from './user.duck';
import LoginForm from './LoginForm';
import Profile from './Profile';
import { LoginInput, Profile as ProfileType } from './user.types';

interface Props {
  login: (data: LoginInput) => any;
  logout: () => any;
  profile: Fetchable<ProfileType | null>;
  isAuthenticated: boolean;
}

class User extends React.Component<Props> {
  render() {
    const { profile, isAuthenticated, login, logout } = this.props;

    return (
      <Container>
        {!isAuthenticated ? (
          <LoginForm onSubmit={login} profile={profile} />
        ) : (
          <React.Fragment>
            <Profile profile={profile} />
            <LogoutWrapper>
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </LogoutWrapper>
          </React.Fragment>
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
const { selectors, actions } = userDuck;

export default connect(
  state => ({
    isAuthenticated: selectors.get('isAuthenticated')(state),
    profile: selectors.get('profile')(state),
  }),
  {
    login: actions.login,
    logout: actions.logout,
  }
)(User);
