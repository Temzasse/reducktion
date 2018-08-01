import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import orderDucks from './order.ducks';
import settingsDucks from '../settings/settings.ducks';

class Order extends Component {
  render() {
    const { orders } = this.props;

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={this.props.fetchOrders}>Fetch orders</button>

        {orders.length > 0 && (
          <Orders>
            {orders.map(order => (
              <li key={order.id}>{order.name}</li>
            ))}
          </Orders>
        )}
      </Container>
    );
  }
}

const Container = styled.div`
  flex: 1;
`;

const Orders = styled.ul`
  list-style: none;
  margin-top: 16px;
`;

export default connect(
  state => ({
    orders: orderDucks.selectors.getOrders(state),
  }),
  {
    testThunk: settingsDucks.actions.testThunk,
    fetchOrders: orderDucks.actions.fetchOrders,
  }
)(Order);
