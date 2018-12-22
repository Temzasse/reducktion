import React, { Component } from 'react';
import styled from 'styled-components';

import OrderExample from './components/order';

class App extends Component {
  render() {
    return (
        <AppContainer>
          <Container>
            <Section>
              <OrderExample />
            </Section>
          </Container>
        </AppContainer>
    );
  }
}

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  transition: background-color 0.2s ease-out;
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
`;

export default App;
