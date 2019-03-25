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
import { Link, Prompt } from 'react-router-dom'

import Confirmation from './Confirmation'

import { getListRecord, getRecord, getLastRecord } from '../helpers/Query.js'
import { postData } from '../helpers/Helpers.js'

import {Config} from '../config.js'

const DB_name       = Config.DB_name;
const DB_version    = Config.DB_version;
const projectTable  = Config.projectTable;
const navigationTable = Config.navigationTable;
const topicTable    = Config.topicTable;
const pageTable     = Config.pageTable;
const changeLogTable = Config.changeLogTable;


class Navigation extends Component{
    render() {
            return (
            <div 
                onDragOver={this.props.dragover}
                                
                className="card rounded-0 mb-2 ">
                <div  draggable="true"  onDragStart={this.props.dragstart} onDragEnd={this.props.dragend}   className="card-header py-1 px-3">
                    <div  className="row">
                        <div  className="col-md-3" >
                            <div className="font-weight-bolder">{this.props.label}</div>
                        </div>
                        <div  className="col-md-6" >
                            <span className="font-weight-lighter text-muted">{this.props.url}</span>
                        </div>
                        <div className="col-md-3 ">
                            <button onClick={this.props.remove} className="btn btn-sm btn-link py-0 px-1  text-danger">Del.</button>
                               
                        </div>
                    </div>
                    
                </div>
                
            </div>
        )
    }
}

class Generate extends Component{
    constructor(props) {
        super(props);
        this.state = { 
            label   : '',
            url     : '',
            navlist : [],
            server  : 'http://localhost/tiniru-doc-server/generate.php',
            sdownload  : 'http://localhost/tiniru-doc-server/download.php',
            slugDeleteNav : '',
            modalVisible: false,
            progressBar:false,
            ProgressBarValue : 1,
         };
         this.handleInputChange = this.handleInputChange.bind(this); 
         this.handleSubmit       = this.handleSubmit.bind(this);
         this.handleLoad         = this.handleLoad.bind(this);
         this.removeNav        = this.removeNav.bind(this); 
        this.openModal          = this.openModal.bind(this);  
        this.handleRemoveNav  = this.handleRemoveNav.bind(this);
         this.onDragOver   = this.onDragOver.bind(this);
        this.onDragStart  = this.onDragStart.bind(this);
        this.onDragEnd    = this.onDragEnd.bind(this);
        this.handleGenerate    = this.handleGenerate.bind(this);
         this.handleLoad();
    }

    componentDidMount() {
        window.scrollTo(0,0);
    }

    handleLoad() {

        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        request.onsuccess = function (event) {
            db = event.target.result;

            var transaction = db.transaction([navigationTable], "readonly");
            var objectStore = transaction.objectStore(navigationTable);
            var objectStoreRequest = objectStore.getAll();

            objectStoreRequest.onsuccess = function (event) {
                var dt = objectStoreRequest.result;
                //console.log(dt);
                var dtlist = []

                dt.map(function (n) {

                    dtlist.push({
                        label: n.label,
                        url: n.url,
                        order: n.order,
                        project: n.project
                    })
                    return true;
                });
                var datalist = dtlist.sort(function(a,b) {
                    return parseFloat(a.order) - parseFloat(b.order);
                });
                ini.setState({ navlist: datalist })
            };

            objectStoreRequest.onerror = function (event) {
                console.log('[onerror]', objectStoreRequest.error);
            }

        };

    }

    handleInputChange(event)
    {
        const target    = event.target;
        const value     = target.value;
        const name      = target.name;

        this.setState({
            [name]: value
        });
   
    }

    handleSubmit(e) {
        e.preventDefault();
        var ini = this;
        getLastRecord(navigationTable, 'label', function (data) {

            var dataIns = {
                    label: ini.state.label,
                    project: localStorage.getItem('myProject'),
                    url: ini.state.url,
                };
            if (data !== null) {
                dataIns["order"] = data.order + 1;
            } else {
                dataIns["order"] = 0;
            }

            var request = window.indexedDB.open(DB_name, DB_version);
            var db;
            
            request.onsuccess = function(event) {
                db = event.target.result; 
                
                var transaction = db.transaction([navigationTable], "readwrite");
                var objectStore = transaction.objectStore(navigationTable);
                var objectStoreRequest = objectStore.put(dataIns);

                
                objectStoreRequest.onsuccess = function (event) {
                    ini.setState({
                        label: "",
                        url : ""
                    });
                    ini.handleLoad();
                };

                
            };

        });

    }
    openModal() {
        console.log("Open modal called ", this.state.modalVisible);
        const modalVisible = !this.state.modalVisible;
        this.setState({
          modalVisible
        });
    }

    removeNav(slug)
    {
        //alert(slug);
        this.setState({slugDeleteNav:slug});
        this.openModal();
    }

    handleRemoveNav()
    {
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        
        request.onsuccess = function (event) {
            db = event.target.result;
            var request = db.transaction([navigationTable], "readwrite")
                .objectStore(navigationTable)
                .delete(ini.state.slugDeleteNav);
                
                request.onsuccess = function(event) {
                    
                   
                    ini.openModal();
                    ini.handleLoad();
  
                   
                };
                
        }
    }

    onDragStart = (e, idx) => {
        //console.log(idx);
        this.draggedItem = this.state.navlist[idx];
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target);
        //e.dataTransfer.setDragImage(e.target, 20, 20);
        e.target.parentNode.className += " border-dark text-white bg-secondary";
      };
    
    onDragOver = idx  => {
        const draggedOverItem = this.state.navlist[idx];
        // if the item is dragged over itself, ignore
        if (this.draggedItem === draggedOverItem) {
            return;
        }
        
        // filter out the currently dragged item
        //let topicList = this.state.topicList.filter(item => item !== this.draggedItem);
        let navlist = this.state.navlist.filter(item =>{
            return item !== this.draggedItem;} );
        // add the dragged item after the dragged over item
        navlist.splice(idx, 0, this.draggedItem);
        //console.log(topicList);

        this.setState({ navlist }); 
    };

    

    onDragEnd = (e) => {
        this.draggedItem = null;

        e.target.parentNode.classList.remove("border-dark");
        e.target.parentNode.classList.remove("text-white");
        e.target.parentNode.classList.remove("bg-secondary");

        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        request.onsuccess = function (event) {
            db = event.target.result;
            ini.state.navlist.map((n, idx) => {
                var dataIns = { 
                        label        : n.label, 
                        project     : n.project, 
                        url         : n.url,
                        order       : idx
                    };

                var transaction = db.transaction([navigationTable], "readwrite");
                var objectStore = transaction.objectStore(navigationTable);
                //console.log(dataIns);
                var objectStoreRequest = objectStore.put(dataIns);
                objectStoreRequest.onsuccess = function (event) {
                };
                  
                return dataIns;
            });
        }
    };

    handleGenerate(type)
    {
        var ini = this
        var thisProject = localStorage.getItem('myProject');
        ini.setState({progressBar:true});
        //send data project
        getRecord(projectTable, thisProject, function(dt){
            postData(ini.state.server, {project:thisProject, datatype:'project', app:dt})
                .then(function(response) { if(response.result==='next'){
                    ini.setState({ProgressBarValue:5});
                    //send data topic
                    getListRecord(topicTable, function(dt){
                        postData(ini.state.server, { project:thisProject, datatype:'topics', topics:dt})
                        .then(function(response) {
                            ini.setState({ProgressBarValue:10});
                            //send changelog
                            getListRecord(changeLogTable, function(dt){
                                postData(ini.state.server, { project:thisProject,  datatype:'changelog', changelog:dt})
                                .then(function(response) {
                                    ini.setState({ProgressBarValue:15});
                                    //send navgigation
                                    getListRecord(navigationTable, function(dt){
                                        postData(ini.state.server, { project:thisProject, datatype:'navigation', navigation:dt})
                                        .then(function(response) {
                                            ini.setState({ProgressBarValue:20});
                                            //send page
                                            getListRecord(pageTable, function(dt){
                                                var stripVal = Math.round(80/parseInt(dt.length));
                                                var barValue = 20;

                                               dt.map((n, idx) => {
                                                    postData(ini.state.server, { project:thisProject, datatype:'pages', pages:n})
                                                    .then(function(response) {
                                                        barValue += stripVal;
                                                        ini.setState({ProgressBarValue:barValue});
                                                        if(idx === dt.length-1){
                                                            ini.setState({ProgressBarValue:100});
                                                            postData(ini.state.server, {generate:type, project:thisProject, datatype:'generate'})
                                                            .then(function(response) {
                                                                ini.setState({progressBar:false});
                                                                ini.setState({ProgressBarValue:1});
                                                                window.location = ini.state.sdownload+'?doc='+response.download+'&type='+type
                                                                //console.log('Done');
                                                            });
                                                        }
                                                    });
                                                    return true;
                                               })

                                            })
                                        });
                                    })
                                });
                            })
                        });
                    })
      
                }})
        })
          

    }

    render() {
        console.log(this.state.modalVisible)
        const navlist = this.state.navlist.map((n, idx) =>
            <Navigation key={n.label}   label={n.label} url={n.url}
                remove={this.removeNav.bind(this, n.label)}             
                dragstart={e => this.onDragStart(e, idx)}
                dragover={e => this.onDragOver(idx)}
                dragend={e => this.onDragEnd(e)}
             />
        );
        return (
            <main className="container  mt-5 pt-5 mb-5" >
                <Prompt
                when={this.state.modalVisible}
                message=' Are you sure to remove this navigation??'
                />
                <h1 className="mb-3">Generate Doc.</h1>
                <Link to="/manage" className="btn  btn-sm radius-0 btn-light border" >&laquo; Back to Manage</Link>
               
                <div className="row mt-4">
                    <div className="col-md-5">
                        <div className="card rounded-0 mb-5">
                            <div className="card-header bg-dark text-white">
                                <div className="font-weight-bold" >Register Nav.</div>
                            </div>
                            <div className="card-body">
                                <p className="card-text">Navigation is only used in html files.</p>
                                <form className=""  onSubmit={this.handleSubmit} >
                                    <div className="input-group  mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" >Label</span>
                                        </div>
                                        <input type="text" name="label" onChange={this.handleInputChange} value={this.state.label} className="form-control"  />
                                    </div>
                                    <div className="input-group  mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" >Url</span>
                                        </div>
                                        <input type="text" name="url" onChange={this.handleInputChange} value={this.state.url} className="form-control"  />
                                    </div>

                                    <div className="text-right">
                                        <button type="submit" name="save" className="btn btn-dark  ">Save Navigation</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        
                        
                        
                    </div>

                    <div className="col-md-7">
                        
                        <div className="card mb-5 border-primary">
                            <div className="card-header bg-primary text-white">
                                <div className="font-weight-bold" >Generate Document</div>
                            </div>
                            <div className="card-body">
                                <div className=" mb-4">
                                    <label  className="col-form-label">Url server for generate:</label>
                                    <input type="text" name="server" onChange={this.handleInputChange} value={this.state.server} className="form-control form-control-sm"  />
                                </div>
                                <div className=" mb-4">
                                    <label  className="col-form-label">Url server for download:</label>
                                    <input type="text" name="sdownload" onChange={this.handleInputChange} value={this.state.sdownload} className="form-control form-control-sm"  />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <button type="button"  onClick={this.handleGenerate.bind(this, 'pdf')}  className="btn btn-danger btn-block btn-lg">PDF File</button>
                                    </div>
                                    <div className="col-md-6">
                                        <button type="button" onClick={this.handleGenerate.bind(this, 'html')} className="btn btn-dark btn-block btn-lg">HTML File</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                    </div>

                    <div className="col-md-12">
                        <div className="card rounded-0 mb-4">
                            <div className="card-header">
                                <div className="font-weight-bold" >Navigation List</div>
                            </div>
                            <div className="card-body">
                                {navlist}
                            </div>
                           
                        </div>
                    </div>

                </div>

                <Confirmation
                    visible={this.state.modalVisible}
                    modal ={e => this.openModal()}
                    remove ={e => this.handleRemoveNav()}
                    message="When deleting a topic, the pages inside will also be deleted. Are you sure to remove this topic?"
                 />

                <div className={(this.state.progressBar?'show':'false')+' modal in'} id="progressModal"  role="dialog" aria-labelledby="confirmModalLabel" aria-hidden="true" style={this.state.progressBar ? { display: "block" }: { display: "none" }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content border border-dark">
                    <div className="modal-header">
                        <h6 className="modal-title" id="confirmModalLabel">Please Wait, Generate is running... </h6>
                    </div>
                    <div className="modal-body">
                        <div className="progress">
                            <div ref="progressbar" className="progress-bar" role="progressbar" style={{width:this.state.ProgressBarValue+'%'}} aria-valuenow={this.state.ProgressBarValue} aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    
                    </div>
                </div>
                </div>

            </main>
        )
    }
}

export default Generate;