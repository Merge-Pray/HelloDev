import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, MessageCircle, Smile, UserPlus, AlertCircle } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import Sidebar from "../components/Sidebar/Sidebar";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { format } from "date-fns";
import styles from "./chatpage.module.css";
import { useUnreadCount } from "../hooks/useUnreadCount";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const socket = useUserStore((state) => state.socket);
  const { refreshUnreadCount } = useUnreadCount();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [areFriends, setAreFriends] = useState(true);
  const [friendshipError, setFriendshipError] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentChatRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);

  const loadIndividualChatRef = useRef(false);

  useEffect(() => {
    if (userId && !loadIndividualChatRef.current) {
      loadIndividualChatRef.current = true;
      loadIndividualChat().finally(() => {
        loadIndividualChatRef.current = false;
      });
    } else if (!userId) {
      loadChatOverview();
    }
  }, [userId]);

  useEffect(() => {
    if (currentChat && socket) {
      socket.emit("joinChat", { chatId: currentChat._id });
      
      return () => {
        socket.emit("leaveChat", { chatId: currentChat._id });
      };
    }
  }, [currentChat, socket]);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const handleReceiveMessage = useCallback(
    (message) => {
      setMessages((prev) => {
        const shouldAdd =
          currentChatRef.current && message.chat === currentChatRef.current._id;

        if (shouldAdd) {
          const messageExists = prev.some((msg) => msg._id === message._id);
          if (messageExists) {
            return prev;
          }

          if (message.recipient === currentUser._id) {
            socket?.emit("markAsRead", { chatId: currentChatRef.current._id });
          }
          
          return [...prev, message];
        }
        return prev;
      });
    },
    [socket, currentUser]
  );
  useEffect(() => {
    if (currentChat) {
      socket?.emit("markAsRead", { chatId: currentChat._id });
    }
  }, [currentChat, socket]);

  const handleUserTyping = useCallback((data) => {
    const { userId: typingUserId, isTyping, chatId } = data;

    // Don't show typing indicator for current user
    if (typingUserId === currentUser._id.toString()) {
      return;
    }

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
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userId && messages.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [userId, messages.length, isLoading]);

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

        if (messagesResponse) {
          if (messagesResponse.messages && Array.isArray(messagesResponse.messages)) {
            setMessages(messagesResponse.messages);
            setAreFriends(messagesResponse.areFriends);
            setTimeout(() => scrollToBottom(), 100);
          } else if (Array.isArray(messagesResponse)) {
            setMessages(messagesResponse);
            setAreFriends(true);
            setTimeout(() => scrollToBottom(), 100);
          } else {
            setMessages([]);
            setAreFriends(true);
          }
        } else {
          setMessages([]);
          setAreFriends(true);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = messageInputRef.current;

    if (!textarea) {
      setNewMessage((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText =
      currentText.slice(0, start) + emoji + currentText.slice(end);
    const newCursorPos = start + emoji.length;

    setNewMessage(newText);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
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
            const hasUnreadMessages = chat.unreadCount > 0;

            return (
              <div
                key={chat._id}
                className={`${styles.chatItem} ${
                  hasUnreadMessages ? styles.chatItemUnread : ""
                }`}
                onClick={() => navigate(`/chat/${other._id}`)}
              >
                <div className={styles.chatAvatar}>
                  <img
                    src={other.avatar || "/avatars/default_avatar.png"}
                    alt={`${other.nickname || other.username}'s avatar`}
                    className={styles.chatAvatarImage}
                    onError={(e) => {
                      e.target.src = "/avatars/default_avatar.png";
                    }}
                  />
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatName}>
                    {other.nickname || other.username}
                    {hasUnreadMessages && <span className={styles.unreadDot} />}
                  </div>
                  <div
                    className={`${styles.chatLastMessage} ${
                      hasUnreadMessages ? styles.chatLastMessageUnread : ""
                    }`}
                  >
                    {chat.lastMessage?.content || "No messages yet"}
                  </div>
                </div>
                <div className={styles.chatTime}>
                  {hasUnreadMessages && (
                    <span className={styles.unreadCount}>
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </span>
                  )}
                  {!hasUnreadMessages &&
                    !other.isOnline &&
                    chat.lastMessage?.createdAt &&
                    formatMessageTime(chat.lastMessage.createdAt)}
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
            src={otherUser?.avatar || "/avatars/default_avatar.png"}
            alt={`${otherUser?.nickname || otherUser?.username}'s avatar`}
            className={styles.headerAvatarImage}
            onError={(e) => {
              e.target.src = "/avatars/default_avatar.png";
            }}
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
        {/* Friendship Status Banner */}
        {!areFriends && otherUser && (
          <div className={styles.friendshipBanner}>
            <div className={styles.bannerContent}>
              <AlertCircle size={20} />
              <span>You are no longer friends with {otherUser.nickname || otherUser.username}</span>
              <button 
                className={styles.addFriendBtn}
                onClick={handleSendFriendRequest}
              >
                <UserPlus size={16} />
                Add Friend
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {friendshipError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{friendshipError}</span>
          </div>
        )}

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
                    src={message.sender.avatar || "/avatars/default_avatar.png"}
                    alt={`${message.sender.username}'s avatar`}
                    className={styles.messageAvatarImage}
                    onError={(e) => {
                      e.target.src = "/avatars/default_avatar.png";
                    }}
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

        <div ref={messagesEndRef} />
      </div>

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

      <div className={styles.messageInput}>
        <div className={styles.inputContainer}>
          <div className={styles.emojiContainer} ref={emojiPickerRef}>
            <button
              type="button"
              className={`${styles.toolBtn} ${
                showEmojiPicker ? styles.active : ""
              }`}
              onClick={toggleEmojiPicker}
            >
              <Smile size={20} />
            </button>
            <div
              className={styles.emojiPicker}
              style={{ display: showEmojiPicker ? "block" : "none" }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                previewConfig={{
                  showPreview: false,
                }}
                skinTonesDisabled
                searchDisabled={false}
                lazyLoadEmojis={true}
                categoriesConfig={[
                  {
                    category: "suggested",
                    name: "Recently Used",
                  },
                  {
                    category: "smileys_people",
                    name: "Smileys & People",
                  },
                  {
                    category: "animals_nature",
                    name: "Animals & Nature",
                  },
                  {
                    category: "food_drink",
                    name: "Food & Drink",
                  },
                ]}
                emojiStyle="native"
              />
            </div>
          </div>
          <textarea
            ref={messageInputRef}
            className={styles.textInput}
            placeholder={areFriends ? "Type a message..." : "Add as friend to send messages"}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={!areFriends}
          />
          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !areFriends}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const handleMessageError = (data) => {
    if (data.type === "not_friends") {
      setAreFriends(false);
      setFriendshipError(data.error);
      setTimeout(() => setFriendshipError(null), 5000);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await authenticatedFetch("/api/contactrequest/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: otherUser._id,
        }),
      });

      if (response.success) {
        setFriendshipError("Friend request sent successfully!");
        setTimeout(() => setFriendshipError(null), 3000);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      setFriendshipError("Failed to send friend request");
      setTimeout(() => setFriendshipError(null), 3000);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("userTyping", handleUserTyping);
      socket.on("messageError", handleMessageError);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("userTyping", handleUserTyping);
        socket.off("messageError", handleMessageError);
      };
    }
  }, [socket, currentChat, refreshUnreadCount]);

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
