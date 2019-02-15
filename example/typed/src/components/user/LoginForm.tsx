import * as React from 'react';
import styled from 'styled-components';
import { FetchableValue, FetchableStatus } from 'reducktion';

import { LoginInput } from './user.types';
import { Profile } from './user.types';

interface Props {
  onSubmit: (data: LoginInput) => any;
  profile: FetchableValue<Profile | null>;
}

interface State {
  username: string;
  password: string;
}

class LoginForm extends React.Component<Props, State> {
  state = {
    username: '',
    password: '',
  };

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newState = { [e.currentTarget.name]: e.currentTarget.value } as any;
    this.setState(newState);
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, password } = this.state;
    this.props.onSubmit({ username, password });
  };

  render() {
    const { profile } = this.props;
    const { username, password } = this.state;
    const isLoading = profile.status === FetchableStatus.LOADING;
    const hasError = profile.status === FetchableStatus.FAILURE;

    return (
      <Form onSubmit={this.handleSubmit} autoComplete="off">
        <h1>User example</h1>

        <Input
          name="username"
          value={username}
          placeholder="Username"
          onChange={this.handleChange}
        />
        <Input
          name="password"
          type="password"
          value={password}
          placeholder="Password"
          onChange={this.handleChange}
        />

        <SubmitButton disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </SubmitButton>

        {hasError && <Error>Login failed, check username or password.</Error>}
      </Form>
    );
  }
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 8px 12px;
  margin-bottom: 16px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-width: 300px;
`;

const SubmitButton = styled.button.attrs({
  type: 'submit',
})`
  padding: 8px 12px;
  border: none;
  background-color: slategray;
  color: #fff;
  border-radius: 4px;
  width: 120px;
`;

const Error = styled.span`
  margin-top: 16px;
  color: tomato;
  font-size: 12px;
`;

export default LoginForm;
