import { Controller, Get } from '@nestjs/common';
import {DataRestoreService} from './data-restore.service'

@Controller('data-restore')
export class DataRestoreController {
    constructor(private dataRestoreService: DataRestoreService) {}

    @Get()
    async dataRestore() {
        return this.dataRestoreService.dataRestore()
    }
}