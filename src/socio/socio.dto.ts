import { IsString, IsEmail, IsDateString, IsNotEmpty } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsDateString()
  @IsNotEmpty()
  readonly birthdate: Date;
}
