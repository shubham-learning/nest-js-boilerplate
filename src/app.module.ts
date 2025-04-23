import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from 'src/db/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
