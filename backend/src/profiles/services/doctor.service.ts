import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose'
import {Model} from 'mongoose'
import {Doctor, DoctorDocument} from '../schemas/doctor.schema'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {OnEvent} from '@nestjs/event-emitter'
import {NewMedicalProviderEvent} from '../../events/createMedicalProviderProfile.event'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {UsersService} from '../../users/users.service'
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RemoveDoctorEvent } from '../../events/removeDoctorFromDepartment.event';

import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {User} from '../../users/users.schema'
import {Action} from '../../enums/action.enum'
import {S3} from 'aws-sdk'



@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        private usersService: UsersService,
        private eventEmitter: EventEmitter2,
        private caslAbilityFactory: CaslAbilityFactory
    ) {}

    @OnEvent('new.user.medic')
    async createDoctorProfile(payload: NewMedicalProviderEvent) {
        const doctor = new this.doctorModel({
            user: payload.user, 
            firstName: payload.firstName, 
            lastName: payload.lastName, 
            email: payload.email,
            hierarchy: payload.hierarchy, 
            department: payload.department
        })
        return doctor.save()
    }

    async getDoctorProfiles() {
        const doctors  = await this.doctorModel.find().exec()
        if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
        return doctors
    }

    async getDoctorProfileById(_id:string) {
        const doctor = await this.doctorModel.findOne({'_id':_id}).exec()
        if (!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }

    // this function searches names with regular expressions
    async searchDoctorsByFirstAndLastNames(firstName?:string, lastName?:string) {
        if (firstName) { 
            let doctors = await this.doctorModel.find({'firstName': { "$regex": firstName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }else if (lastName) {
            let doctors = await this.doctorModel.find({'lastName': { "$regex": lastName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }

        else if (firstName && lastName) {
            let doctors = await this.doctorModel.find({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }

    }


    // this method uploads a file to the Elixir.io bucket
    async uploadProfileAvatar(body: Buffer, fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Key: fileName, Body: body}
        return s3.upload(params).promise()
    }

    async deleteProfileAvatar(fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Delete: {Objects: [ {Key: fileName} ]}}
        s3.deleteObjects(params)
    }

    // async getFileNameOfDoctorUploadedAvatar(email: string) {
    //     const doctor = await this.doctorModel.findOne({'email': email})
    //     const doctorImageFileName = doctor.imageUrl.split('elixir.io/')[1]
    // }

    async editDoctorProfileAvatar(email: string, body: Buffer, fileName: string) {
        const doctor = await this.doctorModel.findOne({'email': email})
        // getting the filename from the image url of doctor profile
        const doctorImageFileName = doctor.imageUrl.split('elixir.io/')[1]

        // deleting the image from s3
        await this.deleteProfileAvatar(doctorImageFileName)

        // uploading a new file
        await this.uploadDoctorProfileAvatar(email, body, fileName)
    }


    async uploadDoctorProfileAvatar(email: string, body: Buffer, fileName: string) {

        const imageLocation = await (await this.uploadProfileAvatar(body, fileName)).Location
        await this.doctorModel.updateOne({email: email}, {'imageUrl': imageLocation})

    }

    // doctor profile update with authorization with CASL
    async editBasicDoctorProfileById(_id:string, attrs: Pick<Doctor, 'age' | 'address' | 'telephone' | 'maritalStatus' | 'specialties' | 'certificates' | 'yearsOfExperience' | 'languages' >, user: User) {
        const ability = this.caslAbilityFactory.createForUser(user)

        const doctor = await this.getDoctorProfileById(_id)
        // const doctor = await this.doctorModel.findOne({'_id': _id})

        console.log(ability.can(Action.Update, doctor))

        if( ability.can(Action.Update, doctor) || ability.can(Action.Manage, 'all') ) {
            Object.assign(doctor, attrs)
            return doctor.save()
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.BAD_REQUEST)
        }
    }


    async deleteDoctorsProfiles() {
        await this.doctorModel.deleteMany().exec()
    }


    // this deletes the user model tied to the doctor profile
    // this should be executed first before 'this.deleteDoctorByNamesDepartmentAndHierarchy()' method
    // async deleteUserLinkedToDoctorProfile(firstName: string, lastName: string, department: MedicalDepartments, hierarchy: DoctorHierarchy) {
    //     const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
    //     const doctorUserObjectID = doctor['user']
    //     await this.usersService.deleteUserByID(doctorUserObjectID)
    // }


    // this will be used in the medical department service when a doctor cannot be added to a department
    async deleteDoctorByNamesDepartmentAndHierarchy(firstName: string, lastName: string, department: MedicalDepartments, hierarchy: DoctorHierarchy) {

        // this deletes the user model tied to the doctor profile
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
        const doctorUserObjectID = doctor['user']
        console.log(doctorUserObjectID)
        await this.usersService.deleteUserByID(doctorUserObjectID)

        // emitting the data that will be used to delete a member from a department
        this.eventEmitter.emit('remove.doctor', new RemoveDoctorEvent(firstName, lastName, department, hierarchy))

        // deletes doctor profile
        await this.doctorModel.deleteOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
    }

}
