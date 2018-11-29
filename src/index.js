import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
 import ManazeApp from './manaze/Manaze';
import registerServiceWorker from './registerServiceWorker';

 ReactDOM.render(<ManazeApp />, document.getElementById('root'));
// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
