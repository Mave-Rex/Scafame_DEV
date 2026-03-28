import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Usa "localhost" si NestJS se ejecuta fuera de Docker
      port: 5432, // Puerto expuesto por el contenedor
      username: 'magvx105', 
      password: 'admin1234', 
      database: 'SigfameDB', 
      entities: [User],
      autoLoadEntities: true, // Carga automáticamente las entidades registradas
      synchronize: true, // Sincroniza la base de datos (solo para desarrollo)
      retryAttempts: 10, // Número de intentos de reconexión
      retryDelay: 3000, // Retraso entre intentos de reconexión en ms
    }),
    AuthModule,
  ],
})
export class AppModule {}
