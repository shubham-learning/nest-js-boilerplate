import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from 'src/db/data-source';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'utils/http-exception.filter';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
