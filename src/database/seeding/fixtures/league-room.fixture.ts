import { LeagueRoom } from '../../../league/rooms/league-room.entity';
import * as faker from 'faker';
import { RIOT_API_POSITIONS } from '../../../league/riotApi/riotApi.config';
import { takeRandomElement } from '../../../../test/utils/test.utils';

const numberOfLeagueRooms = 10;

export const initialLeagueRooms: LeagueRoom[] = [];

export function createArrayOfAllAvailablePositions(): RIOT_API_POSITIONS[] {
  return [
    RIOT_API_POSITIONS.ADC,
    RIOT_API_POSITIONS.JUNGLE,
    RIOT_API_POSITIONS.MIDDLE,
    RIOT_API_POSITIONS.SUPPORT,
    RIOT_API_POSITIONS.TOP,
  ];
}

for (let i = 0; i < numberOfLeagueRooms; i++) {
  const availablePositions = createArrayOfAllAvailablePositions();

  const demandedPositionsNumber = faker.datatype.number({ min: 1, max: 4 });
  let demandedPositions = [];

  for (let i = 0; i < demandedPositionsNumber; i++) {
    demandedPositions.push(takeRandomElement(availablePositions));
  }

  initialLeagueRooms.push(
    new LeagueRoom({
      description: faker.random.words(5),
      date: faker.date.future(),
      demandedPositions,
      applications: [],
    }),
  );
}
