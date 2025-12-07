import Joi from "joi";

export const bookingValidation = Joi.object({
  userId: Joi.string().required().messages({
    "string.empty": "User ID is required",
  }),

  courtId: Joi.string().required().messages({
    "string.empty": "Court ID is required",
  }),

  bookingDate: Joi.string().required().messages({
    "string.empty": "Booking date is required",
  }),

  times: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "Each time value must be a string until we change it into datetime",
      })
    )
    .required()
    .messages({
      "array.base": "Times must be an array of strings",
      "any.required": "Times array is required",
    }),
});
