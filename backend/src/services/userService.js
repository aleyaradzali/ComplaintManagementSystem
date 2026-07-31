import * as userRepository from '../repositories/userRepository.js';

export async function listOfficers() {
  return userRepository.findAllOfficers();
}
