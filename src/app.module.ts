import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralResourcesModule } from './general_resources/general_resources.module';
import { ClientProfessionalEntitiesModule } from './client_professional_entities/client_professional_entities.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME, 
      username: process.env.DB_USER, 
      password: process.env.DB_PASSWORD, 
      autoLoadEntities: true, 
      synchronize: true,
      ssl: {
        ca: fs.readFileSync('us-east-2-bundle.pem')
      }
    }),

    ClientsModule, 
    ProfessionalsModule, GeneralResourcesModule, ClientProfessionalEntitiesModule, AuthModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
