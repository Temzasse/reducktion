import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { STATUSES } from 'reducktion';

import orderDucks from './order.duck';

class Order extends Component<{
  orders: any;
  fetchOrders: () => any;
}> {
  render() {
    const { orders, fetchOrders } = this.props;

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={fetchOrders}>Fetch orders</button>

        {orders.status === STATUSES.LOADING && (
          <Loading>Loading orders..</Loading>
        )}

        {orders.data.length > 0 && (
          <Orders>
            {orders.data.map((order: any) => (
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

const Loading = styled.div`
  margin-top: 16px;
`;

const Orders = styled.ul`
  list-style: none;
  margin-top: 16px;
`;

export default connect(
  state => ({
    orders: orderDucks.selectors.get('orders')(state),
  }),
  {
    fetchOrders: orderDucks.actions.fetchOrders,
  }
)(Order);
