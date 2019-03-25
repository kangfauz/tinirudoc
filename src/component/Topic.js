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

import { getLastRecord } from '../helpers/Query.js'
import { toUrl} from '../helpers/Helpers.js'


import { Config } from '../config.js'
import { topicTemplate } from '../topicdata.js'

const DB_name = Config.DB_name;
const DB_version = Config.DB_version;
const topicTable = Config.topicTable;
const pageTable = Config.pageTable;




class TopicList extends Component {
    constructor(props) {
        super(props);
        this.state = { 
                isToggleOn: false,
                isEdit    : false,
                name : this.props.title,
                slug : this.props.slug,
                items       :this.props.items,
                showChild : false,
                
             };
        this.handleToggle = this.handleToggle.bind(this);
        this.showEdit = this.showEdit.bind(this);
        this.handleUpdateTopic = this.handleUpdateTopic.bind(this);   
        this.handleInputChange = this.handleInputChange.bind(this);  
    }
    componentWillReceiveProps(props) {
        
        var datalist = props.items.sort(function(a,b) {
            return parseFloat(a.order) - parseFloat(b.order);
        });
        this.setState({
          items:datalist
        })
    }
    
    handleToggle() {
        this.setState(state => ({
            isToggleOn: !state.isToggleOn
        }));
    }

    showEdit() {
        this.setState(state => ({
            isEdit: !state.isEdit
        }));
    }

    handleInputChange(event)
    {
        const target    = event.target;
        const value     = target.value;
        const name      = target.name;

        this.setState({
            [name]: value
        });
        console.log(this.state.name);
    }

    handleUpdateTopic()
    {
       
        

        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        var dataIns = {
                name: ini.state.name,
                project: localStorage.getItem('myProject'),
                slug: toUrl(ini.state.slug)
            }

        request.onsuccess = function (event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result

            //console.log(db);
            var transaction = db.transaction([topicTable], "readwrite");
            var objectStore = transaction.objectStore(topicTable);
            //console.log(dataIns);
            var objectStoreRequest = objectStore.put(dataIns);

            objectStoreRequest.onsuccess = function (event) {
                console.log('The data has been written successfully');
                ini.showEdit();
            };

            transaction.oncomplete = function (event) {
                //console.log('oncomplete');
                db.close();
            };

            objectStoreRequest.onerror = function (event) {
                console.log('The data has been written failed');
            }

        };

        request.onerror = function (event) {
            console.log('[onerror]', request.error);
        };
        
    }

    
    render() {
        //const totalItem = this.props.items.length;
        const listItem = this.state.items.map((n) =>
            <li key={n.slug} className="">{n.title}</li>
        );
        return (
            <div id={'tpc-'+this.props.slug} 
                
                
                onDragOver={this.props.dragover}
                                 
                className="card rounded-0 mb-2 ">
                <div  draggable={this.props.add === 'true' ? 'false' : 'true'}  onDragStart={this.props.dragstart} onDragEnd={this.props.dragend}   className="card-header py-1 px-3">
                    <div  className="row">
                        <div onClick={this.handleToggle} className={(this.state.isEdit ? 'd-none' : 'd-block')+' col-md-9 '}>
                            <div  className={this.props.add === 'true' ? 'cpointer' : 'font-weight-bold cpointer'} >
                                <span>{this.state.name}</span>
                                
                            </div>
                        </div>
                        {
                            this.props.add === 'false' ?
                            <div  className={(this.state.isEdit ? 'd-block' : 'd-none')+' col-md-9 foredit'}>
                                <input type="text" name="name" onChange={this.handleInputChange}className="form-control form-control form-control-sm" value={this.state.name}  />
                            </div>
                            :'' 
                        } 
                        <div className="col-md-3 text-right ">
                            {this.props.add === 'true' ?
                            <button onClick={this.props.register} className="btn btn-sm btn-secondary py-0  ">Tambahkan</button>:
                            <div >
                                <div className={(this.state.isEdit ? 'd-none' : 'd-block')}>
                                    <button onClick={this.showEdit} className="btn btn-sm btn-link py-0 px-1 ">Edit</button>
                                    <button onClick={this.props.remove} className="btn btn-sm btn-link py-0 px-1  text-danger">Del.</button>
                                </div>
                                {
                                    this.props.add === 'false' ?
                                    <div className={(this.state.isEdit ? 'd-block' : 'd-none')+' foredit'}>
                                        <button onClick={this.handleUpdateTopic} className="btn btn-sm btn-secondary  ">Save</button>
                                    </div>
                                    :'' 
                                } 
                            </div>
                            }
                        </div>
                    </div>
                    
                </div>
                <div className={this.state.isToggleOn ? 'card-body d-block' : 'card-body d-none'} >
                      
                    <ul>
                        {listItem}
                    </ul>
                </div>
            </div>
        )
    }
}



class Topic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name            : "",
            topicList       : [],
            modalVisible    : false,
            slugDeleteTopic : "",
            showChild       : false,
            topicTemplate:[],
        };
        this.handleLoad         = this.handleLoad.bind(this);
        this.handleSubmit       = this.handleSubmit.bind(this);
        this.handleInputChange  = this.handleInputChange.bind(this);
        this.removeTopic        = this.removeTopic.bind(this); 
        this.openModal          = this.openModal.bind(this);  
        this.handleRemoveTopic  = this.handleRemoveTopic.bind(this);
        
    }
    componentDidMount() {
        window.scrollTo(0,0);
        /*
        fetch("data/topics.json",{
            headers : { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
               },
            mode: "no-cors", 
        })
        .then(response => response.json())
        .then(data => {
            this.setState({topicTemplate:data})
        });
        */
        this.setState({topicTemplate:topicTemplate})
        this.handleLoad();
    }
    handleLoad() {

        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        request.onsuccess = function (event) {
            db = event.target.result;

            var transaction = db.transaction([topicTable], "readonly");
            var objectStore = transaction.objectStore(topicTable);
            var objectStoreRequest = objectStore.getAll();

            objectStoreRequest.onsuccess = function (event) {
                var dt = objectStoreRequest.result;
                //console.log(dt);
                var dtlist = []

                dt.map(function (n) {
                    //console.log(n.slug);
                    var transaction = db.transaction([pageTable], "readonly");
                    var objectStore = transaction.objectStore(pageTable);
                    var vendorIndex = objectStore.index('topic');
                    var keyRng = IDBKeyRange.only(n.slug);
                    //var keyRangeValue = IDBKeyRange.only(2019);
                    var cursorRequest = vendorIndex.openCursor(keyRng);
                    var pages = [];
                    cursorRequest.onsuccess = e => {
                        var cursor = e.target.result;

                        if (cursor) {
                            //console.log("cursor");
                            //console.log(cursor.value);
                            pages.push({ slug: cursor.value.slug, title: cursor.value.title });
                            cursor.continue();
                        }

                       
                    }


                    dtlist.push({
                        slug: n.slug,
                        name: n.name,
                        order: n.order,
                        pages: pages
                    })
                    //return dtlist;
                    return true;
                });
                var datalist = dtlist.sort(function(a,b) {
                    return parseFloat(a.order) - parseFloat(b.order);
                });
                ini.setState({ topicList: datalist })
            };

            objectStoreRequest.onerror = function (event) {
                console.log('[onerror]', objectStoreRequest.error);
            }

        };

        request.onerror = function (event) {
            console.log('[onerror]', request.error);
        };
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        var ini = this;
        getLastRecord(topicTable, 'slug', function (data) {

            var dataIns = {
                name: ini.state.name,
                project: localStorage.getItem('myProject'),
                slug: toUrl(ini.state.name)
            };
            if (data !== null) {
                dataIns["order"] = data.order + 1;
            } else {
                dataIns["order"] = 0;
            }
            ini.addTopic(dataIns);

        });

    }
    addTopic(dataIns, callback) {
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;

        request.onsuccess = function (event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result

            //console.log(db);
            var transaction = db.transaction([topicTable], "readwrite");
            var objectStore = transaction.objectStore(topicTable);
            //console.log(dataIns);
            var objectStoreRequest = objectStore.add(dataIns);


            objectStoreRequest.onsuccess = function (event) {
                console.log('The data has been written successfully');
                ini.setState({ name: "" });
                ini.handleLoad();
                //ini.setState({topicList:ini.state.topicList.concat([6])})
            };

            transaction.oncomplete = function (event) {
                //console.log('oncomplete');
                db.close();
                if (callback) //you'll need a calback function to return to your code
                    callback();
            };

            objectStoreRequest.onerror = function (event) {
                console.log('The data has been written failed');
            }

        };

        request.onerror = function (event) {
            console.log('[onerror]', request.error);
        };
    }

    _regiserTopic(ini, topicTable, dataRow)
    {
        getLastRecord(topicTable, 'slug', function (data) {
                     
            var dataIns = { name: dataRow.name, project: localStorage.getItem('myProject'), slug: dataRow.slug };
            if (data !== null) {
                dataIns["order"] = parseInt(data.order) + 1;
            } else {
                dataIns["order"] = 0;
            }

            var dataPage = dataRow.pages;

            ini.addTopic(dataIns, function () {
                var requestPage = window.indexedDB.open(DB_name, DB_version);
                var dbPage;

                requestPage.onsuccess = function (event) {
                    dbPage = event.target.result; // === request.result
                    var transaction = dbPage.transaction([pageTable], "readwrite");
                    var objectStore = transaction.objectStore(pageTable);
                    for (var x = 0; x < dataPage.length; x++) 
                    {
                        var dtp = dataPage[x];
                        var pageIns = {
                            topic: dataRow.slug,
                            slug: dtp.slug,
                            title: dtp.title,
                            content: '',
                            meta_keywords: '',
                            meta_description: '',
                            publish: 1,
                            order: 0,
                            project: localStorage.getItem('myProject'),
                        }
                        //console.log(pageIns);
                        objectStore.add(pageIns);
                    }
                    ini.handleLoad();
                    
                }


            });

            return true;

        });
    }

    registerTopic(slug) {
        
        var ini = this;
        for (var i = 0; i < this.state.topicTemplate.length; i++) {
             /* jshint loopfunc: true */
            if (this.state.topicTemplate[i].slug === slug) {
                var dataRow = this.state.topicTemplate[i];
                
                this._regiserTopic(ini, topicTable, dataRow);
            }
        }

    }
    openModal() {
        console.log("Open modal called ", this.state.modalVisible);
        const modalVisible = !this.state.modalVisible;
        this.setState({
          modalVisible
        });
    }

    removeTopic(slug)
    {
        //alert(slug);
        this.setState({slugDeleteTopic:slug});
        this.openModal();
    }

    handleRemoveTopic()
    {
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var ini = this;
        
        request.onsuccess = function (event) {
            db = event.target.result;
            var request = db.transaction([topicTable], "readwrite")
                .objectStore(topicTable)
                .delete(ini.state.slugDeleteTopic);
                
                request.onsuccess = function(event) {
                    
                    var transaction = db.transaction([pageTable], "readwrite");
                    var objectStore = transaction.objectStore(pageTable);
                    var vendorIndex = objectStore.index('topic');
                    var keyRng = IDBKeyRange.only(ini.state.slugDeleteTopic);
                    var cursorRequest = vendorIndex.openCursor(keyRng);
                    cursorRequest.onsuccess = e => {
                        var cursor = e.target.result;

                        if (cursor) {
                            cursor.delete();
                            cursor.continue();
                        }
                        
                    }
                    ini.openModal();
                    ini.handleLoad();
                    /*
                    var request = db.transaction([pageTable], "readwrite")
                        .objectStore(pageTable)
                        .delete(ini.state.slugDeleteTopic);
                        
                        request.onsuccess = function(event) {
                            ini.openModal();
                            ini.handleLoad();
                        };
                    */
                   
                };
                
        }
    }
    

    onDragStart = (e, idx) => {
        //console.log(idx);
        this.draggedItem = this.state.topicList[idx];
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.parentNode);
        //e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
        //console.log(this.draggedItem);
        e.target.parentNode.className += " border-dark text-white bg-secondary";
      };
    
    onDragOver = idx  => {
        const draggedOverItem = this.state.topicList[idx];
        // if the item is dragged over itself, ignore
        if (this.draggedItem === draggedOverItem) {
            return;
        }
        //console.log(this.draggedItem);
        //console.log(draggedOverItem);
        // filter out the currently dragged item
        //let topicList = this.state.topicList.filter(item => item !== this.draggedItem);
        let topicList = this.state.topicList.filter(item =>{
            //console.log(item.slug);
            //console.log(this.draggedItem.slug);
            //console.log("--------------------------");
            return item !== this.draggedItem;} );
        // add the dragged item after the dragged over item
        topicList.splice(idx, 0, this.draggedItem);
        //console.log(topicList);

        this.setState({ topicList }); 
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
            ini.state.topicList.map((n, idx) => {
                var dataIns = { 
                        name        : n.name, 
                        project     : n.project, 
                        slug        : n.slug,
                        order       : idx
                    };

                var transaction = db.transaction([topicTable], "readwrite");
                var objectStore = transaction.objectStore(topicTable);
                //console.log(dataIns);
                var objectStoreRequest = objectStore.put(dataIns);
                objectStoreRequest.onsuccess = function (event) {
                };

                return dataIns;
                    
            });
        }
    };

    render() {

        const listItems = this.state.topicList.map((n, idx) =>
            <TopicList key={n.slug} slug={n.slug} title={n.name} add="false"  items={n.pages}
                remove={this.removeTopic.bind(this, n.slug)}
                dragstart={e => this.onDragStart(e, idx)}
                dragover={e => this.onDragOver(idx)}
                dragend={e => this.onDragEnd(e)}
             />
        );
        const listTemplates = this.state.topicTemplate.map((n) =>
            <TopicList key={n.slug}  slug={n.slug} title={n.name} register={this.registerTopic.bind(this, n.slug)} add="true" items={n.pages} />
        );

        return (
            <main className="container mt-5 pt-5 mb-5" >
                <h2 className="mb-3">Set Topic</h2>

                <Link to="/manage" className="btn  btn-sm radius-0 btn-light border" >&laquo; Back to Manage</Link>

                <div className="row mt-4">
                    <div className="col-md-6">

                        <div className="card rounded-0 mb-2">
                            <div className="card-header">
                                <div className="font-weight-bold" >Current Topic in Doc.</div>
                            </div>
                            <div className="card-body">
                                {listItems}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card rounded-0 mb-2 ">
                            <div className="card-header ">
                                <div className="font-weight-bold" >Add Topic</div>
                            </div>
                            <div className="card-body">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="form-group row ">
                                        <div className="col-sm-9">
                                            <input type="text" name="name" onChange={this.handleInputChange} value={this.state.name} className="form-control" placeholder="Masukan nama topic" />
                                        </div>
                                        <div className="col-sm-3">
                                            <button className="btn btn-dark ">Simpan</button>
                                        </div>
                                    </div>
                                </form>
                                <div className="clear clearfix"></div>
                                <div className="h5 mt-4">Topic Template</div>
                                <div>
                                    {listTemplates}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <Confirmation
                    visible={this.state.modalVisible}
                    modal ={e => this.openModal()}
                    remove ={e => this.handleRemoveTopic()}
                    message="When deleting a topic, the pages inside will also be deleted. Are you sure to remove this topic?"
                 />


            </main>
        );
    }
}



export default Topic;