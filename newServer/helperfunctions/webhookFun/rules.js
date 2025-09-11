export const rules = [
  {
    match: (body) => body.is_standalone_payment && !body.is_refunded && body.success,
    action: "standAlone",
  },
  {
    match: (body) => body.is_standalone_payment && body.is_refunded && body.success,
    action: "refund",
  },
  {
    match: (body) => body.is_auth && body.success,
    action: "auth",
  },
  {
    match: (body) => body.is_capture && body.success,
    action: "capture",
  },
  {
    match: (body) => body.is_voided && body.success,
    action: "void",
  },
];
