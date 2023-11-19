import { IsString, IsEmail, IsDate, IsNotEmpty } from 'class-validator';

export class SocioDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsDate()
  @IsNotEmpty()
  readonly birthdate: Date;
}
