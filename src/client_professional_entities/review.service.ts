import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Appointment } from './entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Client } from 'src/clients/entities/client.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { ClientsService } from 'src/clients/clients.service';
import { ProfessionalsService } from 'src/professionals/professionals.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger('ReviewService');

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>, 
    private readonly clientService: ClientsService, 
    private readonly professionalService: ProfessionalsService
  ) {}

  async create(id_client: string, id_review: string, createReviewDto: CreateReviewDto) {
    const review =  this.reviewRepository.create(createReviewDto);
    const client = await  this.clientService.findOne(id_client);
    const professional = await this.professionalService.findOne(id_review);

    review.client = client;
    review.professional = professional;

    await this.reviewRepository.save(review);

    return review;
  }

  findAll( paginationDto: PaginationDto ) {
    const {limit = 10, offset= 0} = paginationDto;

    return this.reviewRepository.find({
      take: limit, 
      skip: offset,
    })

  }

  async findOne(id_review: string) {

    let review: Review;

    if(isUUID(id_review)){
      review = await this.reviewRepository.findOneBy({id: id_review});
    }

    if(!review){
      throw new NotFoundException(`Review with ${id_review} not found`)
    }

    return review;
  }

  // async update(id: string, updateReviewDto: UpdateReviewDto) {
  //   const review = await this.reviewRepository.preload({
  //     id: id,
  //     ...updateReviewDto
  //   });

  //   if ( !review ) throw new NotFoundException(`Review with id: ${ id } not found`);

  //   try {
  //     await this.reviewRepository.save( review );
  //     return review;
      
  //   } catch (error) {
  //     this.handleDBExceptions(error);
  //   }
  // }

  async remove(id: string) {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  // private handleDBExceptions( error: any ) {

  //   if ( error.code === '23505' )
  //     throw new BadRequestException(error.detail);
    
  //   this.logger.error(error)
  //   // console.log(error)
  //   throw new InternalServerErrorException('Unexpected error, check server logs');

  // }
}