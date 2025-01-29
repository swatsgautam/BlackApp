import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx, emoji }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();

  const isSelected = selectedConversation?._id === conversation._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  return (
    <>
      <div
        className={`conversation-item ${isSelected ? "selected" : ""}`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="avatar-img">
            <img src={conversation.profilePic} alt="user avatar" />
          </div>
        </div>

        <div className="conversation-info">
          <div className="conversation-header">
            <p className="conversation-name">{conversation.fullName}</p>
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider" />}
    </>
  );
};
export default Conversation;
