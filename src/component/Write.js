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

import { Config } from '../config.js'

const DB_name = Config.DB_name;
const DB_version = Config.DB_version;
const topicTable = Config.topicTable;
const pageTable = Config.pageTable;

const toUrl = (url)=>{
    return encodeURI(url.replace(' ','').toLowerCase());
}

class Write extends Component {
    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);

        var paramSlug = this.props.match.params.slug;
        
        
        this.state={
            topic           : paramSlug,
            slug            : '',
            title           : sessionStorage.getItem("__title")!== null?sessionStorage.getItem("__title"):'',
            content         : sessionStorage.getItem("__content")!== null?sessionStorage.getItem("__content"):'',
            meta_keywords   : sessionStorage.getItem("__meta_keywords")!== null?sessionStorage.getItem("__meta_keywords"):'',
            meta_description: sessionStorage.getItem("__meta_description")!== null?sessionStorage.getItem("__meta_description"):'',
            publish         : 1,
            order           : 1,
            project         : localStorage.getItem('myProject'),
            topic_title     : '',
            isEdit          : true,
        };
        
       
        

        //console.log(this.state);

        

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
        //sessionStorage.setItem("__slug","");
        sessionStorage.setItem("__title","");
        sessionStorage.setItem("__content","");
        sessionStorage.setItem("__meta_keywords","");
        sessionStorage.setItem("__meta_description","");
        sessionStorage.setItem("__slug","");
        window.removeEventListener("beforeunload", this.onUnload)
    }
    componentDidUpdate (){
       
    }

    onUnload(e) { 
        e.preventDefault();
        return e.returnValue = 'You have unsaved changes, are you sure you want to leave?';
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
            sessionStorage.setItem("__content", html);
        });


        //console.log('handle load write')
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        
        var paramSlug = this.props.match.params.slug;
        request.onsuccess = function(event) {
            db = event.target.result; // === request.result
            
            if(ini.props.match.path==='/edit/:slug')
            {
                //console.log(paramSlug)
                var transactionPage = db.transaction([pageTable], "readonly");
                var objectPage = transactionPage.objectStore(pageTable);
                var objectPageRequest = objectPage.get(paramSlug);

                
                objectPageRequest.onsuccess = function (event) {
                    var dt = objectPageRequest.result;
                    //console.log(dt)
                    //console.log("this edit page")
                    var currentPage = false;

                    

                    if ( sessionStorage.getItem("__slug")=== dt.slug)
                    {
                        currentPage = true;
                        
                    } 
                    //console.log(currentPage);
                    
                    ini.setState({
                        topic           : dt.topic,
                        slug            : dt.slug,
                        title           : sessionStorage.getItem("__title")!== null &&  currentPage ?sessionStorage.getItem("__title"):dt.title,
                        content         :  currentPage?sessionStorage.getItem("__content"):dt.content,
                        meta_keywords   : sessionStorage.getItem("__meta_keywords")!== null &&  currentPage?sessionStorage.getItem("__meta_keywords"):dt.meta_keywords,
                        meta_description: sessionStorage.getItem("__meta_description")!== null &&  currentPage?sessionStorage.getItem("__meta_description"):dt.meta_description,
                        publish         : dt.publish,
                        order           : dt.order,
                        project         : dt.project,
                    });
                    //ini.refs.title.value = dt.title;
                    sessionStorage.setItem("__slug",dt.slug);
                    quill.root.innerHTML = currentPage?sessionStorage.getItem("__content"):dt.content;
                    var transaction = db.transaction([topicTable], "readonly");
                    var objectStore = transaction.objectStore(topicTable);
                    var objectStoreRequest = objectStore.get(dt.topic);

                    objectStoreRequest.onsuccess = function (event) {
                        var dt = objectStoreRequest.result;
                        ini.setState({topic_title:dt.name});
                    };
                    ini.forceUpdate()
                };
                

            }else{
                var transaction = db.transaction([topicTable], "readonly");
                var objectStore = transaction.objectStore(topicTable);
                var objectStoreRequest = objectStore.get(ini.state.topic);

                
                objectStoreRequest.onsuccess = function (event) {
                    var dt = objectStoreRequest.result;
                    ini.setState({topic_title:dt.name});
                    sessionStorage.setItem("__topic", dt.slug);
                };
            }

            
        }

        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };

        
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
        sessionStorage.setItem("__"+name, value);

    }

    handleSubmit(e)
    {
        this.setState({isEdit:false});
        e.preventDefault();

        var dataIns = { 
                topic           : this.state.topic,
                slug            : toUrl(this.state.title),
                title           : this.state.title,
                content         : this.state.content,
                meta_keywords   : this.state.meta_keywords,
                meta_description: this.state.meta_description,
                publish         : 1,
                order           : 1,
                project         : localStorage.getItem('myProject'),
             };

             if(this.props.match.path==='/edit/:slug')
             {
                dataIns.slug = this.state.slug
             }

        var ini = this;
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var prop = this.props;
        request.onsuccess = function(event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result
            
            //console.log(db);
            var transaction = db.transaction([pageTable], "readwrite");
            var objectStore = transaction.objectStore(pageTable);
            //console.log(dataIns);
            var objectStoreRequest = objectStore.put(dataIns);

            
            objectStoreRequest.onsuccess = function (event) {
                //console.log('The data has been written successfully');
               
                prop.history.push("/manage#"+ini.state.topic)

            };

            objectStoreRequest.onerror = function (event) {
                console.log('The data has been written failed');
            }
            
        };
        
    }

    render() {
        //console.log(this.state);
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
                            <span className="font-weight-lighter">Create Page</span>
                            </h3>
                        </div>
                        <div className="col-lg-9 pr-lg-5 pl-lg-5">
                            <div className="mr-lg-5" >
                                <input className="form-control rounded-0 border-top-0 border-right-0 border-left-0 border-secondary p-0" placeholder="Title of page" name="title" ref="title" type="text"  value={this.state.title} onChange={this.handleInputChange}  />
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
                                        <small className="d-block font-weight-lighter mb-1">Topic of</small>
                                        {this.state.topic_title}
                                    </div>
                                </div>
                                <div className="mb-4 " >
                                    <label>Meta Keywords</label>
                                    <textarea className="form-control form-control-sm rounded-0" name="meta_keywords" placeholder="Meta Keywords ..." value={this.state.meta_keywords} ref="meta_keywords" onChange={this.handleInputChange} ></textarea>
                                </div>
                                <div className="mb-4" >
                                    <label>Meta Description</label>
                                    <textarea className="form-control form-control-sm rounded-0" name="meta_description" value={this.state.meta_description} placeholder="Meta Deskripsi ..." ref="meta_description" onChange={this.handleInputChange} ></textarea>
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
        );
    }
}



export default Write;