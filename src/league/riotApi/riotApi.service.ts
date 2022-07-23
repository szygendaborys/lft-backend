import {
  BadRequestException,
  HttpException,
  HttpService,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { AppConfig } from '../../shared/services/app.config';
import {
  RIOT_API_BASE_URL,
  RIOT_API_ENDPOINTS,
  RIOT_API_REGIONS,
  RIOT_API_SECRET_HEADER_NAME,
} from './riotApi.config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  RiotApiRankedDataBySummonerIdDto,
  RiotApiSummonerResponseDto,
} from './dto/riotApiResponses.dto';
import { HttpLogger } from '../../shared/loggers/http.logger';
import { RiotApiUnavailableException } from './riot-api-unavailable.exception';

@Injectable()
export class RiotApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfig,
    private readonly logger: HttpLogger,
  ) {}

  async fetchAccount(
    region: RIOT_API_REGIONS,
    summonerName: string,
  ): Promise<RiotApiSummonerResponseDto> {
    const url = this.buildURL(region, RIOT_API_ENDPOINTS.SUMMONER_BY_NAME);

    const { data } = await this.makeRequest<RiotApiSummonerResponseDto>({
      method: 'GET',
      url: `${url}/${summonerName}`,
      headers: this.getHeaders(),
    });

    return data;
  }

  async fetchAccountBySummonerId(
    region: RIOT_API_REGIONS,
    summonerId: string,
  ): Promise<RiotApiSummonerResponseDto> {
    const url = this.buildURL(region, RIOT_API_ENDPOINTS.SUMMONER_BY_ID);

    const { data } = await this.makeRequest<RiotApiSummonerResponseDto>({
      method: 'GET',
      url: `${url}/${summonerId}`,
      headers: this.getHeaders(),
    });

    return data;
  }

  async fetchPlayerRankedInfo(
    region: RIOT_API_REGIONS,
    summonerId: string,
  ): Promise<RiotApiRankedDataBySummonerIdDto[]> {
    const url = this.buildURL(region, RIOT_API_ENDPOINTS.RANKED_BY_ID);

    const { data } = await this.makeRequest<RiotApiRankedDataBySummonerIdDto[]>(
      {
        method: 'GET',
        url: `${url}/${summonerId}`,
        headers: this.getHeaders(),
      },
    );

    return data;
  }

  private getHeaders(): Record<string, string> {
    return {
      [RIOT_API_SECRET_HEADER_NAME]: this.appConfig.riotApi.key,
    };
  }

  private buildURL(
    region: RIOT_API_REGIONS,
    endpoint: RIOT_API_ENDPOINTS,
  ): string {
    return `https://${region}${RIOT_API_BASE_URL}${endpoint}`;
  }

  private async makeRequest<T>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      this.logger.log({ method: config.method, route: config.url });
      return await this.httpService.request(config).toPromise();
    } catch (err) {
      const errData = err?.response?.data?.status;

      this.logger.error({
        method: config.method,
        route: config.url,
        trace: errData,
      });

      if (errData && errData.message && errData.status_code) {
        throw new HttpException(errData.message, errData.status_code);
      }

      throw new RiotApiUnavailableException();
    }
  }
}
