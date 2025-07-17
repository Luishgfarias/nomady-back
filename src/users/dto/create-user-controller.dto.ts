import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserControllerDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}