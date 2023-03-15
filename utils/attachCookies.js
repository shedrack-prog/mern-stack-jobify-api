const attachCookies = ({ res, token }) => {
  const twodays = 1000 * 60 * 60 * 48;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + twodays),
    domain: 'http://localhost:3000/landing',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'none',
  });
};

export default attachCookies;
