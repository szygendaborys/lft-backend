import { ApiProperty } from '@nestjs/swagger';

export class RoomChatMessageDto {
  @ApiProperty()
  author: string;

  @ApiProperty({ format: 'uuid' })
  authorId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: number;
}
