import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { STATUSES } from 'reducktion'; // eslint-disable-line

import { fetchablePropType, isLoading } from '../../helpers';
import orderDucks from './order.duck';
import settingsDuck from '../settings/settings.duck';

class Order extends Component {
  static propTypes = {
    orders: fetchablePropType(PropTypes.array.isRequired),
    fetchOrders: PropTypes.func.isRequired,
    fetchPackages: PropTypes.func.isRequired,
  };

  componentDidMount() {
    // this.props.fetchPackages();
  }

  render() {
    const { orders, fetchOrders } = this.props;

    return (
      <Container>
        <h1>Order example</h1>
        <button onClick={fetchOrders}>Fetch orders</button>

        {isLoading(orders) && <Loading>Loading orders..</Loading>}

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
    // orders: orderDucks.selectors.getOrders(state),
    orders: orderDucks.selectors.get('orders', state),
  }),
  {
    testThunk: settingsDuck.actions.testThunk,
    fetchOrders: orderDucks.actions.fetchOrders,
    // Use `init` action instead of the default action to not start loading
    // automatically when the action is dispatched
    fetchPackages: orderDucks.actions.fetchPackages.init,
  }
)(Order);
