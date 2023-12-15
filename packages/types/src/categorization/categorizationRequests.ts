import { IsString } from "class-validator";

export const getCreateCategorizationDto = (ApiPropertySwagger: any) =>{
    const ApiProperty = ApiPropertySwagger || function () {};

    class CreateCategorizationDto{
        @IsString()
        @ApiProperty()
        genus: string

        @IsString()
        @ApiProperty()
        family: string

        @IsString()
        @ApiProperty()
        kingdom: string

        @IsString()
        @ApiProperty()
        domain: string

        @IsString()
        @ApiProperty()
        phylum: string

        @IsString()
        @ApiProperty()
        order: string
       
        @IsString()
        @ApiProperty()
        class: string

    }   

    return CreateCategorizationDto
}

export const getCategorizationQuery = (ApiPropertySwagger: any) =>{
    const ApiProperty = ApiPropertySwagger || function () {};

    class CategorizationQuery{
        @IsString()
        @ApiProperty()
        genus: string

        @IsString()
        @ApiProperty()
        kingdom: string

        @IsString()
        @ApiProperty()
        domain: string

        @IsString()
        @ApiProperty()
        phylum: string

        @IsString()
        @ApiProperty()
        order: string
       
        @IsString()
        @ApiProperty()
        class: string

    }   

    return CategorizationQuery
}
