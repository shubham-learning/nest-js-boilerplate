import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './user/entities/user.entity';
import { DataSource } from 'typeorm';

// Decorator
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test_nest',
      entities: ['dist/**/*.entity{.ts, .js}'],
      retryAttempts: 10,
      retryDelay: 300,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
