import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersSerializer } from './users.serializer';
import { UserGamesRepository } from '../games/userGames.repository';
import { UserGamesSerializer } from '../games/serializers/user.games.serializer';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, UserGamesRepository]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSerializer, UserGamesSerializer],
})
export class UserModule {}
