import React from "react";
import { CSSTransition } from "react-transition-group";
import './overlay.css'



function Overlay({alertFlag, alertMessage, setAlertFlag}){
    // const {alertFlag, alertMessage} = this.props
    return(
            <CSSTransition
                in={alertFlag}
                timeout={300}
                classNames="confirm-btn-transition"
                unmountOnExit
                >
                    <div className="alert-overlay">
                        <div className="overlay-content">
                            {alertMessage}
                            <button onClick={() => setAlertFlag(false)}>Close</button>
                        </div>
                    </div>
                    
            </CSSTransition>
    )
}

export default Overlay;