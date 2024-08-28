import { useEffect, useRef, useState } from "react"
import './VideoCall.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMicrophone, faMicrophoneSlash, faVideoCamera, faVideoSlash } from "@fortawesome/free-solid-svg-icons";

export const VideoCall = ({localStream, remoteStream, onClose}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [inactiveMicrophone, setInactiveMicrophone] = useState(false);
    const [inactiveCamera, setInactiveCamera] = useState(false);


    useEffect(() => {

        console.log(localStream, "localStream")
        console.log(remoteStream, "remoteStream")

        if(localStream){
            localVideoRef.current.srcObject = localStream;
        }
        if(remoteStream){
           remoteVideoRef.current.srcObject = remoteStream; 
        }

    }, [localStream, remoteStream])

    const toggleMicrophone = () => {
        if(localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if(audioTrack){
                audioTrack.enabled = !audioTrack.enabled;
                console.log(audioTrack, "haha")
                setInactiveMicrophone(!audioTrack.enabled);
            }
        }
    }

    const toggleCamera = () => {
        if(localStream){
            const videoTrack = localStream.getVideoTracks()[0];
            if(videoTrack){
                videoTrack.enabled = !videoTrack.enabled;
                console.log(videoTrack, "camera toggled");
                setInactiveCamera(!videoTrack.enabled)
            }
        }
    }


    return (
        <div className="video-container">
            <div className="video-section">
                <video className="video-component" ref={localVideoRef} autoPlay muted></video>
                <video className="video-component" ref={remoteVideoRef} autoPlay ></video>

                <span onClick={toggleMicrophone} className="video-detail ">
                    {!inactiveMicrophone && <FontAwesomeIcon icon={faMicrophone}></FontAwesomeIcon>}
                    {inactiveMicrophone && <FontAwesomeIcon icon={faMicrophoneSlash}></FontAwesomeIcon>}
                </span>
                <span onClick={toggleCamera} className="video-detail camera"> 
                    {!inactiveCamera && <FontAwesomeIcon icon={faVideoCamera}></FontAwesomeIcon>}
                    {inactiveCamera && <FontAwesomeIcon icon={faVideoSlash}></FontAwesomeIcon>}
                </span>
                
            </div>
            <button onClick={onClose}>Leave</button>
        </div>
    )
}