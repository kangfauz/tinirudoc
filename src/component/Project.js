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

import {Config} from '../config.js'

const DB_name       = Config.DB_name;
const DB_version    = Config.DB_version;

const toUrl = (url)=>{
    return encodeURI(url.replace(' ','').toLowerCase());
}

class Project extends Component{
    constructor(props) {
        super(props);
        this.state = {
            type        : 'website',
            name        : '',
            logo        : '',
            description : '',
            siteUrl     : ''
          };
        
        this.db = null;
        
        this.handleLoad = this.handleLoad.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleUploadLogo = this.handleUploadLogo.bind(this);
    }
    componentDidMount() {
        window.scrollTo(0,0);
        this.handleLoad();
    }
    
    handleLoad()
    {
       
        
        this.readProject();
        
        
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

    readProject()
    {
        
        //const query = new URLSearchParams(this.props.location.search);
        //const _edit = query.get('_edit')
        
        //console.log(_edit);
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;

        var ini = this
        request.onsuccess = function(event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result
            var transaction = db.transaction(["project"]);
            var objectStore = transaction.objectStore("project");
            var index = objectStore.index('slug');
            var openCursorRequest = index.openCursor(null, 'prev');
            //var request = objectStore.get(1);
            //console.log(request);
            
            openCursorRequest.onsuccess = function (event) {
                if (event.target.result) {
                    var dt = event.target.result.value;
                    //console.log("ini data dt");
                    //console.log(dt);
                    if (typeof dt !== 'undefined')
                    {
                        ini.setState( {
                            type        : dt.type,
                            name        : dt.name,
                            logo        : dt.logo,
                            description : dt.description,
                            siteUrl     : dt.siteUrl
                        });
                        ini.showLogo();
                        localStorage.setItem('myProject', dt.slug);
                        localStorage.setItem('myProjectName', dt.name);
                        //if(_edit == null || _edit === 'undefined' || _edit !== 'true') prop.history.push("/manage")
                    }
                }
                
                //elem.name.value = this.state.name;
                //elem.type.value = this.state.type;
                //elem.description.value = this.state.description;  
                //elem.siteUrl.value = this.state.siteUrl; 
                
               

            };

            request.onerror = function (event) {
                console.log('The fetch data failed');
            }
            
        };
        
        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };
       
        
        
    }
    
    handleSubmit(e)
    {
        e.preventDefault();

        //console.log(this.state);
        var dataIns = { 
            slug: toUrl(this.state.name), 
            name: this.state.name, 
            type: this.state.type, 
            logo:this.state.logo, 
            description: this.state.description, 
            siteUrl:this.state.siteUrl };

        localStorage.setItem('myProject', dataIns.slug);
        
        var request = window.indexedDB.open(DB_name, DB_version);
        var db;
        var prop = this.props;
        request.onsuccess = function(event) {
            //console.log('[onsuccess]', request.result);
            db = event.target.result; // === request.result
            
            //console.log(db);
            var transaction = db.transaction(["project"], "readwrite");
            var objectStore = transaction.objectStore("project");
            //console.log(dataIns);
            var objectStoreRequest = objectStore.put(dataIns);

            
            objectStoreRequest.onsuccess = function (event) {
                console.log('The data has been written successfully');
                prop.history.push("/manage")

            };

            objectStoreRequest.onerror = function (event) {
                console.log('The data has been written failed');
            }
            
        };
        
        request.onerror = function(event) {
            console.log('[onerror]', request.error);
        };
        
        
    }
    showLogo()
    {
        var img = '<img src="'+this.state.logo+'" style="max-width:124px;" class="img-fluid">';
        if (this.state.logo.length>0){
            
            this.refs.imagepreview.innerHTML=img;
        }
            
    }
    handleUploadLogo(event)
    {
        const target    = event.target;
        //const value     = target.value;
        const file      = target.files[0];
        //const name      = target.name;

        var reader = new FileReader();
        var ini = this;
        reader.readAsBinaryString(file);

        reader.onload = function() {
            var src = 'data:image/jpeg;base64,'+btoa(reader.result);
            //console.log(src);
            ini.setState({'logo':src});
            ini.showLogo();
        };
        reader.onerror = function() {
            console.log('there are some problems');
        };
    }

    render() {
        
        return (
            <main className="container  mt-5 pt-5 mb-5" >
               
                <div className="row justify-content-center">
                    <div className="col-md-8">
                    
                        <h1 className="mb-4">Create Doc.</h1>
                        <hr className="my-4"/>
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-group row">
                                <label  className="col-sm-3 col-form-label">Type of App</label>
                                <div className="col-sm-9">
                                    <select name="type" ref="type"  onChange={this.handleInputChange}  value={this.state.type}   className="form-control" >
                                        <option value="website">Website App</option>
                                        <option value="mobile">Mobile App</option>
                                        <option value="dekstop">Dekstop App</option>
                                        <option value="programming">Programming</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label  className="col-sm-3 col-form-label">Name of App</label>
                                <div className="col-sm-9">
                                <input type="text" name="name" ref="name" onChange={this.handleInputChange}  value={this.state.name} className="form-control" id="" placeholder="Title for Documentation" />
                                </div>
                            </div>
                            
                            <div className="form-group row">
                                <label  className="col-sm-3 col-form-label">Logo</label>
                                <div className="col-sm-9">
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" >Upload</span>
                                        </div>
                                        <div className="custom-file">
                                            <input type="file" name="logo" onChange={this.handleUploadLogo}  className="custom-file-input"  />
                                            <label className="custom-file-label">Choose file</label>
                                        </div>
                                    </div>
                                    <div id="imagepreview" ref="imagepreview"></div>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label  className="col-sm-3 col-form-label">Description</label>
                                <div className="col-sm-9">
                                    <textarea name="description"  ref="description" onChange={this.handleInputChange} value={this.state.description} className="form-control" id="" placeholder="Descritption of application ..."></textarea>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label  className="col-sm-3 col-form-label">Site Url</label>
                                <div className="col-sm-9">
                                <input type="text" name="siteUrl" ref="siteUrl" onChange={this.handleInputChange} value={this.state.siteUrl} className="form-control" id="" placeholder="Http:// ....."/>
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-sm-3"></div>
                                <div className="col-sm-9">
                                    <button type="submit" className="btn btn-primary btn-lg btn-block">Save</button>
                                {/*
                                <Link to="/manage" className="btn btn-primary" >Mulai</Link>
                                */}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        )
    }
}

export default Project;