import { IPersonInputPort, AdminPersonCreateDto } from 'src/usecases/person/input-port';
export declare class PersonMutationResolver {
    private readonly personInputport;
    constructor(personInputport: IPersonInputPort);
    saveAdminUser(input: AdminPersonCreateDto): Promise<{
        id?: string;
        name: string;
        value: string;
        type: import("../../../domains/type/contact").ContactType;
        __type: string;
    }>;
    deletePerson(id: string): Promise<boolean>;
}
export declare class PersonQueryResolver {
    private readonly personInputPort;
    constructor(personInputPort: IPersonInputPort);
    findPerson(id: string): Promise<{
        id?: string | undefined;
        name?: string | undefined;
        principal?: import("../../../domains/entities/principal").Principal;
        contactAddress?: import("../../../domains/entities/contact-address").ContactAddress[];
        account?: import("../../../domains/entities/account").Account;
        __type: string;
    }>;
}
