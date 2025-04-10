import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { DBType } from 'utils/constant';

export class CreateUser1743845281494 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: DBType.INT,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'public_id',
            type: DBType.UUID,
            isNullable: false,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: DBType.VARCHAR,
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: DBType.VARCHAR,
            isNullable: true,
          },
          {
            name: 'password',
            type: DBType.VARCHAR,
            isNullable: false,
          },
          {
            name: 'salt',
            type: DBType.VARCHAR,
            length: '64',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: DBType.BOOLEAN,
            default: true,
          },
          {
            name: 'created_at',
            type: DBType.TIMESTAMP,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: DBType.TIMESTAMP,
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: DBType.TIMESTAMP,
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_USER_NAME',
            columnNames: ['name'],
            isUnique: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
