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

// Post validation rules
const postValidationRules = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Post content is required.")
      .isLength({ min: 1, max: 2000 })
      .withMessage("Post content must be between 1 and 2000 characters."),

    body("postType")
      .optional()
      .isIn(["text", "project", "help_request", "achievement", "match_announcement"])
      .withMessage("Invalid post type."),

    body("visibility")
      .optional()
      .isIn(["public", "contacts_only", "private"])
      .withMessage("Invalid visibility setting."),

    // Project details validation
    body("projectDetails.title")
      .if(body("postType").equals("project"))
      .notEmpty()
      .withMessage("Project title is required for project posts.")
      .isLength({ max: 200 })
      .withMessage("Project title must be less than 200 characters."),

    body("projectDetails.description")
      .if(body("postType").equals("project"))
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Project description must be less than 1000 characters."),

    body("projectDetails.techStack")
      .if(body("postType").equals("project"))
      .optional()
      .isArray()
      .withMessage("Tech stack must be an array."),

    body("projectDetails.lookingFor")
      .if(body("postType").equals("project"))
      .optional()
      .isArray()
      .withMessage("Looking for must be an array.")
      .custom((value) => {
        const validRoles = ["frontend", "backend", "fullstack", "designer", "mentor", "tester"];
        return value.every(role => validRoles.includes(role));
      })
      .withMessage("Invalid role in looking for array."),

    body("projectDetails.projectUrl")
      .if(body("postType").equals("project"))
      .optional()
      .isURL()
      .withMessage("Project URL must be a valid URL."),

    // Help request validation
    body("helpRequest.title")
      .if(body("postType").equals("help_request"))
      .notEmpty()
      .withMessage("Help request title is required.")
      .isLength({ max: 200 })
      .withMessage("Help request title must be less than 200 characters."),

    body("helpRequest.urgency")
      .if(body("postType").equals("help_request"))
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid urgency level."),

    body("helpRequest.techArea")
      .if(body("postType").equals("help_request"))
      .optional()
      .isArray()
      .withMessage("Tech area must be an array."),

    // Achievement validation
    body("achievement.type")
      .if(body("postType").equals("achievement"))
      .notEmpty()
      .withMessage("Achievement type is required.")
      .isIn(["new_skill", "project_completed", "certification", "job_change", "milestone"])
      .withMessage("Invalid achievement type."),

    body("achievement.title")
      .if(body("postType").equals("achievement"))
      .notEmpty()
      .withMessage("Achievement title is required.")
      .isLength({ max: 200 })
      .withMessage("Achievement title must be less than 200 characters."),

    body("achievement.description")
      .if(body("postType").equals("achievement"))
      .optional()
      .isLength({ max: 500 })
      .withMessage("Achievement description must be less than 500 characters."),

    // Hashtags validation
    body("hashtags")
      .optional()
      .isArray()
      .withMessage("Hashtags must be an array.")
      .custom((value) => {
        return value.every(tag => 
          typeof tag === 'string' && 
          tag.length <= 50 && 
          /^[a-zA-Z0-9_]+$/.test(tag.replace(/^#/, ''))
        );
      })
      .withMessage("Hashtags must be alphanumeric and under 50 characters each.")
  ];
};

// Comment validation rules
const commentValidationRules = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Comment content is required.")
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be between 1 and 500 characters.")
  ];
};

export { registerValidationRules, postValidationRules, commentValidationRules, validate };
