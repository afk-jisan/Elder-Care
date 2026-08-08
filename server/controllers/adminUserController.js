import { User, ROLES } from '../models/User.js';

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listUsers(req, res, next) {
  try {
    const { role, active } = req.query;
    const filter = {};

    if (role && ROLES.includes(role)) {
      filter.role = role;
    }
    if (active === 'true') {
      filter.isActive = true;
    }
    if (active === 'false') {
      filter.isActive = false;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      isActive: true,
    });

    res.status(201).json({
      message: 'User created',
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phone, role, password } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      user.role = role;
    }
    if (password) {
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 8 characters' });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      message: 'User updated',
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.auth.userId) {
      return res
        .status(400)
        .json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated (record kept)',
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      message: 'User reactivated',
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}
