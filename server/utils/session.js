regenerate = (req, user) => {
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json("Session error");
    }

    // Set new session values
    req.session.userId = user._id;
    req.session.userRole = user.role;
  });
};
