import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    email: string,
    password: string,
  ): Promise<{ publicId: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
    });

    return { publicId: user.publicId };
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    const isMatch = await bcrypt.compare(password, user.password);

    return isMatch;
  }
}
