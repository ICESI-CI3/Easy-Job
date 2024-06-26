import {BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException} from '@nestjs/common';
import {CreateProfessionalDto} from './dto/create-professional.dto';
import {UpdateProfessionalDto} from './dto/update-professional.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {Professional} from './entities/professional.entity';
import {Repository} from 'typeorm';
import {isUUID} from 'class-validator';
import {Service} from './entities/service.entity';
import {ServiceService} from './service.service';
import {Speciality} from './entities/speciality.entity';
import {SpecialityService} from './speciality.service';
import {City} from "../general_resources/entities/city.entity";
import { LanguageService } from '../general_resources/services/language.service';
import { CityService } from '../general_resources/services/city.service';

@Injectable()
export class ProfessionalsService {

  private readonly logger = new Logger('ProfessionalService');


  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
    @InjectRepository(City)
    private readonly CityRepository: Repository<City>,
    private readonly serviceService: ServiceService,
    private readonly specialityService: SpecialityService,
    private readonly languageService: LanguageService,
    private readonly cityService: CityService
  ) {}

    async create(createProfessionalDto: CreateProfessionalDto) {
      const professional =  this.professionalRepository.create(createProfessionalDto);
      console.log("este es el serviceId " + createProfessionalDto.service_id + '\n este es el language_id ' + createProfessionalDto.language_id + "\n este es el city_id" + createProfessionalDto.city_id + "\n este es el speciality_id " + createProfessionalDto.speciality_id);
      const service = await this.serviceService.findOne(createProfessionalDto.service_id);
      const language = await this.languageService.findOne(createProfessionalDto.language_id);
      const city = await this.cityService.findOne(createProfessionalDto.city_id);
      const speciality = await this.specialityService.findOne(createProfessionalDto.speciality_id);

      professional.services = professional.services || [];
      professional.languages = professional.languages || [];
      professional.cities = professional.cities || [];
      professional.specialities = professional.specialities || [];

      professional.services.push(service);
      professional.languages.push(language);
      professional.cities.push(city);
      professional.specialities.push(speciality);
      await this.professionalRepository.save(professional);

      return professional;
    }

  findAll(limit:number, offset:number) {
    limit = 10 
    offset= 0
    
    return this.professionalRepository.find({
      take: limit, 
      skip: offset
    });
  }

  async findOne(name_professional: string) {

    let professional: Professional;
    
    professional = await this.professionalRepository.findOneBy({ id: name_professional});
    
    if(!professional){
      throw new NotFoundException(`Professional with ${name_professional} not found`)
    }

    return professional;

  }

  async addServiceToProfessional(id_professional: string, id_service: string ) {
    let professional: Professional;
    let service: Service;

    if(isUUID(id_professional) && isUUID(id_service)){
      professional = await this.findOne(id_professional);
      service =  await this.serviceService.findOne(id_service);
    }
    
    const services = await this.findServices(id_professional)

    if(!professional.services)
      professional.services = []
    
    professional.services.push(...services);
    professional.services.push(service)


    await this.professionalRepository.save(professional)

    return professional;
    
  }
  
  async addSpecialityToProfessional(id_professional: string, id_speciality: string) {
    let professional: Professional;
    let speciality: Speciality;

    if(isUUID(id_professional) && isUUID(id_speciality)){
      professional = await this.findOne(id_professional);
      speciality = await this.specialityService.findOne(id_speciality);
    }

    const specialities = await this.findSpecialities(id_professional)

    if(!professional.specialities)
      professional.specialities = []

    professional.specialities.push(...specialities)
    professional.specialities.push(speciality);

    await this.professionalRepository.save(professional)

    return professional.services
  }

  async addCityToProfessional(id_professional: string, id_city: string) {
    let professional: Professional;
    let city: City;

    if(isUUID(id_professional) && isUUID(id_city)){
      professional = await this.findOne(id_professional);
      city = await this.CityRepository.findOneBy({id:id_city});
    }

    const cities = await this.findCities(id_professional);
    if(!professional.cities)
      professional.cities = []

    professional.cities.push(...cities);
    professional.cities.push(city);

    await this.professionalRepository.save(professional)

    return professional;
  }

  async findServices(id_professional:string){
    return await this.serviceRepository.createQueryBuilder('service')
        .innerJoin("service.professionals", "professional")
        .where("professional.id = :id", {id: id_professional})
        .getMany()
  }

  async findSpecialities(id_professional: string){
    return await this.specialityRepository.createQueryBuilder('speciality')
        .innerJoin('speciality.professionals', 'professional')
        .where('professional.id = :id', {id: id_professional})
        .getMany()
  }

  async findByCity(city_name:string){
    return await this.professionalRepository
        .createQueryBuilder('professional')
        .innerJoin('professional.cities', 'city')
        .where('city.city_name = :name', {name: city_name})
        .getMany()
  }

  async findCities(id_professional:string){
    return await this.CityRepository
        .createQueryBuilder('city')
        .innerJoin('city.professionals', 'professional')
        .where('professional.id = :id', {id: id_professional})
        .getMany();
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto) {
    const professional = await this.professionalRepository.preload({
      id: id,
      ... updateProfessionalDto
    });

    if ( !professional ) throw new NotFoundException(`Professional with id: ${ id } not found`);

    try {
      await this.professionalRepository.save( professional );
      return professional;
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const professional = await this.findOne(id);
    await this.professionalRepository.remove(professional);
  }

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
