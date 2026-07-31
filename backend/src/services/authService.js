import * as userRepository from '../repositories/userRepository.js';
import { comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError(MESSAGES.LOGIN_FAILED, 401);
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError(MESSAGES.LOGIN_FAILED, 401);
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(MESSAGES.LOGIN_FAILED, 401);
  }
  return toPublicUser(user);
}
