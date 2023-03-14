import { UnauthenticatedError } from "../errors/index.js";
import jwt from "jsonwebtoken";
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // if (!authHeader || !authHeader.startsWith("Bearer")) {
  //   throw new UnauthenticatedError("Authentication Invalid");
  // }
  // const token = authHeader.split(" ")[1];
  const token = req.cookies.token;
  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const testUser = payload.userId === "63ab43cbe987b0dc258f3710";
    req.user = { userId: payload.userId, testUser };

    // console.log(req.user.userId);
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

export default auth;
