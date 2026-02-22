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
 * バリデーションはフォーム層（_schemas）で完結しているため、ここでは省略
 * ビジネスフロー制御とリポジトリ呼び出しに専念
 */
export class CreatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  /**
   * Person作成処理を実行
   * @param input - フォーム層でバリデーション済みの入力データ
   */
  async execute(input: CreatePersonInput): Promise<CreatePersonResult> {
    try {
      // フォーム層で既にバリデーション済みのため、ここでは省略
      // 必要に応じてビジネスルール（例: 重複チェック）のみ実行

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
