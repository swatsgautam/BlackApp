import { useState } from "react";
import { BsSend, BsPaperclip } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const { loading, sendMessage } = useSendMessage();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Store the selected file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return; // Ensure at least one input is provided

    try {
      // Send message and file if present
      await sendMessage(message, file);
      setMessage(""); // Clear message field
      setFile(null); // Clear file after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="message-input-container relative flex items-center w-full">
        {/* File Upload Button */}
        <label htmlFor="fileUpload" className="cursor-pointer p-2">
          <BsPaperclip size={18} />
        </label>
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Message Input */}
        <input
          type="text"
          className="message-input w-full p-3 bg-gray-700 text-white text-sm rounded-lg border-gray-600 border focus:outline-none"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="absolute right-2 flex items-center text-xl text-gray-400 hover:text-white"
        >
          {loading ? (
            <div className="loading-spinner"></div> // Display loading spinner if in loading state
          ) : (
            <BsSend />
          )}
        </button>
      </div>

      {/* Display Selected File Name */}
      {file && <p className="file-name mt-2 text-sm text-gray-400">📎 {file.name}</p>}
    </form>
  );
};

export default MessageInput;
