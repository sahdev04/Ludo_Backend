const authorizeAdmin = (req, res, next) => {
  console.log(req.user.role, req.user);
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Admins only." });
  }
  next();
};

export default authorizeAdmin;
