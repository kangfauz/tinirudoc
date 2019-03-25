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


class Home extends Component{

    componentDidMount() {
        window.scrollTo(0,0);
    }
    
  
    render() {
        return (
            <main className="container  mt-5 pt-5 mb-5" >
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="jumbotron text-center">
                            <h1 className="display-4">Tiniru Doc</h1>
                            <p className="lead">An easy way to make documentation of App</p>
                            <hr className="my-4"/>
                            <p>Tiniru Doc is a Documentation Generator of App. Aims to make easier the developers in making documentation of App.</p>
                            <Link to="/project" className="btn btn-primary btn-lg" >Get Started!</Link>
                        </div>
                    </div>
                </div>
            </main>
        )
    }
}

export default Home;