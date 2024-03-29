import { RoomChatMessageEntity } from './../chat/roomChatMessage.entity';
import { UnauthorizedException } from '@nestjs/common';
import { DateUtils } from './../shared/date.utils';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserGames } from '../games/userGames.entity';
import { NotificationEntity } from '../shared/notification/notification.entity';
import { Roles } from '../roles/roles.config';
import { AbstractEntity } from '../shared/abstract.entity';
import { ONE_MINUTE_IN_S, TEN_SECONDS_IN_S } from '../shared/constants';
import { TooManyRequestsException } from '../shared/exceptions/tooManyRequests.exception';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { UtilsService } from '../shared/utils.service';

@Entity()
export class User extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 500,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;

  @Column({
    name: 'reset_password_verification_code',
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  resetPasswordVerificationCode: string | null;

  @Column({
    name: 'reset_password_verification_code_sent_at',
    type: 'timestamp',
    nullable: true,
  })
  resetPasswordVerificationCodeSentAt: Date | null;

  @Column({
    name: 'reset_password_verification_code_verified_at',
    type: 'timestamp',
    nullable: true,
  })
  resetPasswordVerificationCodeVerifiedAt: Date | null;

  @OneToOne(() => UserGames, (ug) => ug.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  games: UserGames;

  @OneToMany(() => NotificationEntity, (m) => m.user, {
    cascade: true,
  })
  mails: NotificationEntity[];

  @OneToMany(() => RoomChatMessageEntity, (cm) => cm.author, {
    cascade: true,
  })
  roomChatMessages: RoomChatMessageEntity[];

  static createFromUserDto(createUserDto: CreateUserDto): User {
    return new User(createUserDto);
  }

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  async update({ password, oldPassword }: UpdateUserDto): Promise<void> {
    if (password) {
      await this.changePassword({ password, oldPassword });
    }
  }

  setResetPasswordVerificationCode(verificationCode: string): void {
    if (
      this.resetPasswordVerificationCodeSentAt &&
      !DateUtils.checkIfTimePassed({
        fromDate: this.resetPasswordVerificationCodeSentAt,
        secondsToPass: ONE_MINUTE_IN_S,
      })
    ) {
      const toDate = new Date(this.resetPasswordVerificationCodeSentAt);
      toDate.setSeconds(toDate.getSeconds() + ONE_MINUTE_IN_S);

      throw new TooManyRequestsException(
        DateUtils.countTimeDifferenceInSeconds({
          fromDate: new Date(),
          toDate,
        }),
      );
    }

    this.resetPasswordVerificationCode = verificationCode;
    this.resetPasswordVerificationCodeSentAt = new Date();
    this.resetPasswordVerificationCodeVerifiedAt = null;
  }

  validateResetPasswordVerificationCode(verificationCode: string): boolean {
    if (
      this.resetPasswordVerificationCodeVerifiedAt &&
      !DateUtils.checkIfTimePassed({
        fromDate: this.resetPasswordVerificationCodeVerifiedAt,
        secondsToPass: TEN_SECONDS_IN_S,
      })
    ) {
      const toDate = new Date(this.resetPasswordVerificationCodeVerifiedAt);
      toDate.setSeconds(toDate.getSeconds() + TEN_SECONDS_IN_S);

      throw new TooManyRequestsException(
        DateUtils.countTimeDifferenceInSeconds({
          fromDate: new Date(),
          toDate,
        }),
      );
    }

    this.resetPasswordVerificationCodeVerifiedAt = new Date();

    return this.resetPasswordVerificationCode === verificationCode;
  }

  async changePassword({
    password,
    oldPassword,
  }: {
    password: string;
    oldPassword: string;
  }): Promise<void> {
    const isOldPasswordValid = await UtilsService.validateHash(
      oldPassword,
      this.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException();
    }

    this.password = password;
  }

  changePasswordWithoutValidation(password: string): void {
    this.password = password;
  }
}
