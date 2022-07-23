import { SetMetadata } from '@nestjs/common';

export const ROOM_OWNER_ONLY = Symbol('ROOM_OWNER_ONLY');

export const RoomOwnerOnly = () => SetMetadata(ROOM_OWNER_ONLY, true);
