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

import Confirmation from './Confirmation'

import {Config} from '../config.js'

const DB_name       = Config.DB_name;
const DB_version    = Config.DB_version;
const topicTable    = Config.topicTable;
const pageTable     = Config.pageTable;
const changeLogTable = Config.changeLogTable;

class TopicListItem extends Component{
    
    render() {
        
        const editUrl = this.props.topic==='__changelog__'?'changelog':'edit';
        return(
            <div key={this.props.slug} onDragOver={this.props.dragover} className="card rounded-0 mb-2 ">
                <div draggable="true"  onDragStart={this.props.dragstart} onDragEnd={this.props.dragend}  className="card-header py-1 px-3 cpointer">
                    <div  className="row">
                        <div className="col-md-9">
                            <div  className="" >{this.props.title}</div>
                        </div>
                        <div className="col-md-3 text-right ">
                            <Link to={editUrl+"/"+this.props.slug}  className="bbtn btn-sm btn-link py-0 px-1 ">Edit</Link>
                            <button onClick={() => this.props.remove(this.props.slug, this.props.topic)} className="btn btn-sm btn-link py-0 px-1  text-danger">Del.</button>
                        </div>
                    </div>
                </div>
                </div>
        )
    }
}

class TopicList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isToggleOn  : false,
            items       :this.props.items,
            showChild : false,
        };
        this.handleToggle = this.handleToggle.bind(this);
        this.onDragOver   = this.onDragOver.bind(this);
        this.onDragStart  = this.onDragStart.bind(this);
        this.onDragEnd    = this.onDragEnd.bind(this);
        
    }
    componentWillReceiveProps(props) {
        
        var datalist = props.items.sort(function(a,b) {
            return parseFloat(a.order) - parseFloat(b.order);
        });
        this.setState({
          items:datalist
        })
    }
    componentDidMount() {
        
        setTimeout(() => {
            var datalist = this.state.items.sort(function(a,b) {
                return parseFloat(a.order) - parseFloat(b.order);
            });
            this.setState({
              showChild : true,
              isToggleOn  : this.state.items.length>0?this.props.open:false,
              items:datalist
            })
            
          },1000);
       
          
    }
    componentDidUpdate(){
        
    }
   
    handleToggle()
    {
        //if(window.location.hash!=="")
        //    window.location.hash = "#"+this.props.slug;

        this.setState(state => ({
            isToggleOn: !state.isToggleOn
          }));
    }

    
    onDragStart = (e, idx) => {
        //console.log(idx);
        this.draggedItem = this.state.items[idx];
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.parentNode);
        e.target.parentNode.className += " border-dark text-white bg-secondary";
      };
    
    onDragOver = idx  => {
        const draggedOverItem = this.state.items[idx];
        // if the item is dragged over itself, ignore
        if (this.draggedItem === draggedOverItem) {
            return;
        }

        // filter out the currently dragged item
        //let topicList = this.state.topicList.filter(item => item !== this.draggedItem);
        let items = this.state.items.filter(item =>{
            return item !== this.draggedItem;} );
        // add the dragged item after the dragged over item
        items.splice(idx, 0, this.draggedItem);
        //console.log(topicList);

        this.setState({ items }); 
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
            ini.state.items.map((n, idx) => {
                var dataIns = { 
                    topic           : n.topic,
                    slug            : n.slug,
                    title           : n.title,
                    content         : n.content,
                    meta_keywords   : n.meta_keywords,
                    meta_description: n.meta_description,
                    publish         : n.publish,
                    order           : idx,
                    project         :n.project,
                 };

                var transaction = db.transaction([pageTable], "readwrite");
                var objectStore = transaction.objectStore(pageTable);
                console.log(dataIns);
                var objectStoreRequest = objectStore.put(dataIns);
                objectStoreRequest.onsuccess = function (event) {
                };
                return true;
            });
        }
        
    };
    
    render() {
       
       const listItem = this.state.items.map((n,idx) =>{return(
            <TopicListItem key={n.slug} title={n.title} idx={idx} topic={n.topic} slug={n.slug}
            dragstart={e => this.onDragStart(e, idx)}
            dragover={e => this.onDragOver(idx)}
            dragend={e => this.onDragEnd(e)}
            remove={this.props.remove} />
        )});
        return(
            <div  className="card rounded-0 mb-2">
                <div className="card-header py-2">
                    <div className="row">
                        <div onClick={this.handleToggle}  className="col-md-9 cpointer">
                            <div className="font-weight-bold" >{this.props.title}</div>
                        </div>
                        <div className="col-md-3 text-right">
                            <Link to={"write/"+this.props.slug}  className="btn btn-sm btn-success py-0  ">+ Page</Link>
                        </div>
                    </div>
                </div>
                
                <div className={this.state.isToggleOn ? 'card-body d-block' : 'card-body d-none'} >
                    <div >
                    {listItem}
                    </div>
                    <div>
                        <Link to={"write/"+this.props.slug} className="btn btn-success btn-sm ">+ Add Page</Link>
                        
                    </div>
                </div>
            </div>
        )
    }
}



class Manage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type        : 'website',
            name        : '',
            logo        : '',
            description : '',
            siteUrl     : '',
            topicFormShow: false,
            topicList : [],
            changelogList : [],
            modalVisible: false,
            slugDeletePage : "",
            slugDeleteTopic : "",
            slugDeleteLog : "",
            showChild : false
          };
        this.toggleFormTopic = this.toggleFormTopic.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.removePage        = this.removePage.bind(this); 
        this.openModal          = this.openModal.bind(this);  
        this.handleRemovePage  = this.handleRemovePage.bind(this); 
        
        this.handleLoad();
    }

    componentDidMount() {
        document.getElementById('topnav').style.display = 'flex';
        window.scrollTo(0,0);
    }

    handleLoad()
    {
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this
        request.onsuccess = function(event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result
            var transaction = db.transaction(["project"]);
            var objectStore = transaction.objectStore("project");
            var request = objectStore.get(localStorage.getItem('myProject'));
            //console.log(request);
            
            request.onsuccess = function (event) {
                var dt = request.result;
                //console.log(request.result);
                
                ini.setState( {
                    type        : dt.type,
                    name        : dt.name,
                    logo        : dt.logo,
                    description : dt.description,
                    siteUrl     : dt.siteUrl
                  });

                if(dt.logo.length>0){
                    var img = '<img src="'+dt.logo+'" style="max-width:54px;" class="img-fluid rounded-circle">';
                    ini.refs.imagepreview.innerHTML=img;
                }
            };

            
            var transactionTopic = db.transaction([topicTable], "readonly");
            var objectStoreTopic = transactionTopic.objectStore(topicTable);
            var objectStoreRequest = objectStoreTopic.getAll();
            
            objectStoreRequest.onsuccess = function (event) {
                var dt = objectStoreRequest.result;
                //console.log(dt);
                var dtlist = []
                
                dt.map(function (n){
                    //console.log(n.slug);
                    var transactionPage = db.transaction([pageTable], "readonly");
                    var objectStorePage = transactionPage.objectStore(pageTable);
                    var vendorIndex = objectStorePage.index('topic');
                    var keyRng = IDBKeyRange.only(n.slug);
                    //var keyRangeValue = IDBKeyRange.only(2019);
                    var cursorRequest = vendorIndex.openCursor(keyRng);
                    var pages = [];
                    cursorRequest.onsuccess = e => {
                        var cursor = e.target.result;
                        
                        if (cursor) {
                            //console.log("cursor");
                            //console.log(cursor.value);
                            pages.push({slug:cursor.value.slug, title:cursor.value.title, topic:cursor.value.topic, order:cursor.value.order});
                            cursor.continue();
                        }
                    }
                    
                    
                    dtlist.push({
                        slug:n.slug, 
                        name:n.name, 
                        order:n.order, 
                        pages:pages
                    })

                    return true;
                });
                
                var datalist = dtlist.sort(function(a,b) {
                    return parseFloat(a.order) - parseFloat(b.order);
                });
                ini.setState({ topicList: datalist })
                ini.forceUpdate()
            };

            objectStoreRequest.onerror = function (event) {
                console.log('[onerror]', objectStoreRequest.error);
            }
            
            var transactionLog = db.transaction([changeLogTable], "readonly");
            var objectStoreLog = transactionLog.objectStore(changeLogTable);
            var objectStoreRequestLog = objectStoreLog.getAll();
            objectStoreRequestLog.onsuccess = e => {
                var dt = objectStoreRequestLog.result;
                //console.log(dt);
                var dtlog = []
                dt.map(function (n){
                    dtlog.push({
                        slug:n.slug, 
                        title:n.title, 
                        order:n.order, 
                    })
                    return true;
                });

                ini.setState({ changelogList: dtlog })
            }
        };
        
        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };
    }

    toggleFormTopic(){
        this.setState(state => ({
            topicFormShow: !state.topicFormShow
        }));
    }

    openModal() {
        //console.log("Open modal called ", this.state.modalVisible);
        const modalVisible = !this.state.modalVisible;
        this.setState({
          modalVisible
        });
    }

    removePage(slug, topic)
    {
        //alert(slug);
        //console.log(slug+' '+topic)
        this.setState({slugDeletePage:slug, slugDeleteTopic:topic});
        this.openModal();
    }

    handleRemovePage()
    {
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;

        request.onsuccess = function (event) {
            db = event.target.result;

            if(ini.state.slugDeleteTopic==="__changelog__")
            {
                var requestLog = db.transaction([changeLogTable], "readwrite")
                .objectStore(changeLogTable)
                .delete(ini.state.slugDeletePage);
                
                requestLog.onsuccess = function(event) {
                    ini.openModal();
                    ini.handleLoad();
                    setTimeout(() => {
                        ini.setState(state => ({
                            showChild: !state.showChild
                          }));
                        
                      },1000);
                }
            }else{
                var requestPage = db.transaction([pageTable], "readwrite")
                .objectStore(pageTable)
                .delete(ini.state.slugDeletePage);
                
                requestPage.onsuccess = function(event) {
                    
                    ini.openModal();
                    ini.handleLoad();

                    var transaction = db.transaction([pageTable], "readonly");
                    var objectStore = transaction.objectStore(pageTable);
                    var vendorIndex = objectStore.index('topic');
                    var keyRng = IDBKeyRange.only(ini.state.slugDeleteTopic);
                    //var keyRangeValue = IDBKeyRange.only(2019);
                    var cursorRequest = vendorIndex.openCursor(keyRng);
                    var pages = [];
                    cursorRequest.onsuccess = e => {
                        var cursor = e.target.result;
                        
                        if (cursor) {
                            //console.log("cursor");
                            //console.log(cursor.value);
                            pages.push({slug:cursor.value.slug, title:cursor.value.title});
                            cursor.continue();
                        }
                    }
                    
                    ini.setState(prevState => ({
                        topicList: prevState.topicList.map(
                        obj => {
                            if(obj.slug === ini.state.slugDeleteTopic){
                                return {
                                            slug:obj.slug, 
                                            name:obj.name, 
                                            order:obj.order, 
                                            pages:pages
                                        };
                            }else{
                                return obj;
                            }
                        }
                      )
                    }));

                    setTimeout(() => {
                        ini.setState(state => ({
                            showChild: !state.showChild
                          }));
                        
                      },1000);
                    
                };

            }
            
                
        }
    
    }

   
    
    onDragStartLog = (e, idx) => {
        //console.log(idx);
        this.draggedItem = this.state.changelogList[idx];
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.parentNode);
        e.target.parentNode.className += " border-dark text-white bg-secondary";
      };
    
    onDragOverLog = idx  => {
        const draggedOverItem = this.state.changelogList[idx];
        // if the item is dragged over itself, ignore
        if (this.draggedItem === draggedOverItem) {
            return;
        }

        // filter out the currently dragged item
        //let topicList = this.state.topicList.filter(item => item !== this.draggedItem);
        let changelogList = this.state.changelogList.filter(item =>{
            return item !== this.draggedItem;} );
        // add the dragged item after the dragged over item
        changelogList.splice(idx, 0, this.draggedItem);
        //console.log(topicList);

        this.setState({ changelogList }); 
    };

    

    onDragEndLog = (e) => {
        this.draggedItem = null;
        e.target.parentNode.classList.remove("border-dark");
        e.target.parentNode.classList.remove("text-white");
        e.target.parentNode.classList.remove("bg-secondary");
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        request.onsuccess = function (event) {
            db = event.target.result;
            ini.state.changelogList.map((n, idx) => {
                var dataIns = { 
                    slug            : n.slug,
                    title           : n.title,
                    content         : n.content,
                    datelog         : n.datelog,
                    publish         : n.publish,
                    order           : idx,
                    project         :n.project,
                 };

                var transaction = db.transaction([changeLogTable], "readwrite");
                var objectStore = transaction.objectStore(changeLogTable);
                //console.log(dataIns);
                var objectStoreRequest = objectStore.put(dataIns);
                objectStoreRequest.onsuccess = function (event) {
                };
                return true;     
            });
        }
        
    };

    render() {
        
        const hash = this.props.location.hash;
        const listItems = this.state.topicList.map((n) => {
            return (<TopicList key={n.slug} title={n.name} open={hash==='#'+n.slug?true:false} slug={n.slug} items={n.pages}
            remove={this.removePage.bind(this)} />)
        });
        //console.log(this.state.changelogList)
        const listItemLogs = this.state.changelogList.map((n,idx) => {
            return (<TopicListItem key={n.slug} title={n.title} idx={idx} topic="__changelog__" slug={n.slug}
                dragstart={e => this.onDragStartLog(e, idx)}
                dragover={e => this.onDragOverLog(idx)}
                dragend={e => this.onDragEndLog(e)}
                remove={this.removePage.bind(this)} />)
        });
    return (
        <main className="container  mt-5 pt-5 mb-5" >
            <div className="row">
            
                <div className="col-md-3">
                
                    <div className="card">
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-md-3 "><div id="imagepreview" ref="imagepreview"></div></div>
                            <div className="col-md-9">
                                <div className="card-title h4">{this.state.name}</div>
                                <div className="card-subtitle mb-2"><a href={this.state.siteUrl} className="link  text-muted">{this.state.siteUrl}</a></div>
                            </div>
                          </div>
                          
                          <p className="card-text">{this.state.description}</p>
                          <footer className="blockquote-footer">
                          {this.state.type}
                          <Link to="/project?_edit=true" className="btn btn-sm btn-link"  >Edit</Link>
                          </footer>
                        </div>
                    </div>
                    
                    <div className="mt-5">
                        {/*<div className="m-3 text-center d-none">Doc. Last Version <span className="badge badge-secondary">4.3.1</span></div>
                        <div className="m-3  d-none"><button className="btn btn-warning btn-block">Copy as New Version</button></div>*/}
                        <div className="m-3"><Link to="/generate/html" className="btn btn-primary btn-block"  >Generate as HTML</Link></div>
                        <div className="m-3"><Link to="/generate/html" className="btn btn-primary btn-block"  >Generate as PDF</Link></div>
                    </div>
                    
    
                </div>
                
                <div className="col-md-9">
                    <div className="">
                        <div className="pb-3">
                            <div className="row mb-3">
                                <div className="col-md-8"><h1 className="">Topics</h1></div>
                                <div className="col-md-4 text-right position-relative ">
                                    <Link to="/topic" style={{bottom:'5px', right:'15px'}} className="btn btn-sm radius-0 btn-dark align-baseline position-absolute" >Set Topics</Link>
                                </div>
                            </div>
                           
                            {listItems}
                            
                        </div>
                        <hr className="my-3"/>
                        <div className="mt-3">
                            <div className="row mb-3">
                                <div className="col-md-8"> <h4>Change Log</h4></div>
                                <div className="col-md-4 text-right position-relative ">
                                    <Link to="/changelog" style={{bottom:'5px', right:'15px'}} className="btn btn-sm radius-0 btn-dark align-baseline position-absolute" >Add Change Log</Link>
                                </div>
                            </div>
                            <div>{listItemLogs}</div>
                        </div>
                        
                    </div>
                </div>
                
                
            </div>

            <Confirmation
                    visible={this.state.modalVisible}
                    modal ={e => this.openModal()}
                    remove ={e => this.handleRemovePage()}
                    message="Deleted pages cannot be restored. Are you sure to remove this page?"
                 />

            

        </main>
      );
  }
}

export default Manage;