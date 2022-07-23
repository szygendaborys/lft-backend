export const RIOT_API_BASE_URL = '.api.riotgames.com';
export const RIOT_API_SECRET_HEADER_NAME = 'X-Riot-Token';

export enum RIOT_API_REGIONS {
  BR1 = 'br1',
  EUNE = 'eun1',
  EUW1 = 'euw1',
  JP1 = 'jp1',
  KR = 'kr',
  LA1 = 'la1',
  LA2 = 'la2',
  NA1 = 'na1',
  OC1 = 'oc1',
  TR1 = 'tr1',
  RU = 'ru',
}

export enum RIOT_API_ENDPOINTS {
  SUMMONER_BY_NAME = '/lol/summoner/v4/summoners/by-name',
  SUMMONER_BY_ID = '/lol/summoner/v4/summoners/by-account',
  RANKED_BY_ID = '/lol/league/v4/entries/by-summoner',
}

export enum RIOT_API_QUEUE_TYPES {
  RANKED_FLEX = 'RANKED_FLEX_SR',
  RANKED_SOLOR = 'RANKED_SOLO_5x5',
}

export enum RIOT_API_RANKED_TIERS {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  GRANDMASTER = 'GRANDMASTER', // ?? CHECK
  MASTER = 'MASTER', // ? CHECK
  CHALLENGER = 'CHALLENGER', // ? CHECK
}

export enum RIOT_API_RANKS {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export enum RIOT_API_POSITIONS {
  TOP = 'Top',
  JUNGLE = 'Jungle',
  MIDDLE = 'Middle',
  ADC = 'AD Carry',
  SUPPORT = 'Support',
}
