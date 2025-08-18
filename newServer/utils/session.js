export function regenerate(req, res, user) {
  req.session.regenerate((err) => {
    if (err) return res.status(500).json("Session error");

    req.session.userId = user._id;
    req.session.userRole = user.role;

    req.session.save((err) => {
      if (err) return res.status(500).json("Failed to save session");
      return res.status(200).json("Login successful");
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
