import React, { Component } from 'react';
import styled from 'styled-components';

import OrderExample from './components/order';
import UserExample from './components/user';
import SettingsExample from './components/settings';

class App extends Component {
  render() {
    return (
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
    );
  }
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding: 48px;
`;

const Section = styled.div`
  padding: 32px;
  background-color: #fff;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0px 4px 16px rgba(0,0,0,0.1);
`;

export default App;
