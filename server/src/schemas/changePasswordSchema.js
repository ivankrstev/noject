import Joi from "joi";

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .regex(/^(?=.*[a-z])/)
    .message("Password must contain at least 1 lowercase letter")
    .regex(/^(?=.*[A-Z])/)
    .message("Password must contain at least 1 uppercase letter")
    .regex(/^(?=.*\d)/)
    .message("Password must contain at least 1 number")
    .min(10)
    .message("Password must be at least 10 characters")
    .max(50)
    .message("Password must be less than 51 characters")
    .required(),
  confirmNewPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({ "any.only": "Passwords do not match" }),
});

export default changePasswordSchema;
