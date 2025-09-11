import UserModel from "../models/user.js";
import MatchModel from "../models/match.js";
import { fuzzyMatch } from "../utils/textNormalization.js";
import { storeSimilarity } from "../utils/similarityTracker.js";
export function calculateTechnicalScore(user1, user2) {
  let totalScore = 0;
  let factors = 0;

  if (
    user1.programmingLanguages?.length &&
    user2.programmingLanguages?.length
  ) {
    factors++;
    const langScore = calculateProgrammingLanguageScore(user1, user2);
    totalScore += langScore * 0.5;
  }

  if (user1.techArea?.length && user2.techArea?.length) {
    factors++;
    const areaScore = calculateTechAreaScore(user1, user2);
    totalScore += areaScore * 0.3;
  }

  if (user1.techStack?.length && user2.techStack?.length) {
    factors++;
    const stackScore = calculateTechStackScore(user1, user2);
    totalScore += stackScore * 0.2;
  }

  return factors > 0 ? totalScore : 0;
}

export function calculateGoalAlignmentScore(user1, user2) {
  const statusScore = calculateStatusAlignment(user1, user2);
  const experienceScore = calculateExperienceLevelScore(user1, user2);

  return statusScore * 0.7 + experienceScore * 0.3;
}

export function calculatePersonalScore(user1, user2) {
  const scores = [];

  const interestsScore = calculatePersonalInterestsScore(user1, user2);
  if (interestsScore !== null) {
    scores.push({ score: interestsScore, weight: 0.4 });
  }

  const timeScore = calculateCodingTimeCompatibility(user1, user2);
  if (timeScore !== null) {
    scores.push({ score: timeScore, weight: 0.3 });
  }

  const locationScore = calculateLocationCompatibility(user1, user2);
  if (locationScore !== null) {
    scores.push({ score: locationScore, weight: 0.15 });
  }

  const languageScore = calculateSpokenLanguageScore(user1, user2);
  if (languageScore > 0) {
    scores.push({ score: languageScore, weight: 0.15 });
  }

  if (scores.length === 0) {
    return null;
  }

  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = scores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0
  );

  return weightedSum / totalWeight;
}

export function calculateLocationCompatibility(user1, user2) {
  if (!user1.country || !user2.country) {
    return null;
  }

  if (user1.country.toLowerCase() === user2.country.toLowerCase()) {
    return 100;
  }

  return 40;
}

export function calculatePersonalInterestsScore(user1, user2) {
  const user1Interests = extractAllInterests(user1);
  const user2Interests = extractAllInterests(user2);

  if (user1Interests.size === 0 && user2Interests.size === 0) {
    return null;
  }

  if (user1Interests.size === 0 || user2Interests.size === 0) {
    return 20;
  }

  const compatibilityScores = [];

  const directOverlap = calculateDirectOverlap(user1Interests, user2Interests);
  compatibilityScores.push({ score: directOverlap, weight: 0.6 });

  const lifestyleScore = calculateLifestyleCompatibility(user1, user2);
  if (lifestyleScore !== null) {
    compatibilityScores.push({ score: lifestyleScore, weight: 0.4 });
  }

  const totalWeight = compatibilityScores.reduce(
    (sum, item) => sum + item.weight,
    0
  );
  const weightedSum = compatibilityScores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0
  );

  return weightedSum / totalWeight;
}

function extractAllInterests(user) {
  const interests = new Set();

  if (user.otherInterests?.length) {
    user.otherInterests.forEach((interest) => {
      if (interest && interest.trim()) {
        interests.add(normalizeInterest(interest));
      }
    });
  }

  if (user.favoriteShowMovie && user.favoriteShowMovie.trim()) {
    interests.add(normalizeInterest(user.favoriteShowMovie));
  }

  if (user.gaming && user.gaming !== "none" && user.gaming.trim()) {
    interests.add(`gaming:${normalizeInterest(user.gaming)}`);
  }

  return interests;
}

function calculateDirectOverlap(interests1, interests2) {
  if (interests1.size === 0 || interests2.size === 0) {
    return 0;
  }

  const intersection = new Set(
    [...interests1].filter((x) => interests2.has(x))
  );
  const union = new Set([...interests1, ...interests2]);

  const jaccardSimilarity = intersection.size / union.size;

  const overlapBonus = intersection.size > 0 ? 0.2 : 0;

  return Math.min(100, jaccardSimilarity * 100 + overlapBonus * 100);
}

function calculateLifestyleCompatibility(user1, user2) {
  const compatibilityFactors = [];

  const musicScore = comparePreference(
    user1.musicGenreWhileCoding,
    user2.musicGenreWhileCoding,
    {
      exact: 100,
      both_exist: 60,
      one_missing: 40,
      both_missing: null,
    }
  );
  if (musicScore !== null) {
    compatibilityFactors.push(musicScore);
  }

  const drinkScore = comparePreference(
    user1.favoriteDrinkWhileCoding,
    user2.favoriteDrinkWhileCoding,
    {
      exact: 100,
      both_exist: 70,
      one_missing: 50,
      both_missing: null,
    }
  );
  if (drinkScore !== null) {
    compatibilityFactors.push(drinkScore);
  }

  if (compatibilityFactors.length === 0) {
    return null;
  }

  return (
    compatibilityFactors.reduce((sum, score) => sum + score, 0) /
    compatibilityFactors.length
  );
}

function comparePreference(pref1, pref2, scoreMap) {
  const hasP1 = pref1 && pref1.trim() && pref1 !== "none";
  const hasP2 = pref2 && pref2.trim() && pref2 !== "none";

  if (!hasP1 && !hasP2) return scoreMap.both_missing;
  if (!hasP1 || !hasP2) return scoreMap.one_missing;

  const normalizedP1 = normalizeInterest(pref1);
  const normalizedP2 = normalizeInterest(pref2);

  if (normalizedP1 === normalizedP2) return scoreMap.exact;
  return scoreMap.both_exist;
}

function normalizeInterest(interest) {
  return interest
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

export function calculateProgrammingLanguageScore(user1, user2) {
  if (
    !user1.programmingLanguages?.length ||
    !user2.programmingLanguages?.length
  ) {
    return 0;
  }

  const user1Map = new Map(user1.programmingLanguages);
  const user2Map = new Map(user2.programmingLanguages);

  let totalScore = 0;
  let comparisons = 0;

  const allLanguages = new Set([...user1Map.keys(), ...user2Map.keys()]);

  for (const language of allLanguages) {
    const skill1 = user1Map.get(language) || 0;
    const skill2 = user2Map.get(language) || 0;

    if (skill1 > 0 && skill2 > 0) {
      const skillDiff = Math.abs(skill1 - skill2);
      const languageScore = Math.max(0, 100 - skillDiff * 10);
      totalScore += languageScore;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalScore / comparisons : 0;
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

export function calculateExperienceLevelScore(user1, user2) {
  const experienceLevels = { beginner: 1, intermediate: 2, expert: 3 };

  const level1 = experienceLevels[user1.devExperience] || 1;
  const level2 = experienceLevels[user2.devExperience] || 1;

  const difference = Math.abs(level1 - level2);

  if (difference === 0) return 100;
  if (difference === 1) return 70;
  return 30;
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
  if (!user1.favoriteTimeToCode || !user2.favoriteTimeToCode) {
    return null;
  }

  const timeMap = {
    "early morning": 1,
    morning: 2,
    afternoon: 3,
    evening: 4,
    "late night": 5,
    night: 5,
    earlybird: 1,
    daytime: 3,
    nightowl: 5,
  };

  const time1 = timeMap[user1.favoriteTimeToCode.toLowerCase()] || 3;
  const time2 = timeMap[user2.favoriteTimeToCode.toLowerCase()] || 3;

  const timeDiff = Math.abs(time1 - time2);

  if (timeDiff === 0) return 100;

  if (timeDiff === 1) return 80;

  if (timeDiff === 2) return 60;

  return 30;
}

export function generateMatchBadges(user1, user2, scores) {
  const badges = [];

  if (
    user1.programmingLanguages?.length >= 1 &&
    user2.programmingLanguages?.length >= 1
  ) {
    const user1AllBeginner = user1.programmingLanguages.every(
      (lang) => lang[1] <= 3
    );
    const user2AllBeginner = user2.programmingLanguages.every(
      (lang) => lang[1] <= 3
    );

    if (user1AllBeginner && user2AllBeginner) {
      badges.push("noob-connection");
    }
  }

  if (
    user1.programmingLanguages?.length >= 1 &&
    user2.programmingLanguages?.length >= 1
  ) {
    const user1AllExpert = user1.programmingLanguages.every(
      (lang) => lang[1] >= 9
    );
    const user2AllExpert = user2.programmingLanguages.every(
      (lang) => lang[1] >= 9
    );

    if (user1AllExpert && user2AllExpert) {
      badges.push("syntax-masters");
    }
  }

  if (
    user1.favoriteTimeToCode === "nightowl" &&
    user2.favoriteTimeToCode === "nightowl"
  ) {
    badges.push("night-owls");
  }

  if (
    user1.favoriteTimeToCode === "earlybird" &&
    user2.favoriteTimeToCode === "earlybird"
  ) {
    badges.push("early-birds");
  }

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

  if (user1.preferredOS === "Linux" && user2.preferredOS === "Linux") {
    badges.push("linux-ultras");
  }

  if (user1.gaming === "pc" && user2.gaming === "pc") {
    badges.push("pc-master-race");
  }

  if (user1.gaming === "mobile" && user2.gaming === "mobile") {
    badges.push("mobile-gamers");
  }

  return badges;
}

export function calculateCompatibility(user1, user2) {
  const technicalScore = calculateTechnicalScore(user1, user2);
  const goalAlignmentScore = calculateGoalAlignmentScore(user1, user2);
  const personalScore = calculatePersonalScore(user1, user2);

  let compatibilityScore;
  if (personalScore === null) {
    compatibilityScore = Math.round(
      technicalScore * 0.75 + goalAlignmentScore * 0.25
    );
  } else {
    compatibilityScore = Math.round(
      technicalScore * 0.6 + goalAlignmentScore * 0.3 + personalScore * 0.1
    );
  }

  let quality;
  if (compatibilityScore >= 80) quality = "excellent";
  else if (compatibilityScore >= 65) quality = "good";
  else if (compatibilityScore >= 45) quality = "fair";
  else quality = "poor";

  let matchType = "networking";

  const experienceLevels = { beginner: 1, intermediate: 2, expert: 3 };
  const level1 = experienceLevels[user1.devExperience] || 1;
  const level2 = experienceLevels[user2.devExperience] || 1;
  const isHelpRelationship =
    (user1.status === "searchhelp" && user2.status === "offerhelp") ||
    (user1.status === "offerhelp" && user2.status === "searchhelp");

  if (isHelpRelationship && Math.abs(level1 - level2) >= 1) {
    matchType = "mentor-mentee";
  } else if (
    user1.status === "learnpartner" &&
    user2.status === "learnpartner"
  ) {
    matchType = "learnpartner";
  }

  let badges = generateMatchBadges(user1, user2, {
    technical: technicalScore,
    goalAlignment: goalAlignmentScore,
    personal: personalScore,
  });

  if (compatibilityScore >= 95) {
    badges.push("golden-connection");
  }

  return {
    compatibilityScore,
    scores: {
      technical: Math.round(technicalScore),
      goalAlignment: Math.round(goalAlignmentScore),
      personal: personalScore !== null ? Math.round(personalScore) : null,
    },
    matchType,
    quality,
    badges,
  };
}

export async function runMatchingForAllUsers() {
  try {
    console.log("🔄 Starting matching algorithm...");
    const startTime = Date.now();

    const users = await UserModel.find({}).lean();
    console.log(`Found ${users.length} users to match`);

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

        if (matchData.compatibilityScore >= 45) {
          const existingMatch = await MatchModel.findOne({
            $or: [
              { user1: user1._id, user2: user2._id },
              { user1: user2._id, user2: user1._id },
            ],
          });

          if (existingMatch) {
            await MatchModel.findByIdAndUpdate(existingMatch._id, {
              ...matchData,
              lastCalculated: new Date(),
            });
            matchesUpdated++;
          } else {
            await MatchModel.create({
              user1: user1._id,
              user2: user2._id,
              ...matchData,
              lastCalculated: new Date(),
            });
            matchesCreated++;
          }
        }
      }
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;
    const executionTimeSeconds = (executionTime / 1000).toFixed(2);

    console.log(`⏱️ Algorithm completed in ${executionTimeSeconds}s`);
    console.log(
      `✅ Matching complete! Created: ${matchesCreated}, Updated: ${matchesUpdated}`
    );

    return { matchesCreated, matchesUpdated };
  } catch (error) {
    console.error("❌ Error in matching algorithm:", error);
    throw error;
  }
}

export async function getMatchesForUser(userId, limit = 10) {
  try {
    const matches = await MatchModel.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: "pending",
    })
      .populate(
        "user1",
        "username avatar aboutMe techArea programmingLanguages"
      )
      .populate(
        "user2",
        "username avatar aboutMe techArea programmingLanguages"
      )
      .sort({ compatibilityScore: -1 })
      .limit(limit);

    const formattedMatches = matches.map((match) => {
      const isUser1 = match.user1._id.toString() === userId.toString();
      const otherUser = isUser1 ? match.user2 : match.user1;

      return {
        matchId: match._id,
        user: otherUser,
        compatibilityScore: match.compatibilityScore,
        scores: match.scores,
        badges: match.badges,
        matchType: match.matchType,
        quality: match.quality,
      };
    });

    return formattedMatches;
  } catch (error) {
    console.error("❌ Error getting user matches:", error);
    throw error;
  }
}

export function calculateSpokenLanguageScore(user1, user2) {
  if (!user1.languages?.length || !user2.languages?.length) {
    return 0;
  }

  const user1Languages = new Set(
    user1.languages.map((lang) => lang.toLowerCase())
  );
  const user2Languages = new Set(
    user2.languages.map((lang) => lang.toLowerCase())
  );

  const commonLanguages = new Set(
    [...user1Languages].filter((lang) => user2Languages.has(lang))
  );

  if (commonLanguages.size === 0) {
    return 0;
  }

  const baseScore = 60;

  const multiLanguageBonus = Math.min(commonLanguages.size * 15, 40);

  return Math.min(100, baseScore + multiLanguageBonus);
}
