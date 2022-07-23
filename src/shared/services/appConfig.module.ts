import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app.config';

@Global()
@Module({
  providers: [
    {
      provide: AppConfig,
      useFactory: (configService: ConfigService) => {
        return AppConfig.load(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AppConfig],
})
export class AppConfigModule {}
