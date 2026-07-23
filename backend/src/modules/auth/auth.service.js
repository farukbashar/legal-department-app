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

module.exports = { register, login, listUsers, updateUser };
