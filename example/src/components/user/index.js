import React, { Component } from 'react';
import styled from 'styled-components';

class User extends Component {
  render() {
    return (
      <Container>
        <h1>User example</h1>
      </Container>
    );
  }
}

const Container = styled.div`
  flex: 1;
`;

export default User;
