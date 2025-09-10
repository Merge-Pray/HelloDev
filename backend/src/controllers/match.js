import MatchModel from "../models/match.js";
import UserModel from "../models/user.js";
import ContactRequestModel from "../models/contactrequest.js";

export const getUserMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's contacts to filter out existing friends
    const currentUser = await UserModel.findById(userId).select('contacts');
    const userContacts = currentUser.contacts || [];

    const matches = await MatchModel.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ["pending", "contacted"] },
    })
      .populate({
        path: "user1",
        select:
          "username nickname avatar status aboutMe country programmingLanguages techStack techArea languages preferredOS createdAt devExperience",
      })
      .populate({
        path: "user2",
        select:
          "username nickname avatar status aboutMe country programmingLanguages techStack techArea languages preferredOS createdAt devExperience",
      })
      .sort({ compatibilityScore: -1, createdAt: -1 })
      .lean();

    // Filter out matches where users are already contacts (handles edge case)
    const filteredMatches = matches.filter((match) => {
      const otherUserId = match.user1.toString() === userId.toString() ? match.user2 : match.user1;
      return !userContacts.some(contactId => contactId.toString() === otherUserId.toString());
    });

    const formattedMatches = filteredMatches.map((match) => {
      const isCurrentUserUser1 =
        match.user1._id.toString() === userId.toString();
      const otherUser = isCurrentUserUser1 ? match.user2 : match.user1;

      const contactedBy = Array.isArray(match.contactedBy)
        ? match.contactedBy
        : [];

      const hasUserContacted = contactedBy.some(
        (contactId) => contactId.toString() === userId.toString()
      );
      const otherUserIdForContacted = isCurrentUserUser1
        ? match.user2._id
        : match.user1._id;

      const hasOtherContacted = contactedBy.some(
        (contactId) => contactId.toString() === otherUserIdForContacted.toString()
      );

      return {
        matchId: match._id,
        user: {
          _id: otherUser._id,
          username: otherUser.username,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
          status: otherUser.status,
          aboutMe: otherUser.aboutMe,
          country: otherUser.country,
          programmingLanguages: otherUser.programmingLanguages,
          techStack: otherUser.techStack,
          techArea: otherUser.techArea,
          languages: otherUser.languages,
          preferredOS: otherUser.preferredOS,
          devExperience: otherUser.devExperience,
          createdAt: otherUser.createdAt,
        },
        compatibilityScore: match.compatibilityScore || 0,
        scores: {
          technical: match.scores?.technical || 0,
          goalAlignment: match.scores?.goalAlignment || 0,
          personal: match.scores?.personal || 0,
        },
        badges: Array.isArray(match.badges) ? match.badges : [],
        matchType: match.matchType || "networking",
        quality: match.quality || "fair",
        status: match.status,
        hasUserContacted,
        hasOtherContacted,
        canContact: !hasUserContacted,
        createdAt: match.createdAt,
        lastCalculated: match.lastCalculated,
      };
    });

    res.json({
      success: true,
      matches: formattedMatches,
      totalMatches: formattedMatches.length,
    });
  } catch (error) {
    console.error("Error fetching user matches:", error);
    next(error);
  }
};

export const contactMatch = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { matchId } = req.params;

    const match = await MatchModel.findById(matchId);

    const otherUserId = match
      ? match.user1.toString() === userId.toString()
        ? match.user2
        : match.user1
      : null;

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const isUserInMatch =
      match.user1.toString() === userId.toString() ||
      match.user2.toString() === userId.toString();

    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to contact this match",
      });
    }

    if (match.status === "dismissed") {
      return res.status(404).json({
        success: false,
        message: "This match has been dismissed",
      });
    }

    if (match.status === "connected") {
      return res.status(400).json({
        success: false,
        message: "This match is already connected",
      });
    }

    const currentUser = await UserModel.findById(userId).select("contacts");

    if (currentUser.contacts && currentUser.contacts.includes(otherUserId)) {
      match.status = "connected";
      match.connectedAt = new Date();
      match.contactedBy = [match.user1, match.user2];
      await match.save();

      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    const hasUserContacted = match.contactedBy.some(
      (contactId) => contactId.toString() === userId.toString()
    );

    if (hasUserContacted) {
      return res.status(400).json({
        success: false,
        message: "You have already contacted this match",
      });
    }

    match.contactedBy.push(userId);
    if (match.contactedBy.length === 1) {
      match.status = "contacted";
    } else if (match.contactedBy.length === 2) {
      match.status = "connected";
      match.connectedAt = new Date();
      const user1Id = match.user1;
      const user2Id = match.user2;
      await UserModel.findByIdAndUpdate(
        user1Id,
        { $addToSet: { contacts: user2Id } },
        { new: true }
      );
      await UserModel.findByIdAndUpdate(
        user2Id,
        { $addToSet: { contacts: user1Id } },
        { new: true }
      );

      const user1 = await UserModel.findById(user1Id).select(
        "nickname username"
      );
      const user2 = await UserModel.findById(user2Id).select(
        "nickname username"
      );

      await ContactRequestModel.insertMany([
        {
          user1: user1Id,
          user2: user2Id,
          type: "match_found",
          message: `You and ${
            user1.nickname || user1.username
          } are now connected through matching!`,
          relatedData: { matchId: match._id },
        },
        {
          user1: user2Id,
          user2: user1Id,
          type: "match_found",
          message: `You and ${
            user2.nickname || user2.username
          } are now connected through matching!`,
          relatedData: { matchId: match._id },
        },
      ]);

      const io = req.app.get("socketio");
      if (io) {
        const user1Notification = await ContactRequestModel.findOne({
          user1: user1Id,
          user2: user2Id,
          type: "match_found",
        }).populate("user1", "username nickname avatar");

        const user2Notification = await ContactRequestModel.findOne({
          user1: user2Id,
          user2: user1Id,
          type: "match_found",
        }).populate("user1", "username nickname avatar");

        io.to(`user:${user2Id}`).emit("newNotification", {
          notification: user1Notification,
          type: "match_found",
        });

        io.to(`user:${user1Id}`).emit("newNotification", {
          notification: user2Notification,
          type: "match_found",
        });

        const user1UnreadCount = await ContactRequestModel.countDocuments({
          user2: user1Id,
          isRead: false,
        });
        const user2UnreadCount = await ContactRequestModel.countDocuments({
          user2: user2Id,
          isRead: false,
        });

        io.to(`user:${user1Id}`).emit(
          "notificationCountUpdate",
          user1UnreadCount
        );
        io.to(`user:${user2Id}`).emit(
          "notificationCountUpdate",
          user2UnreadCount
        );
      }
    }
    await match.save();

    const isCurrentUserUser1 = match.user1.toString() === userId.toString();
    const otherUser = await UserModel.findById(otherUserId).select(
      "username nickname"
    );

    res.json({
      success: true,
      message:
        match.status === "connected"
          ? `You and ${otherUser.nickname} are now connected! You can now see each other's posts and interact.`
          : `Contact request sent to ${otherUser.nickname}`,
      match: {
        matchId: match._id,
        status: match.status,
        contactedBy: match.contactedBy,
        connectedAt: match.connectedAt,
      },
      ...(match.status === "connected" && {
        contactsUpdated: true,
        message: `You and ${otherUser.nickname} are now contacts! You can see each other's posts in your feed.`,
      }),
    });
  } catch (error) {
    console.error("Error contacting match:", error);
    next(error);
  }
};

export const dismissMatch = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { matchId } = req.params;

    const match = await MatchModel.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const isUserInMatch =
      match.user1.toString() === userId.toString() ||
      match.user2.toString() === userId.toString();

    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to dismiss this match",
      });
    }

    if (match.status === "dismissed") {
      return res.status(400).json({
        success: false,
        message: "This match has already been dismissed",
      });
    }

    if (match.status === "connected") {
      return res.status(400).json({
        success: false,
        message: "Cannot dismiss a connected match",
      });
    }

    match.status = "dismissed";
    match.dismissedBy = userId;

    await match.save();

    res.json({
      success: true,
      message: "Match dismissed successfully",
    });
  } catch (error) {
    console.error("Error dismissing match:", error);
    next(error);
  }
};
