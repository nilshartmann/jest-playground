// polyfill for IE
require('es6-promise').polyfill();
require('whatwg-fetch');

import React from 'react';
import ReactDOM from 'react-dom';

import GreetingView from './GreetingView';

const mountNode = document.getElementById('mount');
ReactDOM.render(<GreetingView />, mountNode);