export abstract class IUserInputPort {
  abstract save(input: UserSaveInputDto): Promise<UserOutputDto>;

  abstract findOne(id: string): Promise<UserOutputDto | undefined>;
}

export type UserSaveInputDto = {
  readonly email: string;
  readonly name: string;
  readonly password: string;
};

export type UserOutputDto = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
};
