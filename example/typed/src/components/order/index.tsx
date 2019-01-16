import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FetchableStatus, FetchableValue } from 'reducktion';

import orderModel from './order.model';
import { Order } from './order.types';

class OrderComp extends React.Component<{
  orders: FetchableValue<Order[]>;
  fetchOrders: () => any;
}> {
  render() {
    const { orders, fetchOrders } = this.props;

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={fetchOrders}>Fetch orders</button>

        {orders.status === FetchableStatus.LOADING && (
          <Loading>Loading orders...</Loading>
        )}

        {orders.data.length > 0 && (
          <Orders>
            {orders.data.map((order) => (
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
    orders: orderModel.selectors.get('orders')(state),
  }),
  {
    fetchOrders: orderModel.actions.fetchOrders,
  }
)(OrderComp);
