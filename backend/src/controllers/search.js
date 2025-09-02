import UserModel from "../models/user.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q: query, limit = 20, offset = 0 } = req.query;
    const requestingUserId = req.user._id;

    // Build basic criteria
    const basicCriteria = {
      _id: { $ne: requestingUserId },
      isMatchable: true,
    };

    let users = [];
    let totalCount = 0;

    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();

      // Get all matchable users
      const allUsers = await UserModel.find(basicCriteria)
        .select(
          `
          username nickname avatar status aboutMe country city age
          devExperience programmingLanguages techStack techArea
          languages preferredOS createdAt isOnline lastSeen contacts
        `
        )
        .lean();

      const filteredUsers = allUsers.filter((user) => {
        const textFields = [
          user.username,
          user.nickname,
          user.aboutMe,
          user.city,
          user.country,
          user.devExperience,
          user.preferredOS,
        ];

        if (
          textFields.some(
            (field) => field && field.toLowerCase().includes(searchTerm)
          )
        ) {
          return true;
        }

        const arrayFields = [
          user.techStack || [],
          user.techArea || [],
          user.otherInterests || [],
          user.languages || [],
        ];

        if (
          arrayFields.some((arr) =>
            arr.some((item) => item && item.toLowerCase().includes(searchTerm))
          )
        ) {
          return true;
        }

        if (
          user.programmingLanguages &&
          Array.isArray(user.programmingLanguages)
        ) {
          const hasMatchingLanguage = user.programmingLanguages.some(
            (langArray) => {
              if (Array.isArray(langArray) && langArray.length >= 1) {
                const languageName = langArray[0].toLowerCase();
                return languageName.includes(searchTerm);
              }
              return false;
            }
          );
          if (hasMatchingLanguage) return true;
        }

        const statusMappings = {
          searchhelp: ["seeking help", "help", "search help"],
          offerhelp: ["offering help", "offer help"],
          networking: ["networking", "network"],
          learnpartner: ["learning partner", "learn partner", "partner"],
        };

        if (user.status) {
          if (user.status.toLowerCase().includes(searchTerm)) {
            return true;
          }

          const mappings = statusMappings[user.status] || [];
          if (mappings.some((mapping) => mapping.includes(searchTerm))) {
            return true;
          }
        }

        return false;
      });

      totalCount = filteredUsers.length;

      filteredUsers.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
        if (a.lastSeen && b.lastSeen)
          return new Date(b.lastSeen) - new Date(a.lastSeen);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      users = filteredUsers.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );
    } else {
      users = [];
      totalCount = 0;
    }

    // Get current user's contacts
    const currentUser = await UserModel.findById(requestingUserId)
      .select("contacts")
      .lean();
    const currentUserContacts = currentUser?.contacts || [];

    // Add isContact field to each user
    const usersWithContactStatus = users.map((user) => {
      const isContact = currentUserContacts.some(
        (contactId) => contactId.toString() === user._id.toString()
      );

      return {
        ...user,
        isContact,
        contacts: undefined,
      };
    });

    return res.status(200).json({
      success: true,
      users: usersWithContactStatus,
      totalCount,
      hasMore: parseInt(offset) + users.length < totalCount,
      query: query || null,
    });
  } catch (error) {
    console.error("Search error:", error);
    return next(error);
  }
};
