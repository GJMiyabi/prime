# 現在のシステム状況分析レポート
## B. データライフサイクル & C. 可用性の本丸

**作成日**: 2026年2月23日  
**対象システム**: Web Frontend + NestJS Backend  
**分析者**: システムアーキテクト

---

## 📊 総合評価サマリー

| カテゴリ | 実装状況 | 成熟度 | リスクレベル | 優先度 |
|---------|---------|--------|-------------|--------|
| **データ分類** | ❌ 0% | Level 0 | 🔴 高 | 🔥 最高 |
| **保存期間・削除** | ⚠️ 30% | Level 1 | 🔴 高 | 🔥 最高 |
| **バックアップ管理** | ❌ 0% | Level 0 | 🟠 中 | ⚡ 高 |
| **テナント分離** | ⚠️ 40% | Level 1 | 🟡 低～中 | 📌 中（B2B時🔴高） |
| **RTO/RPO** | ❌ 0% | Level 0 | 🟠 中 | ⚡ 高 |
| **DR（災害復旧）** | ❌ 0% | Level 0 | 🟠 中 | ⚡ 高 |
| **インシデント対応** | ⚠️ 20% | Level 1 | 🟠 中 | 📌 中 |
| **変更管理** | ⚠️ 10% | Level 0 | 🟡 低 | 📋 低 |

**総合成熟度**: **Level 0.5 / 5.0** （エンタープライズ要件未充足）

---

## 🔍 B. データライフサイクル（プライバシー/コンプラの中核）

### B-1. データ分類（PII/機微/業務機密） ❌ **0% 実装**

#### 現状分析

```prisma
// 現在のスキーマ（抜粋）
model Person {
  id        String   @id @default(uuid())
  name      String                          // ⚠️ PII（個人識別情報）
  contacts  ContactAddress[]                // ⚠️ PII（メール・電話・住所）
  ...
}

model ContactAddress {
  id       String  @id @default(uuid())
  type     ContactType
  value    String                           // ⚠️ PII（メール・電話・住所の実値）
  ...
}

model Account {
  id           String    @id @default(uuid())
  username     String    @unique            // ⚠️ PII
  password     String                       // ⚠️ Sensitive（ハッシュ済み）
  email        String?                      // ⚠️ PII
  ...
}
```

**問題点**:
1. ✗ **データ分類タグが存在しない** - どのフィールドがPII/機微情報か不明確
2. ✗ **GDPR Article 30記録（RoPA）作成不可** - 処理活動記録に必要な分類情報がない
3. ✗ **暗号化対象の優先順位付けができない** - 何を最優先で保護すべきか基準がない
4. ✗ **アクセス制御の粒度設計不可** - どのデータに誰がアクセス可能か定義できない

#### 必要な対策

1. **データ分類基準の策定**
   ```markdown
   | 分類 | 定義 | 例 | 保護レベル |
   |------|------|-----|----------|
   | Public | 公開情報 | 会社概要、公開API仕様 | L0 |
   | Internal | 内部情報 | 業務資料、開発ドキュメント | L1 |
   | Confidential | 機密情報 | 契約書、財務情報 | L2 |
   | PII | 個人識別情報 | 氏名、メール、電話、住所 | L3 |
   | Sensitive PII | 機微個人情報 | 医療情報、思想、犯罪歴 | L4 |
   ```

2. **Prismaスキーマへのアノテーション追加**
   ```prisma
   model Person {
     id        String   @id @default(uuid())
     /// @pii 氏名は個人識別情報
     /// @gdpr Article 6(1)(b) - 契約履行に必要
     name      String   
     
     /// @pii 連絡先は個人識別情報
     contacts  ContactAddress[]
   }
   
   model Account {
     /// @sensitive ハッシュ化済みパスワード
     /// @encryption required
     password     String
     
     /// @pii メールアドレス
     /// @gdpr Article 6(1)(a) - 同意に基づく
     email        String?
   }
   ```

3. **自動分類スキャンツール導入**
   - Microsoft Presidio / AWS Macie相当
   - 正規表現 + NLPでPII自動検知

**実装コスト**: 中（2週間）  
**ビジネスインパクト**: 極大（GDPR/SOC2必須）

---

### B-2. 保存期間（Retention）と削除（Deletion） ⚠️ **30% 実装**

#### 現状分析

**実装済み**:
- ✅ 物理削除API（`deletePerson`）
  ```typescript
  @Mutation('deletePerson')
  @Roles(PrincipalKind.ADMIN) // ADMINのみ削除可能
  async deletePerson(id: string): Promise<boolean> {
    await this.personInputport.delete(id);
    return true;
  }
  ```

**未実装**:
- ✗ **論理削除（Soft Delete）機能** - 誤削除からの復旧不可
- ✗ **保存期間ポリシー** - どのデータをいつまで保持するか未定義
- ✗ **自動削除（Auto-Purge）** - 期限切れデータの自動削除なし
- ✗ **削除証跡（Audit Trail）** - 誰がいつ何を削除したか記録なし
- ✗ **カスケード削除制御** - 関連データの削除動作が未定義

#### 危険な実装例（現状）

```typescript
// ⚠️ 問題: 即座に物理削除、復旧不可
await prisma.person.delete({ where: { id } });

// ⚠️ 問題: 関連データのカスケード動作が不明
// Principal/Accountが残留する可能性
```

#### Prisma schemaの問題

```prisma
model Principal {
  personId  String   @unique
  person    Person   @relation(fields: [personId], references: [id])
  // ⚠️ onDelete: Cascade が未指定
  // ⚠️ 外部キー制約違反の可能性
}

model ContactAddress {
  personId String?
  person   Person? @relation(fields: [personId], references: [id])
  // ⚠️ onDelete動作が未定義
}
```

#### 必要な対策

1. **Retention Policy策定**
   ```yaml
   retention_policy:
     active_users:
       period: unlimited
       condition: "lastLoginAt < 90 days"
       action: send_warning_email
     
     inactive_users:
       period: 180_days
       condition: "lastLoginAt < 180 days"
       action: soft_delete
     
     soft_deleted:
       period: 30_days
       condition: "deletedAt < 30 days"
       action: hard_delete
     
     audit_logs:
       period: 7_years  # SOC2/ISO27001要件
       action: archive_to_cold_storage
   ```

2. **論理削除実装**
   ```prisma
   model Person {
     id          String    @id @default(uuid())
     name        String
     deletedAt   DateTime? // NULL = アクティブ
     deletedBy   String?   // 削除実行者のPrincipalId
     deleteReason String?  // 削除理由（GDPR要求等）
     
     @@index([deletedAt]) // 論理削除フィルター用
   }
   ```

3. **カスケード削除制御**
   ```prisma
   model Principal {
     personId String @unique
     person   Person @relation(
       fields: [personId], 
       references: [id],
       onDelete: Cascade  // Person削除時にPrincipalも削除
     )
   }
   
   model ContactAddress {
     personId String?
     person   Person? @relation(
       fields: [personId],
       references: [id],
       onDelete: SetNull  // Person削除時にpersonIdをNULLに
     )
   }
   ```

4. **GDPR削除権（Right to Erasure）実装**
   ```typescript
   @Mutation('requestDeletion')
   @UseGuards(GqlAuthGuard)
   async requestDeletion(
     @CurrentUser() user: JwtPayload,
     @Args('reason') reason?: string
   ): Promise<DeletionRequestResult> {
     // 1. 削除リクエスト記録
     const request = await this.prisma.deletionRequest.create({
       data: {
         principalId: user.sub,
         requestedAt: new Date(),
         reason: reason || 'GDPR Article 17',
         status: 'PENDING',
       },
     });
     
     // 2. 30日以内の処理義務
     // 3. 関連データの完全削除
     // 4. バックアップからの削除（90日後）
     
     return { 
       requestId: request.id,
       scheduledDeletionAt: addDays(new Date(), 30),
       message: 'Deletion scheduled within 30 days'
     };
   }
   ```

**実装コスト**: 中（2-3週間）  
**ビジネスインパクト**: 極大（GDPR Article 17必須）

---

### B-3. バックアップからの削除要件 ❌ **0% 実装**

#### 現状分析

**現在のバックアップ戦略**: ❌ **未定義**

```yaml
# docker-compose.yml
volumes:
  db_data:  # ⚠️ ローカルボリュームのみ、バックアップなし
```

**問題点**:
1. ✗ **自動バックアップが存在しない** - データ損失リスク大
2. ✗ **PITR（Point-in-Time Recovery）不可** - 任意時点への復旧不可
3. ✗ **バックアップからのデータ削除手順なし** - GDPR違反リスク
4. ✗ **バックアップ保持期間未定義** - コンプライアンス要件未充足

#### GDPR問題（よくある落とし穴）

```
ユーザー: 「GDPRに基づき私のデータを削除してください」
    ↓
システム: 本番DBから削除完了
    ↓
【問題】バックアップには30日/90日/365日分のデータが残存
    ↓
監査: 「バックアップから復元したら削除済みユーザーが復活する」
    ↓
GDPR違反: 最大2千万ユーロまたは全世界売上の4%の制裁金
```

#### 必要な対策

1. **バックアップ戦略策定**
   ```yaml
   backup_strategy:
     full_backup:
       frequency: daily
       time: "02:00 UTC"
       retention: 30_days
       storage: "s3://bucket/backups/full/"
     
     incremental_backup:
       frequency: hourly
       retention: 7_days
       storage: "s3://bucket/backups/incremental/"
     
     wal_archiving:  # WAL = Write-Ahead Log
       enabled: true
       retention: 7_days
       pitr_window: 7_days  # 7日前までの任意時点に復旧可能
   ```

2. **削除マーカーのバックアップ戦略**
   ```typescript
   // アプローチ1: 削除マーカーを残す（推奨）
   // - バックアップから復元してもdeletedAt!=NULLで除外
   // - 90日後に物理削除（バックアップ保持期間経過後）
   
   model Person {
     deletedAt   DateTime?
     purgeAfter  DateTime?  // 物理削除予定日
   }
   
   // 毎日実行するバッチ
   async function purgeExpiredData() {
     const now = new Date();
     
     // 論理削除から90日経過（バックアップ世代が切れた）
     await prisma.person.deleteMany({
       where: {
         purgeAfter: { lte: now }
       }
     });
   }
   ```

3. **利用規約での明示**
   ```markdown
   ## データ削除に関する重要事項
   
   お客様のデータ削除要求に対し、以下の手順で対応します：
   
   1. **即時削除**: 本番環境から30日以内に削除
   2. **バックアップ**: 最大90日間のバックアップに残存
   3. **完全削除**: 削除要求から90日後に全てのバックアップから消去
   
   技術的理由: バックアップの性質上、段階的削除となります。
   法的根拠: GDPR Recital 66（技術的実現可能性の範囲内での対応）
   ```

**実装コスト**: 中（自動バックアップ1週間、削除手順1週間）  
**ビジネスインパクト**: 大（データ保護とコンプライアンス）

---

### B-4. テナント分離（B2B向け） ⚠️ **40% 実装**

#### 現状分析

**実装済み**:
- ✅ `organizationId`フィールド存在
  ```prisma
  model Person {
    organizationId String?
    organization   Organization? @relation(...)
    @@index([organizationId])
  }
  ```

**未実装**:
- ✗ **Row-Level Security（RLS）** - すべてのクエリに強制フィルターなし
- ✗ **クロステナントアクセス防止** - 誤って他社データ取得可能
- ✗ **テナントスコープ強制** - アプリケーション側での実装漏れリスク
- ✗ **テナント分離の統合テスト** - クロステナント試行のテストなし

#### 危険な実装例（現状）

```typescript
// ⚠️ 問題: organizationIdフィルターを忘れるとクロステナント発生
async function getPerson(id: string) {
  return prisma.person.findUnique({
    where: { id }
    // ⚠️ organizationId のチェックがない！
  });
}

// ⚠️ 他社のPersonを取得できてしまう
const otherCompanyPerson = await getPerson('uuid-of-competitor-person');
```

#### 必要な対策

1. **Prisma Middleware による強制フィルター**
   ```typescript
   // すべてのクエリに organizationId を自動付与
   prisma.$use(async (params, next) => {
     const tenantId = getCurrentTenantId(); // リクエストコンテキストから取得
     
     if (TENANT_MODELS.includes(params.model)) {
       if (params.action === 'findUnique' || params.action === 'findFirst') {
         params.args.where = {
           ...params.args.where,
           organizationId: tenantId,
         };
       }
       
       if (params.action === 'findMany') {
         params.args.where = {
           ...params.args.where,
           organizationId: tenantId,
         };
       }
     }
     
     return next(params);
   });
   ```

2. **PostgreSQL Row-Level Security**
   ```sql
   -- RLS有効化
   ALTER TABLE "Person" ENABLE ROW LEVEL SECURITY;
   
   -- ポリシー設定（アプリケーションユーザーIDでフィルター）
   CREATE POLICY tenant_isolation ON "Person"
     USING ("organizationId" = current_setting('app.current_tenant')::text);
   
   -- クエリ実行前に設定
   SET LOCAL app.current_tenant = 'org-123';
   SELECT * FROM "Person";  -- 自動的に organizationId='org-123' でフィルター
   ```

3. **統合テストでの検証**
   ```typescript
   describe('テナント分離', () => {
     it('他社のPersonにアクセスできない', async () => {
       // 組織Aのユーザー
       const userA = await loginAs('org-a-user');
       
       // 組織Bのデータ
       const personB = await createPerson('org-b-person', 'org-b-id');
       
       // ❌ 組織AのユーザーがBのデータ取得を試行
       const result = await getPerson(personB.id, userA.token);
       
       expect(result).toBeNull(); // アクセス不可
     });
   });
   ```

**実装コスト**: 高（3-4週間、全クエリ修正必要）  
**ビジネスインパクト**: 極大（B2B展開時、データ漏洩の最大リスク）

---

## 🔥 C. "可用性"の本丸（障害対応の設計）

### C-1. RTO/RPO（復旧目標） ❌ **0% 定義**

#### 現状分析

**現在の状態**: ❌ **RTO/RPO未定義**

**問題点**:
1. ✗ **障害時の復旧目標がない** - どれだけの停止が許容されるか不明
2. ✗ **データロスの許容範囲が不明** - どこまで巻き戻りが許されるか未定義
3. ✗ **SLA（Service Level Agreement）設定不可** - 顧客に保証できる稼働率が提示できない

#### エンタープライズ標準の目標値

| サービスTier | RTO（復旧時間） | RPO（データロス） | 年間停止許容 | 必要技術 |
|-------------|----------------|------------------|-------------|---------|
| **Critical** | < 1時間 | < 15分 | 52.6分（99.99%） | Multi-AZ, Auto-failover |
| **High** | < 4時間 | < 1時間 | 8.77時間（99.9%） | スタンバイDB, 自動バックアップ |
| **Standard** | < 24時間 | < 24時間 | 87.7時間（99%） | 日次バックアップ |

#### 必要な対策

1. **RTO/RPO定義書の作成**
   ```yaml
   disaster_recovery_objectives:
     production:
       rto: 4_hours    # 4時間以内に復旧
       rpo: 1_hour     # 最大1時間分のデータロスまで許容
       sla: 99.9%      # 年間8.77時間の停止まで許容
       
     staging:
       rto: 24_hours
       rpo: 24_hours
       sla: 95%
   
   # 障害シナリオ別の目標
   failure_scenarios:
     database_corruption:
       rto: 2_hours
       recovery_method: "PITR from WAL backup"
       
     region_failure:
       rto: 4_hours
       recovery_method: "Failover to standby region"
       
     accidental_deletion:
       rto: 1_hour
       recovery_method: "Restore from hourly snapshot"
   ```

2. **実装アーキテクチャ（AWS例）**
   ```
   Primary Region (ap-northeast-1)
   ├── RDS Multi-AZ
   │   ├── Primary Instance
   │   └── Standby Instance (同期レプリケーション)
   ├── Automated Backup (PITR 7日間)
   └── Daily Snapshots (30日保持)
   
   DR Region (us-west-2)
   ├── Read Replica (非同期レプリケーション)
   └── Cross-Region Backup (90日保持)
   ```

**実装コスト**: 低（文書化1週間、実装は既存サービス活用）  
**ビジネスインパクト**: 大（エンタープライズ顧客の必須要件）

---

### C-2. DR（Disaster Recovery）実装 ❌ **0% 実装**

#### 現状分析

**現在の状態**: ❌ **DR計画なし**

```yaml
# 現在のデプロイ構成（推測）
single_region:
  database: ローカルPostgreSQL（Docker）
  application: 単一サーバー
  backup: なし
  
# ⚠️ リスク
risks:
  - データセンター障害で全損
  - 復旧手順が未定義
  - 復旧訓練の実績なし
```

#### 必要な対策

1. **DR戦略の選択**

   | 戦略 | RTO | RPO | コスト | 用途 |
   |------|-----|-----|--------|------|
   | **Backup & Restore** | 24時間+ | 24時間 | 低 | 開発・テスト環境 |
   | **Pilot Light** | 数時間 | 数時間 | 中 | 標準的な本番環境 |
   | **Warm Standby** | < 1時間 | < 1時間 | 高 | 重要な本番環境 |
   | **Multi-Site Active-Active** | < 1分 | < 1分 | 最高 | ミッションクリティカル |

2. **Pilot Light戦略の実装例**
   ```yaml
   # Primary Region（通常稼働）
   primary:
     region: ap-northeast-1
     rds:
       instance: db.t3.medium
       multi_az: true
       backup: automated (7 days)
     ecs:
       service: api-service
       desired: 3
   
   # DR Region（最小構成で待機）
   dr:
     region: us-west-2
     rds:
       read_replica: yes  # プライマリから非同期レプリケーション
       promotion_script: promote-replica.sh
     ecs:
       service: api-service-dr
       desired: 0  # 通常停止、障害時にスケールアップ
   ```

3. **DR Runbook（復旧手順書）**
   ```markdown
   # DR Runbook: Primary Region障害時の復旧手順
   
   ## Phase 1: 検知と意思決定（15分）
   1. アラート受信（CloudWatch / PagerDuty）
   2. 影響範囲の確認
   3. DR発動の意思決定（CTO承認）
   
   ## Phase 2: DR Region へのフェイルオーバー（1時間）
   1. Read ReplicaをPrimaryに昇格
      ```bash
      aws rds promote-read-replica \
        --db-instance-identifier db-dr-replica
      ```
   2. ECS Serviceを起動
      ```bash
      aws ecs update-service \
        --cluster api-cluster-dr \
        --service api-service-dr \
        --desired-count 3
      ```
   3. Route53でDNSを切り替え
      ```bash
      aws route53 change-resource-record-sets \
        --hosted-zone-id Z123... \
        --change-batch file://failover-dns.json
      ```
   
   ## Phase 3: 検証（30分）
   1. ヘルスチェック確認
   2. スモークテスト実行
   3. ユーザー通知
   
   ## Phase 4: 監視（継続）
   1. Primary Region復旧監視
   2. DR Regionの性能監視
   3. フェイルバック計画
   ```

4. **年次DR訓練**
   ```yaml
   dr_drill_schedule:
     frequency: annual
     next_drill: 2026-06-01
     
     scenario_1:
       name: "Primary Region完全障害"
       objective: "4時間以内の完全復旧"
       participants: ["CTO", "SRE", "Backend Team"]
       
     scenario_2:
       name: "データベース破損"
       objective: "PITR復旧（1時間以内）"
   ```

**実装コスト**: 高（初回4-6週間、運用継続コスト中）  
**ビジネスインパクト**: 大（可用性SLA保証、エンタープライズ必須）

---

### C-3. ヘルスチェック ✅ **80% 実装**

#### 現状分析

**実装済み**:
- ✅ Liveness Probe（`/health`）
- ✅ Readiness Probe（`/health/readiness`）
- ✅ 詳細診断（`/health/details`、ADMIN専用）
- ✅ データベース接続チェック
- ✅ メモリ・ディスク使用率チェック
- ✅ パフォーマンスメトリクス

```typescript
@Get('readiness')
@HealthCheck()
checkReadiness(): Promise<HealthCheckResult> {
  return this.health.check([
    () => this.prisma.check('database'),
    () => this.memory.checkHeap('memory_heap', 400 * 1024 * 1024),
    () => this.memory.checkRSS('memory_rss', 800 * 1024 * 1024),
    () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
  ]);
}
```

**良い点**:
- ✅ Kubernetes対応（liveness/readiness分離）
- ✅ メトリクス閾値設定済み
- ✅ 権限制御（詳細診断はADMINのみ）

**改善点**:
- ⚠️ 外部依存サービスのチェックなし（GraphQL upstream等）
- ⚠️ ヘルスチェック失敗時の自動復旧なし

**評価**: ✅ **80% 実装済み、Level 4相当**

---

### C-4. インシデント対応手順 ⚠️ **20% 実装**

#### 現状分析

**実装済み**:
- ✅ Sentryによるエラー自動検知
- ✅ 構造化ログ（NestJS Logger）

**未実装**:
- ✗ **インシデント対応マニュアル** - 障害時の連絡フロー未定義
- ✗ **エスカレーションルール** - 誰にいつ報告するか不明
- ✗ **Post-Mortem（事後検証）プロセス** - 再発防止の仕組みなし
- ✗ **インシデント記録** - 過去の障害履歴が体系化されていない

#### 必要な対策

1. **インシデント対応フロー**
   ```yaml
   incident_response_flow:
     severity_1_critical:
       definition: "全サービス停止、データ損失"
       response_time: 15分以内
       escalation:
         - L1: オンコールエンジニア（即座）
         - L2: SREリーダー（15分）
         - L3: CTO（30分）
         - L4: CEO（1時間、顧客影響大の場合）
       
     severity_2_major:
       definition: "主要機能停止、パフォーマンス劣化"
       response_time: 1時間以内
       escalation:
         - L1: オンコールエンジニア
         - L2: SREリーダー（1時間）
     
     severity_3_minor:
       definition: "一部機能の不具合"
       response_time: 4時間以内
       escalation:
         - L1: 担当エンジニア
   ```

2. **オンコール体制**
   ```yaml
   oncall_schedule:
     rotation: weekly
     shifts:
       weekday: "09:00-18:00 JST"
       night: "18:00-09:00 JST"
       weekend: "24/7"
     
     tools:
       alerting: PagerDuty / Opsgenie
       communication: Slack #incidents
       documentation: Confluence / Notion
   ```

3. **Post-Mortem テンプレート**
   ```markdown
   # インシデント報告書: [タイトル]
   
   ## 基本情報
   - **発生日時**: 2026-02-23 14:32 JST
   - **検知日時**: 2026-02-23 14:35 JST
   - **復旧日時**: 2026-02-23 16:20 JST
   - **影響時間**: 1時間48分
   - **深刻度**: Severity 2 (Major)
   
   ## 影響範囲
   - **影響ユーザー数**: 約1,200名
   - **影響機能**: Person検索API（全体の30%のリクエスト）
   - **ビジネスインパクト**: 売上損失なし、顧客問い合わせ3件
   
   ## 根本原因（Root Cause）
   PostgreSQLの接続プール枯渇（max_connections=100に到達）
   
   ## タイムライン
   - 14:32 - アクセス数急増（通常の3倍）
   - 14:35 - Sentryでタイムアウトエラー検知
   - 14:40 - オンコールエンジニアが対応開始
   - 15:00 - 接続プール設定を200に増加
   - 15:30 - アプリケーション再起動
   - 16:20 - 全機能正常化確認
   
   ## 再発防止策
   1. **即時対応**（完了）:
      - 接続プール上限を200に増加
      - Auto-scaling設定追加
   
   2. **短期対応**（1週間以内）:
      - 接続プール監視アラート追加（80%で警告）
      - スロークエリ検知・最適化
   
   3. **長期対応**（1ヶ月以内）:
      - Read Replica導入（読み取り負荷分散）
      - Connection pooling最適化（PgBouncer導入検討）
   
   ## 学んだこと
   - 接続プール監視が不足していた
   - アクセス急増時の対応手順が未整備だった
   ```

**実装コスト**: 低（文書化1週間、運用定着1ヶ月）  
**ビジネスインパクト**: 中（再発防止、組織成熟度向上）

---

### C-5. 変更管理（Change Management） ⚠️ **10% 実装**

#### 現状分析

**実装済み**:
- ✅ Git履歴（コミット・PR記録）
- ⚠️ GitHub Actions（CI/CD）

**未実装**:
- ✗ **変更承認フロー** - 本番デプロイの承認プロセスなし
- ✗ **変更影響評価** - リスク評価なしでデプロイ可能
- ✗ **ロールバック手順** - デプロイ失敗時の戻し方が未定義
- ✗ **変更記録** - いつ誰が何をデプロイしたか体系的記録なし

#### 必要な対策

1. **変更管理ポリシー**
   ```yaml
   change_management_policy:
     standard_change:  # 定常的な機能追加
       approval: "Tech Lead"
       testing: "CI通過 + Manual QA"
       rollback: "自動（エラー率5%超で自動ロールバック）"
       
     normal_change:  # 通常の変更
       approval: "Tech Lead + SRE"
       testing: "Full regression test"
       deployment_window: "平日 10:00-16:00 JST"
       
     emergency_change:  # 緊急パッチ
       approval: "CTO（事後承認可）"
       testing: "Smoke test"
       deployment_window: "即時（24/7）"
   ```

2. **GitHub Environments活用**
   ```yaml
   # .github/workflows/deploy.yml
   production:
     environment:
       name: production
       url: https://api.example.com
     
     # 必須承認者
     required_reviewers:
       - tech-lead
       - sre-team
     
     # 承認タイムアウト
     wait_timer: 60  # 60分以内に承認必要
     
     # デプロイ可能な時間帯
     deployment_branch_policy:
       protected_branches: true
   ```

3. **デプロイメントチェックリスト**
   ```markdown
   # 本番デプロイ前チェックリスト
   
   ## Pre-Deployment
   - [ ] Feature flagが正しく設定されている
   - [ ] Database migrationがテスト済み
   - [ ] ロールバック手順を確認済み
   - [ ] Monitoring dashboardを開いている
   - [ ] オンコール担当者に通知済み
   - [ ] 顧客への事前通知（必要な場合）
   
   ## During Deployment
   - [ ] Blue-Green deployment実行
   - [ ] Health checkが全てGreen
   - [ ] Error rateが正常範囲内（<0.1%）
   - [ ] Latency p99が正常範囲内（<500ms）
   
   ## Post-Deployment
   - [ ] Smoke test実行・成功確認
   - [ ] 10分間の監視（エラー・性能）
   - [ ] デプロイ記録を記入
   - [ ] 変更チケットをClose
   ```

**実装コスト**: 低（文書化1週間、GitHub Environments設定1日）  
**ビジネスインパクト**: 中（本番安定性向上、監査対応）

---

## 📋 総合対策ロードマップ（優先順位順）

### 🔥 Phase 1: 最優先（0-4週間）

| 施策 | 目的 | 実装コスト | ビジネスインパクト |
|------|------|-----------|-------------------|
| 1. データ分類基準策定 | GDPR/SOC2対応の基盤 | 中（2週間） | 極大 |
| 2. 論理削除実装 | 誤削除からの保護 | 中（2週間） | 大 |
| 3. RTO/RPO定義書作成 | DR計画の基盤 | 低（1週間） | 大 |
| 4. バックアップ戦略策定 | データ保護 | 低（1週間） | 大 |

**成果物**: データライフサイクル基盤確立、DR計画書初版

### ⚡ Phase 2: 高優先度（4-12週間）

| 施策 | 目的 | 実装コスト | ビジネスインパクト |
|------|------|-----------|-------------------|
| 5. GDPR削除権実装 | 法的要件充足 | 中（3週間） | 極大 |
| 6. 自動バックアップ実装 | データ損失防止 | 中（2週間） | 大 |
| 7. Pilot Light DR構築 | 障害復旧可能性 | 高（4週間） | 大 |
| 8. インシデント対応マニュアル | 障害時の迅速対応 | 低（1週間） | 中 |

**成果物**: GDPR準拠、DR実装、インシデント対応体制

### 📌 Phase 3: 中優先度（12-24週間）

| 施策 | 目的 | 実装コスト | ビジネスインパクト |
|------|------|-----------|-------------------|
| 9. テナント分離（RLS） | B2B展開準備 | 高（4週間） | 大（B2B時） |
| 10. 変更管理プロセス | 本番安定性向上 | 低（1週間） | 中 |
| 11. DR訓練実施 | 復旧手順検証 | 中（年1回） | 中 |

**成果物**: マルチテナント対応、変更管理体制、DR訓練実績

---

## 🎯 現時点での推奨アクション

### 即座に着手すべき3つ（今週中）

1. **データ分類マトリックス作成**
   - Person.name, Account.email 等をPIIと明示
   - 1日で完成可能

2. **RTO/RPO定義（暫定版）**
   - 目標: RTO=4時間、RPO=1時間
   - バックアップ戦略の前提条件

3. **論理削除の設計書作成**
   - Prisma schema修正案
   - マイグレーション計画

### 1ヶ月以内に完了すべき項目

- データ分類基準の正式策定
- 論理削除の実装・テスト
- 自動バックアップの構築（S3 + pg_dump）
- インシデント対応フローの文書化

### 3ヶ月以内の目標

- GDPR削除権の完全実装
- Pilot Light DR構築
- バックアップからの削除手順確立
- DR訓練の初回実施

---

**結論**: 現在のシステムは「Level 0.5 / 5.0」の成熟度であり、エンタープライズ要件を満たしていません。ただし、明確なロードマップに従って段階的に実装することで、6ヶ月以内に「Level 3.0」（エンタープライズ対応可能）に到達可能です。

最優先は「データライフサイクルの基盤整備」と「可用性の文書化」です。
