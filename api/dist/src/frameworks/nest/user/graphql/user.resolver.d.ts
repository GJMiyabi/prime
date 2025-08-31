import { IUserInputPort, UserSaveInputDto } from 'src/usecases/user/input-port';
export declare class UserMutationResolver {
    private readonly userInputPort;
    constructor(userInputPort: IUserInputPort);
    saveUser(input: UserSaveInputDto): Promise<{
        id: string;
        email: string;
        name: string;
        __type: string;
    }>;
}
export declare class UserQueryResolver {
    private readonly userInputPort;
    constructor(userInputPort: IUserInputPort);
    findOne(input: string): Promise<{
        id?: string | undefined;
        email?: string | undefined;
        name?: string | undefined;
        __type: string;
    }>;
}
