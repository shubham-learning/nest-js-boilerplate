import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import {
  FindAllResponse,
  SaveResponse,
  FindOneResponse,
} from 'utils/interfaces/api-response.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SaveResponse> {
    const user = await this.usersRepository.save(createUserDto);
    return { data: { publicId: user.publicId } };
  }

  async findAll(): Promise<FindAllResponse<User>> {
    const [users, count] = await this.usersRepository.findAndCount({
      order: { id: 'DESC' },
    });
    return { data: users, count };
  }

  async findOne(publicId: string): Promise<FindOneResponse<User>> {
    const user = await this.usersRepository.findOneBy({ publicId });

    return { data: user };
  }

  async update(publicId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { publicId },
        select: ['id'],
      });

      if (!user) {
        throw new HttpException(
          [
            {
              name: 'user-public-id',
              message: `User with public ID ${publicId} not found custom`,
            },
          ],
          HttpStatus.BAD_REQUEST,
        );
      }

      await queryRunner.manager.update(User, { id: user.id }, updateUserDto);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
