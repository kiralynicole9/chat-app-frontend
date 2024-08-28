import "./IncomingCallPopUp.css"

export const IncomingCallPopUp = ({showIncomingCall, caller, onClose, onAccept}) =>{
    if(!showIncomingCall) return null;
    
    return(
        <div className="popup-call">
            <div className="popup-call-title">
                {caller} is calling...
            </div>
            <button  onClick={onAccept} className="popup-call-button">Accept</button>
            <button className="popup-call-button" onClick={onClose}>Cancel</button>
        </div>
    )
}