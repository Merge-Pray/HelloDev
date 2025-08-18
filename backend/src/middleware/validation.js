import { body, validationResult } from "express-validator";

const registerValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Invalid email format."),

    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long.")
      .notEmpty()
      .withMessage("Username is required.")
      .not()
      .contains("@")
      .withMessage("Username cannot contain @ symbol."),

    body("password")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter (A-Z).")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter (a-z).")

      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage(
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).'
      ),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    success: false,
    errors: extractedErrors,
  });
};

const postValidationRules = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Post content is required.")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Post content must be between 1 and 2000 characters."),

    body("visibility")
      .optional()
      .isIn(["public", "contacts_only", "private"])
      .withMessage("Invalid visibility setting."),

    body("hashtags")
      .optional()
      .isArray()
      .withMessage("Hashtags must be an array.")
      .custom((value) => {
        return value.every(
          (tag) =>
            typeof tag === "string" &&
            tag.length <= 50 &&
            /^[a-zA-Z0-9_]+$/.test(tag.replace(/^#/, ""))
        );
      })
      .withMessage(
        "Hashtags must be alphanumeric and under 50 characters each."
      ),
  ];
};

const commentValidationRules = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Comment content is required.")
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be between 1 and 500 characters."),
  ];
};

const repostValidationRules = () => {
  return [
    body("comment")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Repost comment must be less than 500 characters."),
  ];
};

export {
  registerValidationRules,
  postValidationRules,
  commentValidationRules,
  repostValidationRules,
  validate,
};
