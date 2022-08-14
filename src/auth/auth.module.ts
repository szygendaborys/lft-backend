import { User } from './../users/user.entity';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from './refreshJwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [JwtStrategy, AuthService, RefreshJwtStrategy, UserRepository],
  exports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtStrategy,
    RefreshJwtStrategy,
    AuthService,
  ],
})
export class AuthModule {}
