import { BadRequestException } from "@nestjs/common";

export class PositionMustDifferException extends BadRequestException {
    constructor() {
        super(`Positions must be different.`);
    }
}