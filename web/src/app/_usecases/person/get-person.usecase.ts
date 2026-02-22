// ユースケース層：Person取得ビジネスロジック

import { logger } from "../../_lib/logger";
import {
  IPersonRepository,
  PersonIncludeOptions,
} from "../../_repositories/person.repository";
import { QueryOptions } from "../../_types/repository";
import { Person } from "../../_types/person";
import { ERROR_MESSAGES } from "../../_constants/error-messages";

/**
 * Person取得ユースケースの結果
 */
export interface GetPersonResult {
  success: boolean;
  person?: Person;
  error?: string;
}

/**
 * Person取得ユースケース
 */
export class GetPersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  /**
   * Person取得処理を実行
   */
  async execute(
    id: string,
    include?: PersonIncludeOptions,
    options?: QueryOptions
  ): Promise<GetPersonResult> {
    try {
      // バリデーション
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.PERSON.ID_REQUIRED,
        };
      }

      // リポジトリを通じてPerson取得APIを呼び出す
      const person = await this.personRepository.findById(id, include, options);

      if (!person) {
        return {
          success: false,
          error: ERROR_MESSAGES.PERSON.NOT_FOUND,
        };
      }

      return {
        success: true,
        person,
      };
    } catch (error) {
      // エラーログはここで一元的に記録
      logger.error("Person取得ユースケースでエラーが発生", {
        component: "GetPersonUseCase",
        action: "execute",
        error,
        meta: { id, include },
      });

      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : ERROR_MESSAGES.PERSON.FETCH_FAILED,
      };
    }
  }
}
