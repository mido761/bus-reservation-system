const Joi = require("joi");

const validateBody = (input, schema) => {
  if (input === undefined) {
    throw new Error("Nothing is passed to validate!");
  }
  const { error } = schema.validate(input);

  if (error) {
    throw new TypeError(error.details[0].message);
  }

  return true;
};

module.exports = {validateBody};