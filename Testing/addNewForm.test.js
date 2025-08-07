const { validateBody } = require("../server/utils/bodyValidation/validateBody");
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


describe("Testing the correctness of the input", () => {
  test("Returns true for correct input", () => {
    expect(validateBody(correctBody, formSchema)).toBeTruthy();
  });

  test("throws an error for wrong input", () => {
    const invalidBody = { ...correctBody, price: 0 };
    expect(() => {
      validateBody(invalidBody, formSchema);
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
});
