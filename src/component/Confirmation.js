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


class Confirmation extends Component{


    render() {
        return (
            <div className={(this.props.visible?'show':'false')+' modal in'} id="confirmModal"  role="dialog" aria-labelledby="confirmModalLabel" aria-hidden="true" style={this.props.visible ? { display: "block" }: { display: "none" }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirmModalLabel">Confirmation!</h5>
                        <button type="button" onClick={this.props.modal} className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>{this.props.message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={this.props.modal} className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" onClick={this.props.remove} className="btn btn-primary">Continue</button>
                    </div>
                    </div>
                </div>
                </div>
        )
    }
}

export default Confirmation;