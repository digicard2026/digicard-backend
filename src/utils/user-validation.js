const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.ref('password'),
    role: Joi.string().valid("admin","user","doctor").required(),
    phone: Joi.string().optional(),
    gender: Joi.string().valid("Male", "Female", "Other").optional(),
    dateOfBirth: Joi.date().optional(),

     doctorId: Joi.string().when("role", {
    is: "doctor",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
    
});

module.exports = signupSchema;