import { Controller, Get, Body, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserAdminDto} from './dtos/registerUser.dto'
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // role based registration for user and admin 

    @Post('register-user')
    async registerUser(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUser(body.email, body.password)
    }

    @Post('register-admin')
    async registerAdmin(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerAdmin(body.email, body.password)
    }


    // user category based registration for patients and medical professionals

    @Post('register-user-patient')
    async registerUserPatient(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUserPatient(body.email, body.password)
    }

    @Post('register-user-medic')
    async registerUserMedicalProvider(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUserMedicalProvider(body.email, body.password)

    }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() request, @Response() response) {
        const user = request.user;
        const cookie = await this.authService.putJwtInCookieOnLogin(user.id)
        response.setHeader('Set-Cookie', cookie)
        return response.send(user)
    }
}
