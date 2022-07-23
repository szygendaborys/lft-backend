import { ONE_SECOND_IN_MS } from './../shared/constants';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ContextService } from '../shared/context.service';
import { UtilsService } from '../shared/utils.service';
import { AppConfig } from '../shared/services/app.config';
import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/user.entity';
import { TokenPayloadDto } from './dto/tokenPayload.dto';
import { InvalidLoginCredentialsException } from './exceptions/InvalidLoginCredentialsException';

@Injectable()
export class AuthService {
  private static _authUserKey = 'user_key';

  constructor(
    private readonly appConfig: AppConfig,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(
    user: User | UserDto,
    refreshToken?: boolean,
  ): Promise<TokenPayloadDto> {
    const expiresAt = this.getExpirationTimestamp(
      refreshToken
        ? this.appConfig.jwt.refreshExpirationTime
        : this.appConfig.jwt.expirationTime,
    );

    const token = await this.jwtService.signAsync(
      { id: user.id, expiresAt },
      {
        secret: this.appConfig.jwt.secret,
      },
    );

    return new TokenPayloadDto({
      expiresAt,
      token,
    });
  }

  async validateUser(password: string, user?: User): Promise<void> {
    const isPasswordValid = await UtilsService.validateHash(
      password,
      user && user.password,
    );
    if (!user || !isPasswordValid) {
      throw new InvalidLoginCredentialsException();
    }
  }

  logout() {
    console.log('TO BE IMPLEMENTED BLACKLISTING TOKEN');
  }

  generateVerificationCode(): string {
    return UtilsService.generateRandomString(6);
  }

  getExpirationTimestamp(expiresInS: number): number {
    return new Date(Date.now() + ONE_SECOND_IN_MS * expiresInS).getTime();
  }

  static setAuthUser(user: User) {
    ContextService.set(AuthService._authUserKey, user);
  }

  static getAuthUser(): User {
    return ContextService.get(AuthService._authUserKey);
  }
}
