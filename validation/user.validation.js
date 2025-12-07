import Joi from "joi";

export const userValidation = Joi.object({
  _id: Joi.string().optional(),

  username: Joi.string().min(2).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 2 characters",
  }),

  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),

  role: Joi.string().valid("owner", "user", "admin").default("user").messages({
    "any.only": "Role must be owner, user or admin",
  }),

  owned_courts: Joi.array().items(Joi.string()).default([]),

  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "string.empty": "Email is required",
  }),

  favorites: Joi.array().items(Joi.string()).default([]),

  bookings: Joi.array().items(Joi.string()).default([]),
});
