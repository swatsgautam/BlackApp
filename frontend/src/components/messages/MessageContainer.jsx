import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { HiPhone } from "react-icons/hi"; // Add the phone icon
import { useAuthContext } from "../../context/AuthContext";
import CallComponent from "../sidebar/CallComponent"; // Import your CallComponent

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [showCall, setShowCall] = useState(false); // State to show/hide the call component

  useEffect(() => {
    // Cleanup function (unmounts)
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const handleCallClick = () => {
    // Show the call component when the phone icon is clicked
    setShowCall(true);
  };

  return (
    <div className="message-container">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <div className="message-header flex items-center">
            <span className="label-text">To:</span>{" "}
            <span className="conversation-name">
              {selectedConversation.fullName}
            </span>
            {/* Call Icon */}
            <HiPhone
              className="text-2xl ml-4 cursor-pointer"
              onClick={handleCallClick}
            />
          </div>

          {/* If the call component is triggered */}
          {showCall && <CallComponent receiverId={selectedConversation.id} />}

          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="no-chat-container">
      <div className="no-chat-content">
        <p>Welcome 👋 {authUser.fullName} ❄</p>
        <p>Select a chat to start messaging</p>
        <TiMessages className="no-chat-icon" />
      </div>
    </div>
  );
};
