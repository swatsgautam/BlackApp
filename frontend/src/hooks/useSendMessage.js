import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (message, file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("message", message); // Append the message
    if (file) {
      formData.append("file", file); // Append the file if present
    }

    try {
      const res = await fetch(
        `https://blackapp-pjs5.onrender.com/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          body: formData, // Send the form data with the message and file
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([...messages, data]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
