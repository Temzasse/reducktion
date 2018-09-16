import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

class LoginForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
  };

  state = {
    username: '',
    password: '',
  };

  handleChange = ({ target }) => this.setState({ [target.name]: target.value });

  handleSubmit = event => {
    event.preventDefault();
    const { username, password } = this.state;
    this.props.onSubmit({ username, password });
  };

  render() {
    const { error, loading } = this.props;
    const { username, password } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} autocomplete="off">
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

        <SubmitButton disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </SubmitButton>

        {error && <Error>Login failed, check username or password.</Error>}
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
