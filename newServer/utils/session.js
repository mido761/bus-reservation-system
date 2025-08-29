// export function regenerate(req, res, user) {
//   req.session.regenerate((err) => {
//     if (err) return res.status(500).json("Session error");

//     req.session.userId = user.user_id;
//     req.session.userRole = user.role;

//     req.session.save((err) => {
//       if (err) return res.status(500).json("Failed to save session");
//       return res.status(200).json("Login successful");
//     });
//   });
// }
export function regenerate(req, res, user) {
  req.session.regenerate((err) => {
    if (err) return res.status(500).json("Session error");

    // Set your user data in the *new* session
    req.session.userId = user.user_id;
    req.session.userRole = user.role;

    // Explicitly save the new session
    req.session.save((err) => {
      if (err) return res.status(500).json("Failed to save session");

      // Send back only the *new* cookie
      res.clearCookie("connect.sid"); // ensures no duplicate
      res.cookie("connect.sid", req.sessionID);

      return res.status(200).json({ message: "Login successful" });
    });
  });
}

export function destroy(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("failed to logout");
    }
    res.clearCookie("connect.sid");
    return res.status(200).json("logout successfuly");
  });
}
