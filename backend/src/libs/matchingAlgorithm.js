import UserModel from "../models/user.js";
import MatchModel from "../models/match.js";

export function calculateProgrammingLanguageScore(user1, user2) {
  if (
    !user1.programmingLanguages?.length ||
    !user2.programmingLanguages?.length
  ) {
    return 0;
  }

  const user1Languages = new Map(
    user1.programmingLanguages.map((lang) => [
      lang.language.toLowerCase(),
      lang.skillLevel,
    ])
  );
  const user2Languages = new Map(
    user2.programmingLanguages.map((lang) => [
      lang.language.toLowerCase(),
      lang.skillLevel,
    ])
  );

  let commonLanguages = 0;
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const [lang, skill1] of user1Languages) {
    if (user2Languages.has(lang)) {
      commonLanguages++;
      const skill2 = user2Languages.get(lang);

      const skillDifference = Math.abs(skill1 - skill2);
      const languageScore = Math.max(0, 10 - skillDifference);
      totalScore += languageScore;
    }
    maxPossibleScore += 10;
  }

  if (maxPossibleScore === 0) return 0;

  const commonLanguageBonus =
    (commonLanguages / Math.max(user1Languages.size, user2Languages.size)) * 20;

  return Math.min(
    100,
    (totalScore / maxPossibleScore) * 80 + commonLanguageBonus
  );
}

export function calculateTechStackScore(user1, user2) {
  if (!user1.techStack?.length || !user2.techStack?.length) {
    return 0;
  }

  const user1Stack = new Set(user1.techStack.map((tech) => tech.toLowerCase()));
  const user2Stack = new Set(user2.techStack.map((tech) => tech.toLowerCase()));

  const intersection = new Set(
    [...user1Stack].filter((tech) => user2Stack.has(tech))
  );
  const union = new Set([...user1Stack, ...user2Stack]);

  return (intersection.size / union.size) * 100;
}

export function calculateTechAreaScore(user1, user2) {
  if (!user1.techArea?.length || !user2.techArea?.length) {
    return 0;
  }

  const user1Areas = new Set(user1.techArea.map((area) => area.toLowerCase()));
  const user2Areas = new Set(user2.techArea.map((area) => area.toLowerCase()));

  const intersection = new Set(
    [...user1Areas].filter((area) => user2Areas.has(area))
  );
  const union = new Set([...user1Areas, ...user2Areas]);

  return (intersection.size / union.size) * 100;
}

export function calculateExperienceLevelScore(user1, user2) {
  const experienceLevels = { beginner: 1, intermediate: 2, expert: 3 };

  const level1 = experienceLevels[user1.devExperience] || 1;
  const level2 = experienceLevels[user2.devExperience] || 1;

  const isHelpRelationship =
    (user1.status === "searchhelp" && user2.status === "offerhelp") ||
    (user1.status === "offerhelp" && user2.status === "searchhelp");

  if (isHelpRelationship) {
    const helper = user1.status === "offerhelp" ? user1 : user2;
    const helpSeeker = user1.status === "searchhelp" ? user1 : user2;

    const helperLevel = experienceLevels[helper.devExperience] || 1;
    const seekerLevel = experienceLevels[helpSeeker.devExperience] || 1;
    const levelGap = helperLevel - seekerLevel;

    if (levelGap >= 2) return 100;
    if (levelGap === 1) return 85;
    if (levelGap === 0) return 30;
    if (levelGap === -1) return 15;
    return 5;
  } else {
    const difference = Math.abs(level1 - level2);

    if (difference === 0) return 100;
    if (difference === 1) return 70;
    return 30;
  }
}

export function calculateStatusAlignment(user1, user2) {
  const status1 = user1.status;
  const status2 = user2.status;

  if (status1 === "searchhelp" && status2 === "offerhelp") return 100;
  if (status1 === "offerhelp" && status2 === "searchhelp") return 100;
  if (status1 === "learnpartner" && status2 === "learnpartner") return 100;

  if (status1 === "networking" || status2 === "networking") return 70;
  if (status1 === status2) return 80;

  return 40;
}

export function calculateLocationProximity(user1, user2) {
  if (!user1.country || !user2.country) return 0;

  if (
    user1.city &&
    user2.city &&
    user1.city.toLowerCase() === user2.city.toLowerCase() &&
    user1.country.toLowerCase() === user2.country.toLowerCase()
  ) {
    return 100;
  }

  if (user1.country.toLowerCase() === user2.country.toLowerCase()) {
    return 70;
  }

  return 20;
}

export function calculateCodingTimeCompatibility(user1, user2) {
  if (!user1.favoriteTimeToCode || !user2.favoriteTimeToCode) return 0;

  const timePreference1 = user1.favoriteTimeToCode;
  const timePreference2 = user2.favoriteTimeToCode;

  if (timePreference1 === timePreference2) {
    return 100;
  }

  const compatibleCombos = [
    ["earlybird", "daytime"],
    ["daytime", "nightowl"],
  ];

  const isCompatible = compatibleCombos.some(
    (combo) =>
      combo.includes(timePreference1) && combo.includes(timePreference2)
  );

  return isCompatible ? 60 : 20;
}

export function calculatePersonalInterestsScore(user1, user2) {
  if (!user1.otherInterests?.length || !user2.otherInterests?.length) {
    return 0;
  }

  const interests1 = new Set(
    user1.otherInterests.map((interest) => interest.toLowerCase())
  );
  const interests2 = new Set(
    user2.otherInterests.map((interest) => interest.toLowerCase())
  );

  const intersection = new Set(
    [...interests1].filter((interest) => interests2.has(interest))
  );
  const union = new Set([...interests1, ...interests2]);

  return (intersection.size / union.size) * 100;
}

export function calculateGamingCompatibility(user1, user2) {
  if (
    !user1.gaming ||
    !user2.gaming ||
    user1.gaming === "none" ||
    user2.gaming === "none"
  ) {
    return 0;
  }

  // Exact match gives highest score
  if (user1.gaming === user2.gaming) {
    return 100;
  }

  // Similar gaming types get partial scores
  const gamingCompatibility = {
    pc: ["console"], // PC and console gamers might get along
    console: ["pc"],
    mobile: ["board"], // Mobile and board games are more casual
    board: ["mobile"],
  };

  if (gamingCompatibility[user1.gaming]?.includes(user2.gaming)) {
    return 60;
  }

  return 30; // Different gaming preferences but both game
}

export function calculatePersonalityMatch(user1, user2) {
  let score = 0;
  let factors = 0;

  if (user1.musicGenreWhileCoding && user2.musicGenreWhileCoding) {
    factors++;
    if (
      user1.musicGenreWhileCoding.toLowerCase() ===
      user2.musicGenreWhileCoding.toLowerCase()
    ) {
      score += 100;
    } else {
      score += 30;
    }
  }

  if (user1.favoriteDrinkWhileCoding && user2.favoriteDrinkWhileCoding) {
    factors++;
    if (
      user1.favoriteDrinkWhileCoding.toLowerCase() ===
      user2.favoriteDrinkWhileCoding.toLowerCase()
    ) {
      score += 100;
    } else {
      score += 30;
    }
  }

  if (user1.preferredOS && user2.preferredOS) {
    factors++;
    if (user1.preferredOS === user2.preferredOS) {
      score += 100;
    } else {
      score += 20;
    }
  }

  return factors > 0 ? score / factors : 0;
}

export function determineMatchType(user1, user2, scores) {
  const experienceLevels = { beginner: 1, intermediate: 2, expert: 3 };
  const level1 = experienceLevels[user1.devExperience] || 1;
  const level2 = experienceLevels[user2.devExperience] || 1;

  if (Math.abs(level1 - level2) >= 2) {
    return "mentor-mentee";
  }

  if (user1.status === "learnpartner" && user2.status === "learnpartner") {
    return "project-partner";
  }

  if (scores.locationProximity >= 70) {
    return "local-buddy";
  }

  if (level1 === level2 && scores.programmingLanguages >= 60) {
    return "peer-learning";
  }

  if (scores.statusAlignment >= 90) {
    return "complementary-skills";
  }

  return "networking";
}

export function generateMatchBadges(user1, user2, scores) {
  const badges = [];

  // noob-connection: Both beginners in all languages
  if (
    user1.programmingLanguages?.length >= 1 &&
    user2.programmingLanguages?.length >= 1
  ) {
    const user1AllBeginner = user1.programmingLanguages.every(
      (lang) => lang.skillLevel <= 3
    );
    const user2AllBeginner = user2.programmingLanguages.every(
      (lang) => lang.skillLevel <= 3
    );

    if (user1AllBeginner && user2AllBeginner) {
      badges.push("noob-connection");
    }
  }

  // syntax-masters: Both experts (9-10) in all languages
  if (
    user1.programmingLanguages?.length >= 1 &&
    user2.programmingLanguages?.length >= 1
  ) {
    const user1AllExpert = user1.programmingLanguages.every(
      (lang) => lang.skillLevel >= 9
    );
    const user2AllExpert = user2.programmingLanguages.every(
      (lang) => lang.skillLevel >= 9
    );

    if (user1AllExpert && user2AllExpert) {
      badges.push("syntax-masters");
    }
  }

  // night-owls: Both nightowl coders
  if (
    user1.favoriteTimeToCode === "nightowl" &&
    user2.favoriteTimeToCode === "nightowl"
  ) {
    badges.push("night-owls");
  }

  // early-birds: Both earlybird coders
  if (
    user1.favoriteTimeToCode === "earlybird" &&
    user2.favoriteTimeToCode === "earlybird"
  ) {
    badges.push("early-birds");
  }

  // local-legends: Same city
  if (
    user1.city &&
    user2.city &&
    user1.city.toLowerCase() === user2.city.toLowerCase() &&
    user1.country &&
    user2.country &&
    user1.country.toLowerCase() === user2.country.toLowerCase()
  ) {
    badges.push("local-legends");
  }

  // caffeine-addicts: Both love coffee
  if (user1.favoriteDrinkWhileCoding && user2.favoriteDrinkWhileCoding) {
    const drink1 = user1.favoriteDrinkWhileCoding.toLowerCase();
    const drink2 = user2.favoriteDrinkWhileCoding.toLowerCase();

    if (
      (drink1.includes("coffee") ||
        drink1.includes("espresso") ||
        drink1.includes("latte") ||
        drink1.includes("cappuccino")) &&
      (drink2.includes("coffee") ||
        drink2.includes("espresso") ||
        drink2.includes("latte") ||
        drink2.includes("cappuccino"))
    ) {
      badges.push("caffeine-addicts");
    }
  }

  // metal-coders: Both like metal music
  if (user1.musicGenreWhileCoding && user2.musicGenreWhileCoding) {
    const music1 = user1.musicGenreWhileCoding.toLowerCase();
    const music2 = user2.musicGenreWhileCoding.toLowerCase();

    if (
      (music1.includes("metal") ||
        music1.includes("rock") ||
        music1.includes("hardcore")) &&
      (music2.includes("metal") ||
        music2.includes("rock") ||
        music2.includes("hardcore"))
    ) {
      badges.push("metal-coders");
    }
  }

  // hydro-homies: Both drink water while coding
  if (user1.favoriteDrinkWhileCoding && user2.favoriteDrinkWhileCoding) {
    const drink1 = user1.favoriteDrinkWhileCoding.toLowerCase();
    const drink2 = user2.favoriteDrinkWhileCoding.toLowerCase();

    if (
      (drink1.includes("water") || drink1 === "h2o") &&
      (drink2.includes("water") || drink2 === "h2o")
    ) {
      badges.push("hydro-homies");
    }
  }

  // linux-ultras: Both use Linux
  if (user1.preferredOS === "Linux" && user2.preferredOS === "Linux") {
    badges.push("linux-ultras");
  }

  // pc-master-race: Both PC gamers
  if (user1.gaming === "pc" && user2.gaming === "pc") {
    badges.push("pc-master-race");
  }

  // mobile-gamers: Both mobile gamers
  if (user1.gaming === "mobile" && user2.gaming === "mobile") {
    badges.push("mobile-gamers");
  }

  // golden-connection: compatibility above 98 (will be set in main function)

  return badges;
}

export function calculateCompatibility(user1, user2) {
  const scores = {
    programmingLanguages: calculateProgrammingLanguageScore(user1, user2),
    techStack: calculateTechStackScore(user1, user2),
    techArea: calculateTechAreaScore(user1, user2),
    experienceLevel: calculateExperienceLevelScore(user1, user2),
    statusAlignment: calculateStatusAlignment(user1, user2),
    locationProximity: calculateLocationProximity(user1, user2),
    codingTimeCompatibility: calculateCodingTimeCompatibility(user1, user2),
    personalInterests: calculatePersonalInterestsScore(user1, user2),
    gamingCompatibility: calculateGamingCompatibility(user1, user2),
    personalityMatch: calculatePersonalityMatch(user1, user2),
  };

  const weights = {
    programmingLanguages: 0.22, // 22%
    techArea: 0.18, // 18% - New tech area field
    techStack: 0.16, // 16%
    statusAlignment: 0.16, // 16%
    experienceLevel: 0.12, // 12%
    codingTimeCompatibility: 0.08, // 8% - Simplified without timezone
    locationProximity: 0.04, // 4%
    personalInterests: 0.02, // 2%
    gamingCompatibility: 0.01, // 1%
    personalityMatch: 0.01, // 1%
  };

  let compatibilityScore = 0;
  for (const [category, score] of Object.entries(scores)) {
    compatibilityScore += score * weights[category];
  }

  let quality;
  if (compatibilityScore >= 80) quality = "excellent";
  else if (compatibilityScore >= 65) quality = "good";
  else if (compatibilityScore >= 45) quality = "fair";
  else quality = "poor";

  // Simplified matchType logic: mentor-mentee, learnpartner, or networking
  let matchType = "networking"; // Default

  // Check for mentor-mentee relationship
  const experienceLevels = { beginner: 1, intermediate: 2, expert: 3 };
  const level1 = experienceLevels[user1.devExperience] || 1;
  const level2 = experienceLevels[user2.devExperience] || 1;
  const isHelpRelationship =
    (user1.status === "searchhelp" && user2.status === "offerhelp") ||
    (user1.status === "offerhelp" && user2.status === "searchhelp");

  if (isHelpRelationship && Math.abs(level1 - level2) >= 1) {
    matchType = "mentor-mentee";
  }
  // Check for learn partner relationship
  else if (user1.status === "learnpartner" && user2.status === "learnpartner") {
    matchType = "learnpartner";
  }

  // Generate badges
  let badges = generateMatchBadges(user1, user2, scores);

  // Add golden-connection badge if compatibility is above 98
  const finalCompatibilityScore = Math.round(compatibilityScore);
  if (finalCompatibilityScore >= 98) {
    badges.push("golden-connection");
  }

  return {
    compatibilityScore: finalCompatibilityScore,
    scores,
    matchType,
    quality,
    badges,
  };
}

export async function runMatchingForAllUsers() {
  try {
    console.log("🔄 Starting matching algorithm...");

    const users = await UserModel.find({}).lean();
    console.log(`📊 Found ${users.length} users to match`);

    let matchesCreated = 0;
    let matchesUpdated = 0;

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];

        if (
          user1.contacts?.includes(user2._id) ||
          user2.contacts?.includes(user1._id)
        ) {
          continue;
        }

        const matchData = calculateCompatibility(user1, user2);

        if (matchData.quality !== "poor") {
          const matchDoc = {
            user1: user1._id,
            user2: user2._id,
            compatibilityScore: matchData.compatibilityScore,
            scores: matchData.scores,
            matchType: matchData.matchType,
            quality: matchData.quality,
            badges: matchData.badges,
            lastCalculated: new Date(),
          };

          const result = await MatchModel.findOneAndUpdate(
            {
              $or: [
                { user1: user1._id, user2: user2._id },
                { user1: user2._id, user2: user1._id },
              ],
            },
            matchDoc,
            { upsert: true, new: true }
          );

          if (result.isNew) {
            matchesCreated++;
          } else {
            matchesUpdated++;
          }
        }
      }
    }

    console.log(
      `✅ Matching complete! Created: ${matchesCreated}, Updated: ${matchesUpdated}`
    );
    return { matchesCreated, matchesUpdated };
  } catch (error) {
    console.error("❌ Error in matching algorithm:", error);
    throw error;
  }
}

export async function getMatchesForUser(userId, limit = 20) {
  try {
    const matches = await MatchModel.find({
      $or: [{ user1: userId }, { user2: userId }],
      quality: { $in: ["excellent", "good", "fair"] },
    })
      .populate(
        "user1",
        "username avatar aboutMe devExperience programmingLanguages techArea"
      )
      .populate(
        "user2",
        "username avatar aboutMe devExperience programmingLanguages techArea"
      )
      .sort({ compatibilityScore: -1 })
      .limit(limit);

    return matches.map((match) => ({
      ...match.toObject(),
      otherUser:
        match.user1._id.toString() === userId.toString()
          ? match.user2
          : match.user1,
    }));
  } catch (error) {
    console.error("❌ Error getting matches for user:", error);
    throw error;
  }
}
