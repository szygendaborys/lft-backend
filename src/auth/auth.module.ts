import { User } from './../users/user.entity';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './refreshJwt.strategy';
import { JwtWebsocketsAuthGuard } from './jwt-websockets-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    JwtStrategy,
    AuthService,
    RefreshJwtStrategy,
    UserRepository,
    JwtWebsocketsAuthGuard,
  ],
  exports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtStrategy,
    RefreshJwtStrategy,
    AuthService,
    JwtWebsocketsAuthGuard,
  ],
})
export class AuthModule {}
