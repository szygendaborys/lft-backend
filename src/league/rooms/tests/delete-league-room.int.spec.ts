import { INestApplication, HttpStatus } from '@nestjs/common';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import {
  compileTestingModule,
  init,
  clearSchema,
  makeRequest,
  authHeaderJwt,
} from '../../../../test/test.module';
import { saveUserGames } from '../../../../test/utils/games.utils';
import {
  saveLeagueUser,
  saveLeagueRoom,
  saveLeagueRoomApplication,
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

describe('Remove league room integration tests', () => {
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

  describe('DELETE /api/v1/league/rooms/:roomId', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${roomId}`;

    it('403 - user did not belong to the room', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
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
        .delete(getRoute(leagueRoom.id))
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

    it('204 - room deleted', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const deletedRoom = await getRepository(LeagueRoom).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(deletedRoom).toBeUndefined();
    });

    it('204 - all approved applications are left', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const ownerApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne();

      const rejectedApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const leftApplications = await getRepository(
        LeagueRoomApplication,
      ).find();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(leftApplications).toHaveLength(2);
      expect(leftApplications).toMatchObject([
        expect.objectContaining({
          id: ownerApplication.id,
          status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        }),
        expect.objectContaining({
          id: rejectedApplication.id,
          status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        }),
      ]);
    });

    it('204 - all pending applications are rejected', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const pendingApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const rejectedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(pendingApplication.id);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(rejectedApplication).toMatchObject({
        id: pendingApplication.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
      });
    });
  });

  describe('DELETE /api/v1/league/rooms/:roomId/me', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${roomId}/me`;

    it('403 - user did not belong to the room', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('204 - user not a league owner - left', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });
      const application = await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: false,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const savedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(application.id);
      const savedLeagueRoom = await getRepository(LeagueRoom).findOne(
        leagueRoom.id,
      );

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedApplication).toMatchObject({
        id: application.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
      });
      expect(
        savedLeagueRoom.demandedPositions.includes(
          savedApplication.appliedForPosition,
        ),
      ).toBeTruthy();
    });

    it('204 - not a league owner rest of approved applications left in the same state', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      });
      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: false,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        appliedForPosition: RIOT_API_POSITIONS.ADC,
      });

      const notRejectedApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        appliedForPosition: RIOT_API_POSITIONS.SUPPORT,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const unchangedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(notRejectedApplication.id);

      const savedLeagueRoom = await getRepository(LeagueRoom).findOne(
        leagueRoom.id,
      );

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(
        savedLeagueRoom.demandedPositions.includes(
          unchangedApplication.appliedForPosition,
        ),
      ).toBeFalsy();
      expect(unchangedApplication).toMatchObject({
        id: notRejectedApplication.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });
    });

    it('204 - not a league owner all of pending applications kept in the same state', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      });

      await saveLeagueRoomApplication({
        leagueUser,
        room: leagueRoom,
        isOwner: false,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const notRejectedApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        appliedForPosition: RIOT_API_POSITIONS.JUNGLE,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const unchangedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(notRejectedApplication.id);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(unchangedApplication).toMatchObject({
        id: notRejectedApplication.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      });
    });

    it('204 - is league room owner = room deleted', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const deletedRoom = await getRepository(LeagueRoom).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(deletedRoom).toBeUndefined();
    });

    it('204 - is league room owner = all approved applications are left', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const ownerApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne();

      const rejectedApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const leftApplications = await getRepository(
        LeagueRoomApplication,
      ).find();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(leftApplications).toHaveLength(2);
      expect(leftApplications).toMatchObject([
        expect.objectContaining({
          id: ownerApplication.id,
          status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        }),
        expect.objectContaining({
          id: rejectedApplication.id,
          status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        }),
      ]);
    });

    it('204 - is league room owner = all pending applications are rejected', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const pendingApplication = await saveLeagueRoomApplication({
        room: leagueRoom,
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      });

      const res = await makeRequest(app)
        .delete(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const rejectedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne(pendingApplication.id);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(rejectedApplication).toMatchObject({
        id: pendingApplication.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
      });
    });
  });
});
