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
import './App.css';



import Header from './containers/Header';
import Main from './containers/Main';
import Footer from './containers/Footer';

import {Config} from './config.js'

const DB_name       = Config.DB_name;
const DB_version    = Config.DB_version;

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleLoad();
  }

  handleLoad()
    {
        
        if( window.indexedDB)
        {
            console.log('IndexedDB is supported ');
        }else
        {
            console.log("Your browser doesn't support a stable version of IndexedDB.");
        }
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        request.onupgradeneeded = function(event) { 
            // Save the IDBDatabase interface 
            db = event.target.result;
          
            // Create an objectStore for this database
            var project     = db.createObjectStore('project', {keyPath: 'slug'});
            var topics      = db.createObjectStore('topics', {keyPath: 'slug'});
            var pages       = db.createObjectStore('pages', {keyPath: 'slug'});
            var changelog   = db.createObjectStore('changelog', {keyPath: 'slug'});
            var navigation  = db.createObjectStore('navigation', {keyPath: 'label'});

            project.createIndex("slug", 'slug',{unique: true});
            topics.createIndex("slug", 'slug',{unique: true});
            pages.createIndex("slug", 'slug',{unique: true});
            pages.createIndex("topic", 'topic');
            changelog.createIndex("slug", 'slug',{unique: true});
            navigation.createIndex("label", 'label');
        };
        request.onsuccess = function(event) {

            db = event.target.result; // === request.result
            
        };
        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };
  
    }

  render() {
    return (
        <div>
            <Header/>
            <Main/>
            <Footer/>
        </div>
    );
  }
}




export default App;
