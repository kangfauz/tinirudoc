/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @author - https://github.com/kangfauz
 * 
 * @website - https://tiniru.com
 * 
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom'
class Header extends Component {
   render() {
      return (
         <div > 
            <nav id="topnav" className="navbar navbar-expand-lg navbar-light bg-light fixed-top border-bottom">
                <Link className="navbar-brand tiniru "   to="/">Tini<span >ru</span></Link>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                      <a className="btn  btn-outline-dark" rel="noopener noreferrer" target="_blank" href="https://tiniru.com">Work Online</a>
                    </li>
                </ul>
          </nav>
         </div>
      );
   }
}
export default Header;