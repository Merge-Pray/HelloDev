export const calculateProfileCompletion = (profileData) => {
  const allProfileFields = [
    "country",
    "city",
    "age",
    "aboutMe",
    "devExperience",
    "status",
    "programmingLanguages",
    "techArea",
    "techStack",
    "languages",
    "preferredOS",
    "gaming", // ✅ Korrekt: "gaming" statt "gamingPreferences"
    "otherInterests",
    "favoriteTimeToCode",
    "favoriteLineOfCode",
    "favoriteDrinkWhileCoding",
    "musicGenreWhileCoding",
    "favoriteShowMovie",
  ];

  const requiredFields = [
    "country",
    "city",
    "status",
    "devExperience",
    "techArea",
    "programmingLanguages",
    "techStack",
    "preferredOS",
  ];

  const isFieldCompleted = (field) => {
    const value = profileData[field];
    if (Array.isArray(value)) {
      return value && value.length > 0;
    }
    return value && value.trim && value.trim() !== "";
  };

  const completedFields = allProfileFields.filter(isFieldCompleted);
  const completedRequiredFields = requiredFields.filter(isFieldCompleted);

  return {
    totalCompletion: Math.round(
      (completedFields.length / allProfileFields.length) * 100
    ),
    requiredCompletion: Math.round(
      (completedRequiredFields.length / requiredFields.length) * 100
    ),
    isMatchable: completedRequiredFields.length >= requiredFields.length,
    completedFieldsCount: completedFields.length,
    totalFieldsCount: allProfileFields.length,
    missingRequiredFields:
      requiredFields.length - completedRequiredFields.length,
  };
};
