import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ClientsService } from '../clients/clients.service';
import { ProfessionalsService } from '../professionals/professionals.service';

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
    
    const review = this.reviewRepository.create(createReviewDto);
    console.log(id_client)
    const client = await this.clientService.findOne(id_client);
    
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


  async remove(id: string) {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async getReviewsByProfessional(id_professional: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { professional: { id: id_professional } },
      relations: ['client'],
    });
  }
}