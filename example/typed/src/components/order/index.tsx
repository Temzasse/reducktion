import * as React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import {
  FetchableStatus,
  FetchableValue,
  FetchableValueSimple,
} from 'reducktion';

import orderModel from './order.model';
import { Order } from './order.types';

class OrderComp extends React.Component<{
  orders: FetchableValue<Order[]>;
  fetchOrders: () => any;
  saveCreditCardState: FetchableValueSimple;
}> {
  render() {
    const { orders, fetchOrders, saveCreditCardState } = this.props;
    console.log(':::> saveCreditCardState', saveCreditCardState);

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={fetchOrders}>Fetch orders</button>

        {orders.status === FetchableStatus.LOADING && (
          <Loading>Loading orders...</Loading>
        )}

        {saveCreditCardState.status === FetchableStatus.LOADING && (
          <Loading>Saving card...</Loading>
        )}

        {saveCreditCardState.status === FetchableStatus.FAILURE && (
          <Loading>Failed to save card!</Loading>
        )}

        {saveCreditCardState.status === FetchableStatus.SUCCESS && (
          <Loading>Saved card!</Loading>
        )}

        {orders.data.length > 0 && (
          <Orders>
            {orders.data.map(order => (
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
    saveCreditCardState: orderModel.selectors.getAction('saveCreditCard')(
      state
    ),
  }),
  {
    fetchOrders: orderModel.actions.fetchOrders,
  }
)(OrderComp);
