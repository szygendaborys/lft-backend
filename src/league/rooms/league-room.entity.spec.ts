import {
  createLeagueRoom,
  createLeagueRoomApplication,
} from '../../../test/utils/league.utils';
import { RIOT_API_POSITIONS } from '../riotApi/riotApi.config';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';

describe('League room entity unit tests', () => {
  describe('Current players unit tests', () => {
    it('Should calculate properly (no players)', () => {
      const leagueRoom = createLeagueRoom({
        applications: [],
      });

      expect(leagueRoom.currentPlayers).toBe(0);
    });

    it('Should calculate properly one player', () => {
      const leagueRoom = createLeagueRoom({
        applications: [
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          }),
        ],
      });

      expect(leagueRoom.currentPlayers).toBe(1);
    });

    it('Should calculate properly (no players one rejected, left and one pending)', () => {
      const leagueRoom = createLeagueRoom({
        applications: [
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
          }),
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
          }),
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
          }),
        ],
      });

      expect(leagueRoom.currentPlayers).toBe(0);
    });
  });
  describe('Required players unit tests', () => {
    it('Should calculate properly (no players)', () => {
      const leagueRoom = createLeagueRoom({
        applications: [],
        demandedPositions: [],
      });

      expect(leagueRoom.requiredPlayers).toBe(0);
    });

    it('Should calculate properly one player - approved', () => {
      const leagueRoom = createLeagueRoom({
        demandedPositions: [],
        applications: [
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          }),
        ],
      });

      expect(leagueRoom.requiredPlayers).toBe(1);
    });

    it('Should calculate properly one player - one position', () => {
      const leagueRoom = createLeagueRoom({
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
        applications: [],
      });

      expect(leagueRoom.requiredPlayers).toBe(1);
    });

    it('Should calculate properly (one rejected, left, pending and one approved + one demanding position = 2)', () => {
      const leagueRoom = createLeagueRoom({
        demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
        applications: [
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
            appliedForPosition: RIOT_API_POSITIONS.ADC,
          }),
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
          }),
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
          }),
          createLeagueRoomApplication({
            status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
          }),
        ],
      });

      expect(leagueRoom.requiredPlayers).toBe(2);
    });
  });
});
