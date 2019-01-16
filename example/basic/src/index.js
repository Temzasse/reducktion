import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';

// import registerServiceWorker from './registerServiceWorker';
import configureStore from './init';
import App from './App';

const store = configureStore();

const AppWrapper = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<AppWrapper />, document.getElementById('root'));
// registerServiceWorker();
