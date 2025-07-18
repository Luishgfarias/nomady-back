import { IsUUID } from "class-validator";

export class uuidDto {
  @IsUUID()
  id: string;
}
