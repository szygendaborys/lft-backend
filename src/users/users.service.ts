import { InvalidVerificationCodeException } from './../auth/exceptions/invalidVerificationCode.exception';
import { ChangeForgotPasswordDto } from './dto/change-forgot-password.dto';
import { NotificationMedium } from './../shared/notification/notification.medium';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserGamesRepository } from '../games/userGames.repository';
import { UsersContext } from './users.context';
import { UserNotFoundException } from './user-not-found.exception';
import { UpdateUserDto } from './dto/update.user.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { NotificationTypes } from '../shared/notification/notification.config';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userGamesRepository: UserGamesRepository,
    private readonly authService: AuthService,
    private readonly notificationMedium: NotificationMedium,
  ) {}

  async login({ username, password }: LoginUserDto): Promise<{
    user: User;
    accessToken: TokenPayloadDto;
    refreshToken: TokenPayloadDto;
  }> {
    const user = await this.userRepository.findOneByUsernameWithGames(username);

    await this.authService.validateUser(password, user);

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.createToken(user),
      this.authService.createToken(user, true),
    ]);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userEntity = User.createFromUserDto(createUserDto);
    const games = this.userGamesRepository.create({ user: userEntity });
    return this.userRepository.save({
      ...userEntity,
      games,
    });
  }

  async update(updateUserDto: UpdateUserDto): Promise<void> {
    const { userId } = UsersContext.get();
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    await user.update(updateUserDto);

    await this.userRepository.save(user);
  }

  async findUser(): Promise<User> {
    const { userId } = UsersContext.get();
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  @Transactional()
  async sendResetPasswordCode({ username }: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOneByUsername(username);

    if (user) {
      const verificationCode = this.authService.generateVerificationCode();

      user.setResetPasswordVerificationCode(verificationCode);

      await this.userRepository.save(user);

      await this.notificationMedium.sendNotification({
        user,
        type: NotificationTypes.resetPasswordConfirmationLink,
        data: {
          verificationCode,
        },
      });
    }
  }

  async changeForgottenPassword({
    username,
    verificationCode,
    newPassword,
  }: ChangeForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOneByUsername(username);

    if (!user) {
      throw new InvalidVerificationCodeException();
    }

    const isCodeValid =
      user.validateResetPasswordVerificationCode(verificationCode);

    await this.userRepository.save(user);

    if (!isCodeValid) {
      throw new InvalidVerificationCodeException();
    }

    user.changePasswordWithoutValidation(newPassword);

    await this.userRepository.save(user);
  }
}
