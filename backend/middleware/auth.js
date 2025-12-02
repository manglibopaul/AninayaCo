import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Seller from '../models/Seller.js';

export const verifyUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Optional auth: if Authorization header present, verify and set req.user, otherwise continue without error
export const verifyUserOptional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    return next();
  } catch (error) {
    // If token is invalid, ignore and continue as guest
    return next();
  }
};

// Optional helper to generate tokens if needed elsewhere
export const generateUserToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
};

// Verify admin user
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Try to resolve as a normal user first
    const user = await User.findByPk(decoded.id);
    if (user && user.isAdmin) {
      req.user = { id: user.id, isAdmin: true };
      return next();
    }

    // If not an admin user, allow seller accounts to act as admin as well
    const seller = await Seller.findByPk(decoded.id);
    if (seller) {
      req.user = { id: seller.id, isAdmin: true, isSeller: true };
      return next();
    }

    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
