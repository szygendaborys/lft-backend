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
import { LeagueRoomApplication } from '../applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../applications/league-room-applications.config';
import { LeagueRoom } from '../league-room.entity';

describe('Update league room integration tests', () => {
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

  describe('PATCH /api/v1/league/rooms/:roomId', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${roomId}`;

    const invalidEntries = [
      {
        description: faker.datatype.number(),
        demandedPositions: [
          RIOT_API_POSITIONS.JUNGLE,
          RIOT_API_POSITIONS.MIDDLE,
        ],
        date: faker.date.future(),
      },
      {
        description: faker.random.words(),
        demandedPositions: [faker.datatype.string()],
        date: faker.date.future(),
      },
      {
        description: faker.random.words(),
        demandedPositions: RIOT_API_POSITIONS.JUNGLE,
        date: faker.date.future(),
      },
      {
        description: faker.random.words(),
        demandedPositions: [
          RIOT_API_POSITIONS.JUNGLE,
          RIOT_API_POSITIONS.MIDDLE,
        ],
        date: faker.date.past(),
      },
    ];

    it.each(invalidEntries)('422', async (invalidEntry) => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(invalidEntry);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('404 - changed ownership but invalid new owner id', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
        owner: leagueUser,
      });

      const given = {
        ownerId: faker.datatype.uuid(),
      };

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('403 - user did not belong to the room', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('403 - user not a league owner', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });
      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: false,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('401', async () => {
      const res = await makeRequest(app).patch(getRoute()).set({
        Authorization: 'Fake',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('400 - trying to add already existing position in application', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.ADC],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.JUNGLE,
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
          demandedPositions: [
            RIOT_API_POSITIONS.ADC,
            RIOT_API_POSITIONS.JUNGLE,
          ],
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('204', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [],
        demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
      });
      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const given = {
        description: faker.random.words(),
        demandedPositions: [
          RIOT_API_POSITIONS.JUNGLE,
          RIOT_API_POSITIONS.MIDDLE,
        ],
        date: faker.date.future(),
      };

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const savedLeagueRoom = await getRepository(LeagueRoom).findOne({
        relations: ['applications'],
      });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedLeagueRoom).toMatchObject({
        id: leagueRoom.id,
        description: given.description,
        region: leagueRoom.region,
        demandedPositions: given.demandedPositions,
        date: given.date,
      });
      expect(savedLeagueRoom.currentPlayers).toBe(1);
      expect(savedLeagueRoom.requiredPlayers).toBe(3);
    });

    it('204 - pending applications to be rejected', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [],
        demandedPositions: [
          RIOT_API_POSITIONS.SUPPORT,
          RIOT_API_POSITIONS.JUNGLE,
        ],
      });

      const ownerApplication = await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: true,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const rejectedApplication = await saveLeagueRoomApplication({
        appliedForPosition: RIOT_API_POSITIONS.SUPPORT,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        room: leagueRoom,
      });

      const pendingApplication = await saveLeagueRoomApplication({
        appliedForPosition: RIOT_API_POSITIONS.JUNGLE,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        room: leagueRoom,
      });

      const given = {
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      };

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const savedLeagueRoom = await getRepository(LeagueRoom).findOne({
        relations: ['applications'],
      });
      const savedApplications = await getRepository(
        LeagueRoomApplication,
      ).find();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedLeagueRoom).toMatchObject({
        id: leagueRoom.id,
        description: leagueRoom.description,
        region: leagueRoom.region,
        demandedPositions: given.demandedPositions,
      });
      expect(savedLeagueRoom.currentPlayers).toBe(1);
      expect(savedLeagueRoom.requiredPlayers).toBe(2);
      expect(savedApplications).toHaveLength(3);
      expect(savedApplications).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            id: ownerApplication.id,
            appliedForPosition: ownerApplication.appliedForPosition,
            status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
            isOwner: true,
          }),
          expect.objectContaining({
            id: rejectedApplication.id,
            appliedForPosition: rejectedApplication.appliedForPosition,
            status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
            isOwner: false,
          }),
          expect.objectContaining({
            id: pendingApplication.id,
            appliedForPosition: pendingApplication.appliedForPosition,
            status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
            isOwner: false,
          }),
        ]),
      );
    });

    it('204 - changed ownership', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [],
        demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
        owner: leagueUser,
      });

      const previousOwnerApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne();

      const ownerToBeApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const given = {
        ownerId: ownerToBeApplication.leagueUser.id,
      };

      const res = await makeRequest(app)
        .patch(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const savedLeagueRoom = await getRepository(LeagueRoom).findOne({
        relations: ['applications'],
      });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedLeagueRoom).toMatchObject({
        id: leagueRoom.id,
        applications: expect.arrayContaining([
          expect.objectContaining({
            id: previousOwnerApplication.id,
            isOwner: false,
          }),
          expect.objectContaining({
            id: ownerToBeApplication.id,
            isOwner: true,
          }),
        ]),
      });
    });
  });
});
