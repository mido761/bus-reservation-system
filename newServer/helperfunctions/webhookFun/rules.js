
export const rules = [
  {
    match: body => body.is_standalone_payment === true && body.success === true,
    action: "standAlone",
  },
  {
    match: body => body.is_refunded && body.success,
    action: "refund",
  },
];
