import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe
    ? authUser.profilePic
    : selectedConversation?.profilePic;
  const bubbleBgColor = fromMe ? "bg-blue-500" : "";

  const shakeClass = message.shouldShake ? "shake" : "";

  // Check if message has a file (image or other type)
  const hasFile = message.file;

  return (
    <div className={`message ${chatClassName}`}>
      <div className="message-avatar">
        <div className="avatar-img">
          <img alt="profile" src={profilePic} />
        </div>
      </div>

      <div className={`message-bubble ${bubbleBgColor} ${shakeClass}`}>
        {/* If there's a file, display it */}
        {hasFile ? (
          // Check if it's an image and render it accordingly
          message.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
            <img
              src={`http://localhost:3000/${message.file}`}
              alt="message file"
              className="message-image"
            />
          ) : (
            <a
              href={`http://localhost:3000/${message.file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download file
            </a>
          )
        ) : (
          // If there's no file, render the message text
          message.message
        )}
      </div>

      <div className="message-footer">{formattedTime}</div>
    </div>
  );
};

export default Message;
