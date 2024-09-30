import User from '../models/User.js';
import StatusCode from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import attachCookies from '../utils/attachCookies.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  const userAlreadyExist = await User.findOne({ email });

  if (userAlreadyExist) {
    throw new BadRequestError('Email already in use');
  }
  const lowerCaseEmail =email.toLowerCase()
  const user = await User.create({ name, email:lowerCaseEmail, password });

  const token = user.createJWT();
  attachCookies({ res, token });

  res.status(StatusCode.CREATED).json({
    user: {
      email: user.email,
      name: user.name,
      location: user.location,
      lastName: user.lastName,
    },
    location: user.location,
    token: token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }
  const lowerCaseEmail = email.toLowerCase()

  const user = await User.findOne({ email:lowerCaseEmail }).select('+password');

  if (!user) {
    throw new UnauthenticatedError('No user found with email Provided');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Password is incorrect');
  }

  const token = user.createJWT();
  user.password = undefined;

  // attachCookies({ res, token });
  res.status(StatusCode.OK).json({
    user,
    location: user.location,
    token: token,
  });
};

const updateUser = async (req, res) => {
  const { name, email, lastName, location } = req.body;
  if (!name || !email || !lastName || !location) {
    throw new BadRequestError('Please provide all values');
  }
   const lowerCaseEmail = email.toLowerCase()

  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = lowerCaseEmail;
  user.lastName = lastName;
  user.location = location;

  await user.save();
  const token = user.createJWT();

  attachCookies({ res, token });

  res.status(StatusCode.OK).json({ user, location: user.location, token });
  // res.send("update user");
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCode.OK).json({ user, location: user.location });
};
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,

    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCode.OK).json({ msg: 'user logged out!' });
};

export { register, login, updateUser, getCurrentUser, logout };
