import { Type } from "class-transformer";
import { Client } from "../../clients/entities/client.entity";
import { Professional } from "../../professionals/entities/professional.entity";
import { IsNumber, IsString, ValidateNested, IsUUID } from "class-validator";
import { PaymentMethod } from "../../general_resources/entities/payment_method.entity";

export class CreateAppointmentDto {

    @IsString()
    date: string; 

    @IsString()
    location: string;

    @IsString()
    hour: string;

    @IsString()
    service: string;

    @ValidateNested()
    @Type(() => Client)
    client: Client

    @ValidateNested()
    @Type(() => Professional)
    professional: Professional
    
    @ValidateNested()
    @Type(() => PaymentMethod)
    payment_method: PaymentMethod
}

