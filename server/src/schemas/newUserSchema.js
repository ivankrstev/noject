import Joi from "joi";

const newUserSchema = Joi.object({
  email: Joi.string()
    .max(62)
    .message("Email must be less than 63 characters")
    .email()
    .message("Email be a valid one")
    .required(),
  firstName: Joi.string().max(50).message("First name must be less than 51 characters").required(),
  lastName: Joi.string().max(50).message("Last name must be less than 51 characters").required(),
  password: Joi.string()
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
});

export default newUserSchema;
