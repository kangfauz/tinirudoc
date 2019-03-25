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

import {Config} from '../config.js'

const DB_name       = Config.DB_name;
const DB_version    = Config.DB_version;
const changeLogTable = Config.changeLogTable;

const toUrl = (url)=>{
    return encodeURI(url.replace(' ','').toLowerCase());
}
const suffix = "_log";
class Changelog extends Component {
    constructor(props) {
        super(props);

        this.state={
            title           : sessionStorage.getItem("__title"+suffix)!== null?sessionStorage.getItem("__title"+suffix):'',
            slug            : '',
            datelog         : sessionStorage.getItem("__datelog"+suffix)!== null?sessionStorage.getItem("__datelog"+suffix):'',
            content         : sessionStorage.getItem("__content"+suffix)!== null?sessionStorage.getItem("__content"+suffix):'',
            publish         : 1,
            order           : 1,
            project         : localStorage.getItem('myProject'),
            topic_title     : localStorage.getItem('myProjectName'),
            isEdit          : true,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onUnload = this.onUnload.bind(this);
    }
    componentDidMount() {
      
        this.handleLoad();
        document.getElementById('topnav').style.display = 'none';
        window.scrollTo(0,0);
        window.addEventListener("beforeunload", this.onUnload)
    }
    componentWillUnmount()
    {
       //document.getElementById('topnav').style.display = 'flex';
        //sessionStorage.setItem("__slug"+suffix,"");

        sessionStorage.setItem("__title"+suffix,"");
        sessionStorage.setItem("__content"+suffix,"");
        sessionStorage.setItem("__datelog"+suffix,"");
        sessionStorage.setItem("__slug"+suffix,"");

        window.removeEventListener("beforeunload", this.onUnload)
    }
    componentDidUpdate (){
       
    }

    onUnload(e) { 
        
        return e.returnValue = 'You have unsaved changes, are you sure you want to leave?';
        //e.preventDefault();
    }

    handleLoad()
    {

        var toolbarOptions ={
            container:[
                    ['bold', 'italic', 'underline'/*, 'strike'*/],        /*// toggled buttons*/
                    ['blockquote', 'code-block'],
                    /*//[{ 'header': 1 }, { 'header': 2 }], */              /*// custom button values*/
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],      /*// superscript/subscript*/
                    /*//[{ 'indent': '-1'}, { 'indent': '+1' }],*/          /*// outdent/indent*/
                    /*[{ 'direction': 'rtl' }],*/                        /*// text direction*/
                    [{ 'size': ['small', false, 'large', 'huge'] }],  /*// custom dropdown*/
                    [{ 'header': [2,3, 4, false] }],
                    [ 'link', 'image', 'video', /*'formula' */],          /*// add's image support*/
                    [{ 'color': [] }, { 'background': [] }],          /*// dropdown with defaults from theme*/
                    /*//[{ 'font': [] }],*/
                    [{ 'align': [] }],
    
                    ['clean'],                                         /*// remove formatting button*/
                    [{ 'instable': ['AddTable', 'RowAbove', 'RowBelow', 'ColLeft', 'ColRight','DelRow','DelCol','DelTable'] }],
                    
                ],
            handlers: {
                "instable": function (value) { 
                    if (value) {
                        if(value==="AddTable")
                        {
                            table.insertTable(2, 2);
                        }else if(value==="RowAbove")
                        {
                            table.insertRowAbove();
                        }else if(value==="RowBelow")
                        {
                            table.insertRowBelow();
                        }else if(value==="ColLeft")
                        {
                            table.insertColumnLeft();
                        }else if(value==="ColRight")
                        {
                            table.insertColumnRight();
                        }else if(value==="DelRow")
                        {
                            table.deleteRow();
                        }else if(value==="DelCol")
                        {
                            table.deleteColumn();
                        }else if(value==="DelTable")
                        {
                             table.deleteTable();
                        }
                        
                        
                    }
                },
                "buttonlink": function (value){
                        var range = quill.getSelection();
                        if (range) {
                          var hashtag = prompt("Link url", "");
                          quill.insertEmbed(range.index, 'Button', hashtag);
                        }
                    }
                }
            };

        var quill = new window.Quill('#editor', {
            theme: 'snow',
            scrollingContainer: document.documentElement,
            modules: {
                    table: true,
                    toolbar: toolbarOptions
                },
            placeholder: 'Start writing ...',
            bounds: '#editor-out'
            });
        
        const table = quill.getModule('table'); 

        const placeholderPickerItems = Array.prototype.slice.call(document.querySelectorAll('.ql-instable .ql-picker-item'));

        placeholderPickerItems.forEach(item => item.textContent = item.dataset.value);
        
        document.querySelector('.ql-instable .ql-picker-label').innerHTML
        = 'Table' + document.querySelector('.ql-instable .ql-picker-label').innerHTML;
        if(document.querySelector('.ql-instable').classList.contains("ql-selected")){ 
            document.querySelector('.ql-instable .ql-selected').classList.remove("ql-selected");
        }

          //quill.setContents(this.state.content);
        quill.root.innerHTML = this.state.content;
        var ini = this;
        quill.on('editor-change', function(eventName) {
            if (eventName === 'text-change') {
                // args[0] will be delta
            } else if (eventName === 'selection-change') {
                // args[0] will be old range
            }
            //
            var myEditor = document.querySelector('#editor');
            var html = myEditor.children[0].innerHTML;
            html= html.replace(/(<p[^>]*?>[\s|&nbsp;]*<\/p>)/g, '');
            html= html.replace(/<elmblock class="elm-block" data-language="plain">/g, '');
            html= html.replace(/<\/elmblock>/g, "\n");
            //console.log(html);
            ini.setState({content:html});
            sessionStorage.setItem("__content"+suffix, html);
        });

        var paramSlug = this.props.match.params.slug;
        if(typeof paramSlug !== 'undefined')
        {
            var request = window.indexedDB.open(DB_name, DB_version);
            var db;
            
            request.onsuccess = function(event) {
                db = event.target.result; // === request.result

                var transactionPage = db.transaction([changeLogTable], "readonly");
                var objectPage = transactionPage.objectStore(changeLogTable);
                var objectPageRequest = objectPage.get(paramSlug);

                
                objectPageRequest.onsuccess = function (event) {
                    var dt = objectPageRequest.result;
                    //console.log(dt)
                    //console.log("this edit page")
                    var currentPage = false;

                    

                    if ( sessionStorage.getItem("__slug"+suffix)=== dt.slug)
                    {
                        currentPage = true;
                        
                    } 
                    //console.log(currentPage);
                    
                    ini.setState({
                        slug            : dt.slug,
                        title           : sessionStorage.getItem("__title"+suffix)!== null &&  currentPage ?sessionStorage.getItem("__title"+suffix):dt.title,
                        content         :  sessionStorage.getItem("__content"+suffix)!== null && currentPage?sessionStorage.getItem("__content"+suffix):dt.content,
                        datelog   : sessionStorage.getItem("__meta_keywords")!== null &&  currentPage?sessionStorage.getItem("__datelog"+suffix):dt.datelog,
                        publish         : dt.publish,
                        order           : dt.order,
                        project         : dt.project,
                    });
                    //ini.refs.title.value = dt.title;
                    sessionStorage.setItem("__slug"+suffix,dt.slug);
                    quill.root.innerHTML = currentPage?sessionStorage.getItem("__content"+suffix):dt.content;

                    ini.forceUpdate()
                };
            }
        }
        
    }

    handleInputChange(event)
    {
        const target    = event.target;
        const value     = target.value;
        const name      = target.name;

        this.setState({
            [name]: value,
            isEdit:true
        });
        //this.setState({isEdit:true});
        sessionStorage.setItem("__"+name+suffix, value);

    }

    handleSubmit(e)
    {
        this.setState({isEdit:false});

        e.preventDefault();
        var dataIns = { 
            slug            : toUrl(this.state.title),
            title           : this.state.title,
            content         : this.state.content,
            datelog         : this.state.datelog,
            publish         : 1,
            order           : 1,
            project         : localStorage.getItem('myProject'),
         };

        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var prop = this.props;
        request.onsuccess = function(event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result
            
            //console.log(db);
            var transaction = db.transaction([changeLogTable], "readwrite");
            var objectStore = transaction.objectStore(changeLogTable);
            //console.log(dataIns);
            var objectStoreRequest = objectStore.put(dataIns);

            
            objectStoreRequest.onsuccess = function (event) {
                //console.log('The data has been written successfully');
                
                prop.history.push("/manage")

            };

            objectStoreRequest.onerror = function (event) {
                console.log('The data has been written failed');
            }
            
        };

    }

    render() {
        //console.log(this.state)
        return (
            <main className="mt-2" style={{background: '#eaeaea'}} >
            <Prompt
                when={this.state.isEdit}
                message='You have unsaved changes, are you sure you want to leave?'
                />
            <form onSubmit={this.handleSubmit}>
            <div className="sticky-top bg-white pt-2 pb-2">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-3">
                            <h3>
                            <Link to="/manage" className="btn btn-secondary btn-sm rounded-2 mr-3" >&lt;</Link>
                            <span className="font-weight-lighter">Change Log</span>
                            </h3>
                        </div>
                        <div className="col-lg-9 pr-lg-5 pl-lg-5">
                            <div className="mr-lg-5" >
                                <input className="form-control rounded-0 border-top-0 border-right-0 border-left-0 border-secondary p-0" placeholder="Name of Change log" name="title" ref="title" type="text"  value={this.state.title} onChange={this.handleInputChange}  />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="container-fluid " >
                <div className="row ">

                    <div className="col-lg-3 py-4 bg-white order-lg-0 " id="outleft">
                    
                    <div id="left-inner" className="bg-white pb-5  ">
                        <div className="" >
                                <div className="mb-5 text-center h5" >
                                    <div className=" ">
                                        <small className="d-block font-weight-lighter mb-1">Documentation of</small>
                                        {this.state.topic_title}
                                    </div>
                                </div>
                                <div className="mb-4 " >
                                    <label>Date of Change Log</label>
                                    <input type="date" value={this.state.datelog} onChange={this.handleInputChange} className="form-control rounded-0" name="datelog" />
                                </div>
                                
                        </div>
                    </div>
                    
                </div>

                    <div className="col-lg-9 content pr-lg-5 pl-lg-5 order-lg-1 " >
                        <div id="editor-out" className="mr-lg-3 pb-lg-5">
                     
                            <div id="editor" className="bg-white border-0 mb-lg-5 mb-3">
                            
                            </div>
                        </div>
                    </div>
                    
                    
                </div>
                <button type="submit" id="btn-push" style={{position: 'fixed', bottom: '0px', right: '0px'}} className="btn btn-dark rounded-1 mb-3 mx-lg-5 mx-3">Save Page</button>
            </div>
            </form>
        </main>
        )
    }
}

export default Changelog;