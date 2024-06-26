import { IsEmail, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';


export class CreateClientDto {

    @IsString()
    name:string;

    @IsString()
    last_name:string;

    @IsEmail()
    @IsString()
    email:string;

    @IsString()
    @IsOptional()
    phone_number:string;

    @IsString()
    @IsOptional()
    photo_url: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

}
