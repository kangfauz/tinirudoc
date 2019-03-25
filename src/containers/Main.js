/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @author - https://github.com/kangfauz
 * 
 * @website - https://tiniru.com
 * 
 */
import React from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Home from '../component/Home'
import Project from '../component/Project'
import Manage from '../component/Manage'
import Topic from '../component/Topic'
import Write from '../component/Write'
import Changelog from '../component/Changelog'
import Generate from '../component/Generate'




function isCreated()
{

  if(localStorage.getItem('myProject')!== null)
    return true;
  else return false;
  
}

const Main = ({ location }) => (
  <main> 
    <TransitionGroup>
        <CSSTransition
          key={location.key}
          timeout={{ enter: 1000, exit: 1000 }}
          classNames="fade"
        >
          <section className="route-section">
            <Switch location={location}>      
                {/*<Route exact={true} path='/' component={Home}/>
                <Route path='/project' component={Project}/>
                <Route path='/manage' component={Manage}/>
                <Route path='/topic' component={Topic}/>
                <Route path='/write/:slug' component={Write}/>
                <Route path='/edit/:slug' component={Write}/>
                */}
                <Route path='/project' component={Project}/>

                <Route path='/manage' render={(props) => {
                  if(isCreated()){
                    return  (<Manage  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>

                <Route path='/topic'render={(props) => {
                  if(isCreated()){
                    return  (<Topic  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>
                <Route path='/write/:slug' render={(props) => {
                  if(isCreated()){
                    return  (<Write  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>
                <Route path='/edit/:slug' render={(props) => {
                  if(isCreated()){
                    return  (<Write  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>
                <Route path='/changelog/:slug?' render={(props) => {
                  if(isCreated()){
                    return  (<Changelog  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>
                <Route path='/generate/:slug?' render={(props) => {
                  if(isCreated()){
                    return  (<Generate  {...props} />)
                  }else{
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/home" />)
                    }else{
                      return null;
                    }
                  }
                  }}/>

                <Route exact strict path="*" render={(props) => {
                  //console.log(isCreated());
                  //console.log(window.location);
                  //console.log(props.location.pathname+"==="+ window.location.pathname)
                  if(isCreated()){
                    if(props.location.pathname === window.location.pathname){
                      return (<Redirect to="/manage" />)
                    }else{
                      return (<Home  {...props} />);
                    }
                  }else return (<Home  {...props} />)
                  }} />
            </Switch>
          </section>
          </CSSTransition>
      </TransitionGroup>
  </main>
)

//export default Main;
export default withRouter(Main);