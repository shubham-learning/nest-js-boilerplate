import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { DBType } from 'utils/constant';

@Index('IDX_USER_NAME', ['name'])
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'public_id',
    type: DBType.UUID,
    default: () => 'uuid_generate_v4()',
  })
  publicId: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
