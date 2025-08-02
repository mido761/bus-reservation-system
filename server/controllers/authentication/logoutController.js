module.exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("failed to logout");
    }
    res.clearCookie("connect.sid");
    res.status(200).json("logout successfuly");
  });
};