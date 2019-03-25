/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @website - https://tiniru.com
 * 
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';  
import App from './App';
//import * as serviceWorker from './serviceWorker';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(
                <HashRouter>
                    <App />
                </HashRouter>,
                document.getElementById('root')
                );


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.register();
