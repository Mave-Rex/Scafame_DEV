// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Unit } from './entities/unit.entity';
import { ProductCategory } from './entities/productCategory.entity';
import { Report } from './entities/report.entity';
import { ProductReport } from './entities/productReport.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Product, Unit, ProductCategory, Report, ProductReport],

      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    AuthModule,
    InventoryModule,
    UsersModule,
  ],
})
export class AppModule {}
