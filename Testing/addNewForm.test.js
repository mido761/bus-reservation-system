const Joi = require("joi");

const formSchema = Joi.object({
  schedule: Joi.date(),
  price: Joi.number().min(100),
  pickupLocation: Joi.string(),
  arrivalLocation: Joi.string(),
  departureTime: Joi.string(),
});

const correctBody = {
  schedule: "2025-08-06",
  price: 110,
  pickupLocation: "E-JUST",
  arrivalLocation: "Cairo",
  departureTime: "16:00",
};

const validateBody = (input) => {
  if (input === undefined) {
    throw new Error("Nothing is passed to validate!");
  }
  const { error } = formSchema.validate(input);

  if (error) {
    throw new TypeError(error.details[0].message);
  }

  return true;
};

test("Returns true for correct input", () => {
  expect(validateBody(correctBody)).toBeTruthy();
});

test("throws an error for wrong input", () => {
  const invalidBody = { ...correctBody, price: 0 };
  expect(() => {
    validateBody(invalidBody);
  }).toThrow();
});

test("throws an error if nothing is passed as input", () => {
  expect(() => {
    validateBody();
  }).toThrow("Nothing is passed to validate!");
});

test("Ensure schedule is a valid date string", () => {
  const { error } = Joi.date().validate(correctBody.schedule);
  expect(error).toBeUndefined();
});
