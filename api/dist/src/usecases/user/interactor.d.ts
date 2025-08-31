import { UserSaveInputDto, UserOutputDto } from './input-port';
import { IUserCommandRepository, IUserQueryRepository } from 'src/domains/repositories/user.repositories';
import { IUserInputPort } from './input-port';
export declare class UserInteractor implements IUserInputPort {
    private readonly userCommandRepository;
    private readonly userQueryRepository;
    constructor(userCommandRepository: IUserCommandRepository, userQueryRepository: IUserQueryRepository);
    save(input: UserSaveInputDto): Promise<UserOutputDto>;
    findOne(id: string): Promise<UserOutputDto | undefined>;
}
