import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
} from '../../../../test/test.module';
import { saveUserGames } from '../../../../test/utils/games.utils';
import {
  getRandomApplicationStatus,
  saveLeagueRoom,
  saveLeagueRoomApplication,
  saveLeagueUser,
} from '../../../../test/utils/league.utils';
import { saveUser } from '../../../../test/utils/user.utils';
import { UserGames } from '../../../games/userGames.entity';
import { User } from '../../../users/user.entity';
import { LeagueModule } from '../../league.module';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';
import { LeagueUser } from '../../users/league-user.entity';
import { LeagueRoom } from '../league-room.entity';
import { LeagueRoomApplication } from './league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';

describe('League room application integration tests', () => {
  let app: INestApplication;

  let user: User;
  let userGames: UserGames;
  let leagueUser: LeagueUser;

  beforeAll(async () => {
    const module = await compileTestingModule([LeagueModule]);

    app = await init(module);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await clearSchema();

    user = await saveUser();
    userGames = await saveUserGames({ user });
    leagueUser = await saveLeagueUser({ userGames });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH - handle application', () => {
    const getRoute = (
      roomId = faker.datatype.uuid(),
      applicationId = faker.datatype.uuid(),
    ) => `/api/v1/league/rooms/${roomId}/applications/${applicationId}`;

    const invalidPayloads = [
      {
        toStatus: faker.datatype.string(),
      },
      {},
      undefined,
    ];

    it.each(invalidPayloads)('422', async (invalidPayload) => {
      const leagueRoom = await saveLeagueRoom({
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(invalidPayload);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it.each([
      LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
      LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
    ])('422 - unhandled status', async (invalidStatus) => {
      const leagueRoom = await saveLeagueRoom({
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const application = await saveLeagueRoomApplication({ room: leagueRoom });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: invalidStatus,
        });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('404 - no application existing', async () => {
      const leagueRoom = await saveLeagueRoom({
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('404 - application belongs to the different room', async () => {
      const leagueRoom = await saveLeagueRoom({
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const application = await saveLeagueRoomApplication();

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('403 - not a league room owner', async () => {
      const leagueRoom = await saveLeagueRoom({
        applications: [],
      });

      const application = await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: false,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: getRandomApplicationStatus(),
        });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('401', async () => {
      const res = await makeRequest(app).patch(getRoute());
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('400 - application does not relate to currently available positions', async () => {
      const leagueRoom = await saveLeagueRoom({
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const application = await saveLeagueRoomApplication({
        room: leagueRoom,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
    it('204 - approved league user application', async () => {
      const leagueRoom = await saveLeagueRoom({
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const application = await saveLeagueRoomApplication({
        room: leagueRoom,
        appliedForPosition: RIOT_API_POSITIONS.JUNGLE,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        });

      const savedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(application.id);

      const savedLeagueRoom = await getRepository(LeagueRoom).findOne({
        relations: ['applications'],
      });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedApplication).toMatchObject({
        id: application.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });
      expect(savedLeagueRoom).toMatchObject({
        id: leagueRoom.id,
        demandedPositions: [],
      });
      expect(savedLeagueRoom.currentPlayers).toBe(2);
      expect(savedLeagueRoom.requiredPlayers).toBe(2);
    });

    it('204 - rejected league user application', async () => {
      const leagueRoom = await saveLeagueRoom({
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
        applications: [],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const application = await saveLeagueRoomApplication({
        room: leagueRoom,
        appliedForPosition: RIOT_API_POSITIONS.JUNGLE,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id, application.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          toStatus: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
        });

      const savedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(application.id);
      const savedLeagueRoom = await getRepository(LeagueRoom).findOne({
        relations: ['applications'],
      });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedApplication).toMatchObject({
        id: application.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
      });
      expect(savedLeagueRoom).toMatchObject({
        id: leagueRoom.id,
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      });
      expect(savedLeagueRoom.currentPlayers).toBe(1);
      expect(savedLeagueRoom.requiredPlayers).toBe(2);
    });
  });
});
