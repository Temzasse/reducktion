import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import orderDucks from './order.duck';
import settingsDuck from '../settings/settings.duck';

class Order extends Component {
  static propTypes = {
    orders: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    fetchOrders: PropTypes.func.isRequired,
  };

  render() {
    const { orders, fetchOrders, isLoading } = this.props;

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={fetchOrders}>Fetch orders</button>

        {isLoading && <Loading>Loading orders..</Loading>}

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

const Loading = styled.div`
  margin-top: 16px;
`;

const Orders = styled.ul`
  list-style: none;
  margin-top: 16px;
`;

export default connect(
  state => ({
    // orders: orderDucks.selectors.getOrders(state),
    orders: orderDucks.selectors.get('orders', state),
    isLoading: orderDucks.selectors.getIsLoading(state),
  }),
  {
    testThunk: settingsDuck.actions.testThunk,
    fetchOrders: orderDucks.actions.fetchOrders,
  }
)(Order);
