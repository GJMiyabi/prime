// ユースケース層：Person作成ビジネスロジック

import {
  IPersonRepository,
  CreatePersonInput,
} from "../../_repositories/person.repository";
import { SinglePerson } from "../../_types/person";

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
          error: "名前は必須です。",
        };
      }

      if (!input.value || input.value.trim().length === 0) {
        return {
          success: false,
          error: "値は必須です。",
        };
      }

      // リポジトリを通じてPerson作成APIを呼び出す
      const person = await this.personRepository.create(input);

      if (!person) {
        return {
          success: false,
          error: "Personの作成に失敗しました。",
        };
      }

      return {
        success: true,
        person,
      };
    } catch (error) {
      console.error("Create person use case error:", error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Personの作成に失敗しました。",
      };
    }
  }
}
