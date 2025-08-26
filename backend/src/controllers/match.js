import MatchModel from "../models/match.js";
import UserModel from "../models/user.js";

export const getUserMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;

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

    const formattedMatches = matches.map((match) => {
      const isCurrentUserUser1 =
        match.user1._id.toString() === userId.toString();
      const otherUser = isCurrentUserUser1 ? match.user2 : match.user1;

      // FIX: Ensure contactedBy is always an array
      const contactedBy = Array.isArray(match.contactedBy)
        ? match.contactedBy
        : [];

      const hasUserContacted = contactedBy.some(
        (contactId) => contactId.toString() === userId.toString()
      );
      const hasOtherContacted = contactedBy.some(
        (contactId) => contactId.toString() !== userId.toString()
      );

      return {
        matchId: match._id,
        user: {
          id: otherUser._id,
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
    }
    await match.save();

    const isCurrentUserUser1 = match.user1.toString() === userId.toString();
    const otherUserId = isCurrentUserUser1 ? match.user2 : match.user1;
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
