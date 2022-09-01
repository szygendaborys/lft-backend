import { ApiProperty } from '@nestjs/swagger';

export class RoomChatMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  author: string;

  @ApiProperty({ format: 'uuid' })
  authorId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: number;
}
