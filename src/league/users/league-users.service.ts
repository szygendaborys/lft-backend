import { Injectable } from '@nestjs/common';
import { UserGamesNotFoundException } from '../../games/userGamesNotFound.exception';
import { UserRepository } from '../../users/user.repository';
import { UserNotFoundException } from '../../users/user-not-found.exception';
import { UsersContext } from '../../users/users.context';
import { RiotLeagueUserNotFoundException } from '../riotApi/riot-league-user-not-found.exception';
import { RiotApiService } from '../riotApi/riotApi.service';
import { CreateLeagueUserDto } from './dto/create-league-user.dto';
import { UpdateLeagueUserDto } from './dto/update-league-user.dto';
import { LeagueUserAlreadyCreatedException } from './exceptions/league-user-already-created.exception';
import { LeagueUserNotFoundException } from './exceptions/league-user-not-found.exception';
import { LeagueUser } from './league-user.entity';
import { LeagueUserRepository } from './league-user.repository';
import { PositionMustDifferException } from './position-must-differ.exception';

@Injectable()
export class LeagueUsersService {
  constructor(
    private readonly riotApiService: RiotApiService,
    private readonly leagueUserRepository: LeagueUserRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  async saveOne({
    summonerName,
    region,
    mainPosition,
    secondaryPosition,
  }: CreateLeagueUserDto): Promise<LeagueUser> {
    const { userId } = UsersContext.get();

    const [{ accountId }, user] = await Promise.all([
      this.riotApiService.fetchAccount(region, summonerName),
      this.usersRepository.findOneById(userId),
    ]);
    const userGames = user?.games;

    if (mainPosition === secondaryPosition) {
      throw new PositionMustDifferException();
    }

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!accountId) {
      throw new RiotLeagueUserNotFoundException();
    }

    if (!userGames) {
      throw new UserGamesNotFoundException();
    }

    if (userGames.league_of_legends) {
      throw new LeagueUserAlreadyCreatedException();
    }

    const leagueUser = new LeagueUser({
      summonerId: accountId,
      region,
      mainPosition,
      secondaryPosition,
      userGames,
    });

    return await this.leagueUserRepository.saveOne(leagueUser);
  }

  async updateOne(updateLeagueUserDto: UpdateLeagueUserDto): Promise<void> {
    const { userId } = UsersContext.get();
    const leagueUser = await this.leagueUserRepository.findByUserId(userId);

    const updatedLeagueUser = new LeagueUser({
      ...leagueUser,
      ...updateLeagueUserDto,
    });

    const { accountId } = await this.riotApiService.fetchAccountBySummonerId(
      updatedLeagueUser.region,
      updatedLeagueUser.summonerId,
    );

    if (!accountId) {
      throw new RiotLeagueUserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    if (
      updatedLeagueUser.mainPosition === updatedLeagueUser.secondaryPosition
    ) {
      throw new PositionMustDifferException();
    }

    updatedLeagueUser.setSummonerId(accountId);

    await this.leagueUserRepository.saveOne(updatedLeagueUser);
  }

  async deleteLeagueUserEntity(): Promise<void> {
    const { userId } = UsersContext.get();
    const leagueUser = await this.leagueUserRepository.findByUserId(userId);

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    await this.leagueUserRepository.removeLeagueUser(leagueUser);
  }
}
