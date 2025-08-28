import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { format } from "date-fns";
import styles from "./chatpage.module.css";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const socket = useUserStore((state) => state.socket);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentChatRef = useRef(null);

  useEffect(() => {
    if (userId) {
      loadIndividualChat();
    } else {
      loadChatOverview();
    }
  }, [userId]);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const handleReceiveMessage = useCallback((message) => {
    setMessages((prev) => {
      const shouldAdd =
        currentChatRef.current && message.chat === currentChatRef.current._id;

      if (shouldAdd) {
        return [...prev, message];
      }
      return prev;
    });
  }, []);

  const handleUserTyping = useCallback((data) => {
    const { userId: typingUserId, isTyping, chatId } = data;

    setTypingUsers((prev) => {
      const shouldUpdate =
        currentChatRef.current && chatId === currentChatRef.current._id;

      if (shouldUpdate) {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(typingUserId);
        } else {
          newSet.delete(typingUserId);
        }
        return newSet;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("userTyping", handleUserTyping);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("userTyping", handleUserTyping);
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authenticatedFetch("/api/chats");

      if (response && Array.isArray(response)) {
        const sortedChats = response.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt;
          const bTime = b.lastMessage?.createdAt || b.createdAt;
          return new Date(bTime) - new Date(aTime);
        });
        setChats(sortedChats);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats");
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndividualChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const chatResponse = await authenticatedFetch("/api/chats/createGet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (chatResponse) {
        setCurrentChat(chatResponse);
        const other = chatResponse.participants.find(
          (p) => p._id !== currentUser._id
        );
        setOtherUser(other);

        const messagesResponse = await authenticatedFetch(
          `/api/chats/${chatResponse._id}`
        );

        if (messagesResponse && Array.isArray(messagesResponse)) {
          setMessages(messagesResponse);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error loading chat:", err);
      setError("Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isCurrentUserTyping && e.target.value.trim()) {
      setIsCurrentUserTyping(true);
      socket?.emit("typing", {
        chatId: currentChat._id,
        recipientId: otherUser._id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isCurrentUserTyping) {
        setIsCurrentUserTyping(false);
        socket?.emit("stopTyping", {
          chatId: currentChat._id,
          recipientId: otherUser._id,
        });
      }
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !currentChat) return;

    const messageData = {
      content: newMessage.trim(),
      chatId: currentChat._id,
      recipientId: otherUser._id,
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");

    if (isCurrentUserTyping) {
      setIsCurrentUserTyping(false);
      socket.emit("stopTyping", {
        chatId: currentChat._id,
        recipientId: otherUser._id,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== currentUser._id);
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), "HH:mm");
  };

  const renderChatOverview = () => (
    <div className={styles.chatOverview}>
      <h1 className={styles.chatOverviewTitle}>Chats</h1>
      {isLoading ? (
        <div className={styles.loading}>Loading chats...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : chats.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageCircle size={48} className={styles.emptyIcon} />
          <p>No chats yet</p>
          <p>Start a conversation with someone from your contacts!</p>
        </div>
      ) : (
        <div className={styles.chatList}>
          {chats.map((chat) => {
            const other = getOtherUser(chat);
            return (
              <div
                key={chat._id}
                className={styles.chatItem}
                onClick={() => navigate(`/chat/${other._id}`)}
              >
                <div className={styles.chatAvatar}>
                  <img
                    src={other.avatar || "/default-avatar.png"}
                    alt={`${other.nickname || other.username}'s avatar`}
                    className={styles.chatAvatarImage}
                  />
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatName}>
                    {other.nickname || other.username}
                  </div>
                  <div className={styles.chatLastMessage}>
                    {chat.lastMessage?.content || "No messages yet"}
                  </div>
                </div>
                <div className={styles.chatTime}>
                  {/* Only show last message time if user is NOT online */}
                  {!other.isOnline &&
                    chat.lastMessage?.createdAt &&
                    formatMessageTime(chat.lastMessage.createdAt)}

                  {/* Show online dot when user is online */}
                  {other.isOnline && (
                    <span className={styles.onlineDot} aria-label="Online" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderIndividualChat = () => (
    <div className={styles.individualChat}>
      <div className={styles.chatHeader}>
        <button className={styles.backButton} onClick={() => navigate("/chat")}>
          <ArrowLeft size={20} />
        </button>
        <div
          className={styles.headerAvatar}
          onClick={() => navigate(`/profile/${otherUser._id}`)}
        >
          <img
            src={otherUser?.avatar || "/default-avatar.png"}
            alt={`${otherUser?.nickname || otherUser?.username}'s avatar`}
            className={styles.headerAvatarImage}
          />
        </div>
        <div
          className={styles.headerInfo}
          onClick={() => navigate(`/profile/${otherUser._id}`)}
        >
          <div className={styles.headerName}>
            {otherUser?.nickname || otherUser?.username}
            {otherUser?.isOnline && (
              <span className={styles.onlineDot} aria-label="Online" />
            )}
          </div>
          <div className={styles.headerUsername}>@{otherUser?.username}</div>
        </div>
      </div>

      <div className={styles.messageList}>
        {isLoading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          messages.map((message) => {
            const isSent = message.sender._id === currentUser._id;
            return (
              <div
                key={message._id}
                className={`${styles.message} ${
                  isSent ? styles.messageSent : styles.messageReceived
                }`}
              >
                <div className={styles.messageAvatar}>
                  <img
                    src={message.sender.avatar || "/default-avatar.png"}
                    alt={`${message.sender.username}'s avatar`}
                    className={styles.messageAvatarImage}
                  />
                </div>
                <div
                  className={`${styles.messageBubble} ${
                    isSent
                      ? styles.messageBubbleSent
                      : styles.messageBubbleReceived
                  }`}
                >
                  {message.content}
                  <div className={styles.messageTime}>
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {typingUsers.size > 0 && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>
              {otherUser?.nickname || otherUser?.username} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.messageInput}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        {userId ? renderIndividualChat() : renderChatOverview()}
      </main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};

export default ChatPage;
