import { IPersonInputPort, AdminPersonCreateDto, PersonOutputDto } from './input-port';
import { IPersonCommandRepository, IPersonQueryRepository } from 'src/domains/repositories/person.repositories';
import { IPrincipalQueryRepository, IPrincipalCommandRepository } from 'src/domains/repositories/principal.repositories';
import { IAccountQueryRepository, IAccountCommandRepository } from 'src/domains/repositories/account.repositories';
import { IContactAddressQueryRepository, IContactAddressCommandRepository } from 'src/domains/repositories/contract-address.repositories';
export declare class PersonInteractor implements IPersonInputPort {
    private readonly personCommandRepository;
    private readonly personQueryRepository;
    private readonly principalQueryRepository;
    private readonly principalCommandRepository;
    private readonly accountCommandRepository;
    private readonly accountQueryRepository;
    private readonly contactAddressQueryRepository;
    private readonly contactAddressCommandRepository;
    constructor(personCommandRepository: IPersonCommandRepository, personQueryRepository: IPersonQueryRepository, principalQueryRepository: IPrincipalQueryRepository, principalCommandRepository: IPrincipalCommandRepository, accountCommandRepository: IAccountCommandRepository, accountQueryRepository: IAccountQueryRepository, contactAddressQueryRepository: IContactAddressQueryRepository, contactAddressCommandRepository: IContactAddressCommandRepository);
    createAdmin(input: AdminPersonCreateDto): Promise<AdminPersonCreateDto>;
    find(id: string): Promise<PersonOutputDto | undefined>;
    delete(id: string): Promise<void>;
}
