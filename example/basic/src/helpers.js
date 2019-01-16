import PropTypes from 'prop-types';
import { FetchableStatus } from 'reducktion'; // eslint-disable-line

export const sleep = (ms = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const fetchablePropType = (
  dataPropType,
  errPropType = PropTypes.string
) =>
  PropTypes.shape({
    data: dataPropType,
    error: errPropType,
    status: PropTypes.oneOf(Object.values(FetchableStatus)).isRequired,
  }).isRequired;

export const isLoading = obj => obj.status === FetchableStatus.LOADING;
