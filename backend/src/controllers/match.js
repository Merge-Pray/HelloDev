import MatchModel from "../models/match.js";
import UserModel from "../models/user.js";

export const getUserMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    
    const matches = await MatchModel.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: "pending", 
    })
      .populate({
        path: "user1",
        select:
          "username nickname avatar aboutMe country city techArea programmingLanguages devExperience status isOnline lastSeen",
      })
      .populate({
        path: "user2",
        select:
          "username nickname avatar aboutMe country city techArea programmingLanguages devExperience status isOnline lastSeen",
      })
      .sort({ compatibilityScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    
    const formattedMatches = matches.map((match) => {
      const isCurrentUserUser1 =
        match.user1._id.toString() === userId.toString();
      const otherUser = isCurrentUserUser1 ? match.user2 : match.user1;

      return {
        matchId: match._id,
        user: {
          id: otherUser._id,
          username: otherUser.username,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
          aboutMe: otherUser.aboutMe,
          country: otherUser.country,
          city: otherUser.city,
          techArea: otherUser.techArea,
          programmingLanguages: otherUser.programmingLanguages,
          devExperience: otherUser.devExperience,
          status: otherUser.status,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen,
        },
        compatibilityScore: match.compatibilityScore,
        scores: {
          technical: match.scores?.technical || 0,
          goalAlignment: match.scores?.goalAlignment || 0,
          personal: match.scores?.personal || 0,
        },
        badges: match.badges || [],
        matchType: match.matchType,
        quality: match.quality,
        createdAt: match.createdAt,
        lastCalculated: match.lastCalculated,
      };
    });

    const totalMatches = await MatchModel.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      status: "pending",
    });

    res.json({
      success: true,
      matches: formattedMatches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMatches / limit),
        hasNextPage: formattedMatches.length === parseInt(limit),
        totalMatches,
      },
    });
  } catch (error) {
    console.error("Error fetching user matches:", error);
    next(error);
  }
};
