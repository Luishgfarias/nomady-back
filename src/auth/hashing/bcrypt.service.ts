import { compare, genSalt, hash } from 'bcrypt';
import { HashingService } from './hashing.service';
import { ServiceUnavailableException } from '@nestjs/common';

export class BcryptService implements HashingService {
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await genSalt(12);
      return hash(password, salt);
    } catch (error) {
      throw new ServiceUnavailableException('Error hashing password');
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await compare(password, hash);
    } catch (error) {
      throw new ServiceUnavailableException('Error comparing password');
    }
  }
}
