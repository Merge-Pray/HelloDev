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

export { registerValidationRules, validate };
