export const calculateProfileCompletion = (profileData) => {
  const allProfileFields = [
    "nickname", // ✅ Added nickname
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
    "gaming",
    "otherInterests",
    "favoriteTimeToCode",
    "favoriteLineOfCode",
    "favoriteDrinkWhileCoding",
    "musicGenreWhileCoding",
    "favoriteShowMovie",
  ];

  const requiredFields = [
    "nickname", // ✅ Added nickname as required
    "country",
    "city",
    "status",
    "devExperience",
    "techArea",
    "programmingLanguages",
    "techStack",
    "preferredOS",
  ];

  // ✅ Mapping für benutzerfreundliche Feldnamen
  const fieldLabels = {
    nickname: "Nickname",
    country: "Country",
    city: "City",
    status: "Status",
    devExperience: "Development Experience",
    techArea: "Tech Areas of Interest",
    programmingLanguages: "Programming Languages",
    techStack: "Tech Stack & Tools",
    preferredOS: "Preferred Operating System",
  };

  const isFieldCompleted = (field) => {
    const value = profileData[field];
    if (Array.isArray(value)) {
      return value && value.length > 0;
    }
    return value && value.trim && value.trim() !== "";
  };

  const completedFields = allProfileFields.filter(isFieldCompleted);
  const completedRequiredFields = requiredFields.filter(isFieldCompleted);
  const missingRequiredFields = requiredFields.filter(
    (field) => !isFieldCompleted(field)
  );

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
    missingRequiredFields: missingRequiredFields.length,
    missingRequiredFieldsList: missingRequiredFields.map((field) => ({
      field,
      label: fieldLabels[field] || field,
    })),
    completedRequiredFieldsCount: completedRequiredFields.length,
    totalRequiredFieldsCount: requiredFields.length,
  };
};
