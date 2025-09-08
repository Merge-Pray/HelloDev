import ContactRequestModel from "../models/contactrequest.js";
import UserModel from "../models/user.js";

export const sendFriendRequest = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId } = req.body;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    // Prüfen ob Empfänger existiert
    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prüfen ob bereits Kontakte
    const sender = await UserModel.findById(senderId);
    if (sender.contacts.includes(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    // Prüfen ob bereits eine Anfrage existiert (in beide Richtungen)
    const existingRequest = await ContactRequestModel.findOne({
      $or: [
        { user1: senderId, user2: recipientId, type: "friend_request" },
        { user1: recipientId, user2: senderId, type: "friend_request" },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "dismissed") {
        return res.status(400).json({
          success: false,
          message: "Friend request was previously dismissed",
        });
      }
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Friend request already exists",
        });
      }
    }

    // Neue Freundschaftsanfrage erstellen
    const contactRequest = new ContactRequestModel({
      user1: senderId,
      user2: recipientId,
      type: "friend_request",
      message: `${
        sender.nickname || sender.username
      } sent you a friend request`,
      status: "contacted",
      contactedBy: [senderId],
    });

    await contactRequest.save();

    // Socket.IO Benachrichtigung senden
    const io = req.app.get("socketio");
    if (io) {
      io.to(`user:${recipientId}`).emit("newNotification", {
        notification: await contactRequest.populate(
          "user1",
          "username nickname avatar"
        ),
        type: "friend_request",
      });
    }

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      contactRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const contactRequest = await ContactRequestModel.findById(requestId)
      .populate("user1", "username nickname")
      .populate("user2", "username nickname");

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Prüfen ob User berechtigt ist (muss user2 sein)
    if (contactRequest.user2._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this request",
      });
    }

    if (
      contactRequest.status !== "pending" ||
      contactRequest.type !== "friend_request"
    ) {
      return res.status(400).json({
        success: false,
        message: "Friend request is not pending",
      });
    }

    // Status aktualisieren
    contactRequest.status = "connected";
    contactRequest.connectedAt = new Date();
    await contactRequest.save();

    // Beide User als Kontakte hinzufügen
    await UserModel.findByIdAndUpdate(contactRequest.user1._id, {
      $addToSet: { contacts: contactRequest.user2._id },
    });
    await UserModel.findByIdAndUpdate(contactRequest.user2._id, {
      $addToSet: { contacts: contactRequest.user1._id },
    });

    // Benachrichtigung für Sender erstellen
    const acceptNotification = new ContactRequestModel({
      user1: userId,
      user2: contactRequest.user1._id,
      type: "friend_request_accepted",
      message: `${
        contactRequest.user2.nickname || contactRequest.user2.username
      } accepted your friend request`,
      status: "contacted",
    });

    await acceptNotification.save();

    // Socket.IO Benachrichtigung senden
    const io = req.app.get("socketio");
    if (io) {
      io.to(`user:${contactRequest.user1._id}`).emit("newNotification", {
        notification: await acceptNotification.populate(
          "user1",
          "username nickname avatar"
        ),
        type: "friend_request_accepted",
      });
    }

    res.json({
      success: true,
      message: "Friend request accepted",
      contactRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const declineFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const contactRequest = await ContactRequestModel.findById(requestId)
      .populate("user1", "username nickname")
      .populate("user2", "username nickname");

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Prüfen ob User berechtigt ist (muss user2 sein)
    if (contactRequest.user2._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to decline this request",
      });
    }

    if (
      contactRequest.status !== "pending" ||
      contactRequest.type !== "friend_request"
    ) {
      return res.status(400).json({
        success: false,
        message: "Friend request is not pending",
      });
    }

    // Status aktualisieren
    contactRequest.status = "dismissed";
    contactRequest.dismissedBy = userId;
    await contactRequest.save();

    // Optional: Benachrichtigung für Sender erstellen
    const declineNotification = new ContactRequestModel({
      user1: userId,
      user2: contactRequest.user1._id,
      type: "friend_request_declined",
      message: `${
        contactRequest.user2.nickname || contactRequest.user2.username
      } declined your friend request`,
      status: "pending",
    });

    await declineNotification.save();

    res.json({
      success: true,
      message: "Friend request declined",
      contactRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Eingehende Freundschaftsanfragen
    const incomingRequests = await ContactRequestModel.find({
      user2: userId,
      type: "friend_request",
      status: "pending",
    }).populate("user1", "username nickname avatar");

    // Ausgehende Freundschaftsanfragen
    const outgoingRequests = await ContactRequestModel.find({
      user1: userId,
      type: "friend_request",
      status: "pending",
    }).populate("user2", "username nickname avatar");

    res.json({
      success: true,
      incomingRequests,
      outgoingRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (page - 1) * limit;
    const filter = { user2: userId };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await ContactRequestModel.find(filter)
      .populate("user1", "username nickname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await ContactRequestModel.countDocuments(filter);
    const unreadCount = await ContactRequestModel.countDocuments({
      user2: userId,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    await ContactRequestModel.updateMany(
      {
        _id: { $in: notificationIds },
        user2: userId,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await ContactRequestModel.updateMany(
      { user2: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    if (userId.toString() === friendId) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself as a friend",
      });
    }

    // Prüfen ob Friend existiert
    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prüfen ob sie überhaupt Freunde sind
    const user = await UserModel.findById(userId);
    if (!user.contacts.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: "You are not friends with this user",
      });
    }

    // Beide User aus den Kontakten entfernen
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { contacts: friendId },
    });
    await UserModel.findByIdAndUpdate(friendId, {
      $pull: { contacts: userId },
    });

    // Original Contact Request auf "dismissed" setzen
    await ContactRequestModel.findOneAndUpdate(
      {
        $or: [
          { user1: userId, user2: friendId, type: "friend_request" },
          { user1: friendId, user2: userId, type: "friend_request" },
        ],
        status: "connected",
      },
      {
        status: "dismissed",
        dismissedBy: userId,
      }
    );

    // Optional: Benachrichtigung für den anderen User erstellen
    const removeNotification = new ContactRequestModel({
      user1: userId,
      user2: friendId,
      type: "friend_removed",
      message: `${
        user.nickname || user.username
      } removed you from their contacts`,
      status: "contacted",
    });

    await removeNotification.save();

    // Socket.IO Benachrichtigung senden
    const io = req.app.get("socketio");
    if (io) {
      io.to(`user:${friendId}`).emit("newNotification", {
        notification: await removeNotification.populate(
          "user1",
          "username nickname avatar"
        ),
        type: "friend_removed",
      });

      // Auch über Entfernung informieren (für Live-Updates der Kontaktliste)
      io.to(`user:${friendId}`).emit("friendRemoved", {
        removedBy: userId,
        removedUser: friendId,
      });
    }

    res.json({
      success: true,
      message: "Friend removed successfully",
      removedFriend: {
        _id: friendId,
        username: friend.username,
        nickname: friend.nickname,
      },
    });
  } catch (error) {
    next(error);
  }
};
