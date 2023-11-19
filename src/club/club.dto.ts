import {
  IsString,
  IsDate,
  IsOptional,
  IsUrl,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class ClubDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsDate()
  readonly foundationDate: Date;

  @IsOptional()
  @IsUrl()
  readonly image?: string;

  @IsString()
  @Length(0, 100)
  readonly description: string;
}
