const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');

async function register({ fullName, email, password, role, department }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { fullName, email, passwordHash, role, department },
  });

  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } };
}

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  return users;
}

async function updateUser(id, { role, department, isActive }) {
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      ...(role && { role }),
      ...(department !== undefined && { department }),
      ...(isActive !== undefined && { isActive }),
    },
    select: { id: true, fullName: true, email: true, role: true, department: true, isActive: true },
  });
  return user;
}

// Self-service: a logged-in user changes their own password, proving they
// know the current one.
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: Number(userId) }, data: { passwordHash } });
  return { success: true };
}

// Admin-only: reset another user's password without knowing their old one
// (e.g. they're locked out). No confirmation of the old password required.
async function adminResetPassword(id, { newPassword }) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { passwordHash },
    select: { id: true, fullName: true, email: true },
  });
  return user;
}

module.exports = { register, login, listUsers, updateUser, changePassword, adminResetPassword };
