function checkIsMatchable(user) {
  const requiredStringFields = [
    "nickname",
    "country",
    "city",
    "status",
    "devExperience",
    "preferredOS",
  ];
  const requiredArrayFields = ["techArea", "programmingLanguages", "techStack"];

  for (const field of requiredStringFields) {
    if (!user[field] || user[field].trim() === "") {
      return false;
    }
  }

  for (const field of requiredArrayFields) {
    if (!Array.isArray(user[field]) || user[field].length === 0) {
      return false;
    }
  }

  return true;
}

export default checkIsMatchable;
