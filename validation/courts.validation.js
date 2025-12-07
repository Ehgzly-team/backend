import Joi from "joi";

export const courtValidation = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Court name is required",
  }),

  location: Joi.string().trim().required().messages({
    "string.empty": "Location is required",
  }),

  type: Joi.string()
    .valid("Football", "Basketball", "Tennis", "Badminton", "Volleyball")
    .required()
    .messages({
      "any.only":
        "Court type must be Football, Basketball, Tennis, Badminton, or Volleyball",
    }),

  rate: Joi.number().min(1).max(5).default(1),

  pricePerHour: Joi.number().required().messages({
    "number.base": "Price per hour must be a number",
    "any.required": "Price per hour is required",
  }),

  owner: Joi.string().required().messages({
    "string.empty": "Owner is required",
  }),

  bookings: Joi.array().default([]),

  image_path: Joi.string().required().messages({
    "string.empty": "Image path is required",
  }),
});
