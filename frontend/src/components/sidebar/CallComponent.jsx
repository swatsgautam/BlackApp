import React, { useEffect, useState, useRef } from "react";
import { HiPhone } from "react-icons/hi";
import { AiFillPhone, AiOutlinePhone } from "react-icons/ai";
import { MdCallEnd } from "react-icons/md";
import io from "socket.io-client";
import { useAuthContext } from "../../context/AuthContext";

import incomingCallSound from "../../assets/sounds/incoming_call.mp3";

const CallComponent = ({ receiverId }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [callOfferReceived, setCallOfferReceived] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false); // New state for incoming call dialog

  const { authUser } = useAuthContext();
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localAudioRef = useRef(null); // Audio reference
  const remoteAudioRef = useRef(null); // Audio reference

  useEffect(() => {
    if (authUser && authUser.userId) {
      socketRef.current = io("https://blackapp-pjs5.onrender.com", {
        query: { userId: authUser.userId },
      });

      socketRef.current.on("callOffer", (data) => {
        handleCallOffer(data);
      });

      socketRef.current.on("callAnswer", (data) => {
        handleCallAnswer(data);
      });

      socketRef.current.on("callRejected", (data) => {
        handleCallRejected(data);
      });

      socketRef.current.on("receiveIceCandidate", (data) => {
        handleNewICECandidate(data);
      });

      return () => {
        if (peerConnectionRef.current) peerConnectionRef.current.close();
      };
    }
  }, [authUser]);

  const checkForDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );

    if (audioDevices.length === 0) {
      setError("No audio device found. Please check your microphone.");
      return false;
    }

    return true;
  };

  const startCall = async () => {
    const devicesAvailable = await checkForDevices();
    if (!devicesAvailable) return; // Stop if no devices are found

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Only audio stream
      });

      setLocalStream(stream);

      // Initialize peer connection if not already done
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = new RTCPeerConnection();
      }

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        // Make sure socketRef.current is available before emitting
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("iceCandidate", {
            candidate: event.candidate,
            receiverId,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (event.track.kind === "audio") {
          setRemoteStream(event.streams[0]);
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit("callOffer", {
        offer,
        receiverId,
      });

      const audio = new Audio(incomingCallSound);
      audio.play();
    } catch (err) {
      if (err.name === "NotFoundError") {
        setError("No media devices found or permission denied.");
      } else {
        setError("An error occurred while starting the call.");
      }
    }
  };

  const handleCallOffer = (data) => {
    const { offer, senderId } = data;
    setIsIncomingCall(true); // Display incoming call dialog
    const audio = new Audio(incomingCallSound);
    audio.play();
  };

  const acceptCall = async () => {
    setIsIncomingCall(false); // Hide the incoming call dialog
    setCallOfferReceived(false);
    peerConnectionRef.current = new RTCPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, // Only audio stream
    });

    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("iceCandidate", {
          candidate: event.candidate,
          receiverId,
        });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (event.track.kind === "audio") {
        setRemoteStream(event.streams[0]);
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    socketRef.current.emit("callAnswer", { answer, receiverId });

    setIsInCall(true);
  };

  const rejectCall = () => {
    setIsIncomingCall(false); // Hide the incoming call dialog
    socketRef.current.emit("callRejected", { receiverId });
    setCallRejected(true);
  };

  const handleCallRejected = (data) => {
    if (data.receiverId === authUser.userId) {
      setCallOfferReceived(false);
      alert("The call was rejected by the receiver.");
    }
  };

  const handleNewICECandidate = (data) => {
    if (data.senderId !== authUser.userId && socketRef.current) {
      const candidate = new RTCIceCandidate(data.candidate);
      peerConnectionRef.current.addIceCandidate(candidate);
    }
  };

  const endCall = () => {
    setIsInCall(false);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socketRef.current.emit("endCall", { receiverId });
  };

  return (
    <div className="call-container">
      {error && <div className="error-message">{error}</div>}
      {!isInCall ? (
        <div>
          {!callOfferReceived ? (
            <div>
              <div className="call-header">
                <span>Calling...</span>
              </div>
              <button onClick={startCall} className="call-button">
                <HiPhone className="text-3xl text-white" />
                Start Call
              </button>
            </div>
          ) : (
            <div className="incoming-call">
              <div className="call-header">
                <span>Incoming Call...</span>
              </div>
              <button onClick={acceptCall} className="call-accept-button">
                <AiFillPhone className="text-3xl text-white" />
                Accept
              </button>
              <button onClick={rejectCall} className="call-reject-button">
                <MdCallEnd className="text-3xl text-white" />
                Reject
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="call-ongoing">
          <div className="audio-container">
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />
          </div>
          <div className="call-header">
            <span>In Call</span>
          </div>
          <button className="call-end-button" onClick={endCall}>
            <MdCallEnd className="text-3xl text-white" />
            End Call
          </button>
        </div>
      )}

      {isIncomingCall && (
        <div className="incoming-call-modal">
          <h3>Incoming Call</h3>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
    </div>
  );
};

export default CallComponent;
