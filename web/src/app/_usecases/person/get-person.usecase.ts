// ユースケース層：Person取得ビジネスロジック

import {
  IPersonRepository,
  PersonIncludeOptions,
} from "../../_repositories/person.repository";
import { GetPersonData } from "../../_types/person";

/**
 * Person取得ユースケースの結果
 */
export interface GetPersonResult {
  success: boolean;
  person?: GetPersonData["person"];
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
    include?: PersonIncludeOptions
  ): Promise<GetPersonResult> {
    try {
      // バリデーション
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: "IDは必須です。",
        };
      }

      // リポジトリを通じてPerson取得APIを呼び出す
      const person = await this.personRepository.findById(id, include);

      if (!person) {
        return {
          success: false,
          error: "Personが見つかりませんでした。",
        };
      }

      return {
        success: true,
        person,
      };
    } catch (error) {
      console.error("Get person use case error:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Personの取得に失敗しました。",
      };
    }
  }
}
