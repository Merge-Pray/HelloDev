import UserModel from "../models/user.js";

export const searchUsers = async (req, res, next) => {
  try {
    const {
      q: query,
      city,
      friendshipFilter,
      limit = 20,
      offset = 0,
    } = req.query;
    const requestingUserId = req.user._id;

    const basicCriteria = {
      _id: { $ne: requestingUserId },
    };

    if (city && city.trim()) {
      basicCriteria.city = { $regex: new RegExp(`^${city.trim()}$`, "i") };
    }

    let users = [];
    let totalCount = 0;

    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();

      const allUsers = await UserModel.find(basicCriteria)
        .select(
          `username nickname avatar status aboutMe country city age
          devExperience programmingLanguages techStack techArea
          languages preferredOS createdAt isOnline lastSeen contacts`
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

        if (user.status) {
          const statusMappings = {
            searchhelp: ["seeking help", "search help", "help", "searchhelp"],
            offerhelp: ["offering help", "offer help", "offerhelp"],
            networking: ["networking", "network"],
            learnpartner: [
              "learning partner",
              "learn partner",
              "partner",
              "learnpartner",
              "learning",
              "study partner",
            ],
          };

          const userStatus = user.status.toLowerCase();

          if (userStatus.includes(searchTerm)) {
            return true;
          }

          for (const [statusKey, keywords] of Object.entries(statusMappings)) {
            if (userStatus === statusKey || userStatus.includes(statusKey)) {
              if (
                keywords.some(
                  (keyword) =>
                    keyword.toLowerCase().includes(searchTerm) ||
                    searchTerm.includes(keyword.toLowerCase())
                )
              ) {
                return true;
              }
            }
          }

          for (const [statusKey, keywords] of Object.entries(statusMappings)) {
            if (
              keywords.some((keyword) => keyword.toLowerCase() === searchTerm)
            ) {
              if (userStatus === statusKey || userStatus.includes(statusKey)) {
                return true;
              }
            }
          }
        }

        const arrayFields = [
          user.programmingLanguages,
          user.techStack,
          user.techArea,
          user.languages,
        ];

        return arrayFields.some(
          (array) =>
            Array.isArray(array) &&
            array.some((item) =>
              String(item).toLowerCase().includes(searchTerm)
            )
        );
      });

      totalCount = filteredUsers.length;

      filteredUsers.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
        if (a.lastSeen && b.lastSeen) {
          return new Date(b.lastSeen) - new Date(a.lastSeen);
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      users = filteredUsers.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );
    } else if (city && city.trim()) {
      const cityUsers = await UserModel.find(basicCriteria)
        .select(
          `username nickname avatar status aboutMe country city age
          devExperience programmingLanguages techStack techArea
          languages preferredOS createdAt isOnline lastSeen contacts`
        )
        .sort({ isOnline: -1, lastSeen: -1, createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean();

      users = cityUsers;
      totalCount = await UserModel.countDocuments(basicCriteria);
    } else {
      users = [];
      totalCount = 0;
    }

    const currentUser = await UserModel.findById(requestingUserId)
      .select("contacts")
      .lean();
    const currentUserContacts = currentUser?.contacts || [];

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

    let finalUsers = usersWithContactStatus;
    if (friendshipFilter === "friends") {
      finalUsers = usersWithContactStatus.filter((user) => user.isContact);
    } else if (friendshipFilter === "non-friends") {
      finalUsers = usersWithContactStatus.filter((user) => !user.isContact);
    }

    return res.status(200).json({
      success: true,
      users: finalUsers,
      totalCount: finalUsers.length,
      hasMore: parseInt(offset) + finalUsers.length < totalCount,
      query: query || null,
      city: city || null,
      friendshipFilter: friendshipFilter || null,
    });
  } catch (error) {
    console.error("Search error:", error);
    return next(error);
  }
};

export const getCities = async (req, res, next) => {
  try {
    const { q: query, limit = 20 } = req.query;
    const requestingUserId = req.user._id;

    const pipeline = [
      {
        $match: {
          _id: { $ne: requestingUserId },
          city: { $exists: true, $ne: "", $ne: null },
        },
      },
      {
        $group: {
          _id: "$city",
          userCount: { $sum: 1 },
          countries: { $addToSet: "$country" },
        },
      },
      {
        $project: {
          _id: 0,
          city: "$_id",
          userCount: 1,
          countries: 1,
        },
      },
    ];

    if (query && query.trim()) {
      const searchTerm = query.trim();
      pipeline.unshift({
        $match: {
          city: { $regex: searchTerm, $options: "i" },
        },
      });
    }

    pipeline.push(
      { $sort: { userCount: -1, city: 1 } },
      { $limit: parseInt(limit) }
    );

    const cities = await UserModel.aggregate(pipeline);

    const formattedCities = cities.map((item) => ({
      city: item.city,
      userCount: item.userCount,
      countries: item.countries.filter(
        (country) => country && country.trim() !== ""
      ),
    }));

    return res.status(200).json({
      success: true,
      cities: formattedCities,
      totalFound: formattedCities.length,
      query: query || null,
    });
  } catch (error) {
    console.error("Cities search error:", error);
    return next(error);
  }
};
