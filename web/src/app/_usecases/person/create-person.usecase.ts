// ユースケース層：Person作成ビジネスロジック

import {
  IPersonRepository,
  CreatePersonInput,
} from "../../_repositories/person.repository";
import { SinglePerson } from "../../_types/person";
import { ERROR_MESSAGES } from "../../_constants/error-messages";

/**
 * Person作成ユースケースの結果
 */
export interface CreatePersonResult {
  success: boolean;
  person?: SinglePerson;
  error?: string;
}

/**
 * Person作成ユースケース
 */
export class CreatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  /**
   * Person作成処理を実行
   */
  async execute(input: CreatePersonInput): Promise<CreatePersonResult> {
    try {
      // バリデーション
      if (!input.name || input.name.trim().length === 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.PERSON.NAME_REQUIRED,
        };
      }

      if (!input.value || input.value.trim().length === 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.PERSON.VALUE_REQUIRED,
        };
      }

      // リポジトリを通じてPerson作成APIを呼び出す
      const person = await this.personRepository.create(input);

      if (!person) {
        return {
          success: false,
          error: ERROR_MESSAGES.PERSON.CREATE_FAILED,
        };
      }

      return {
        success: true,
        person,
      };
    } catch (error) {
      // エラーログはここで一元的に記録
      console.error("[CreatePersonUseCase] Error:", {
        input,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : ERROR_MESSAGES.PERSON.CREATE_FAILED,
      };
    }
  }
}
