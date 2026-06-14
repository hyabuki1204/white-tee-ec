import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | WHITE TEE",
  description: "WHITE TEE プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <section className="space-y-4">
        <h2 className="text-neutral-800">個人情報の取り扱い</h2>
        <p>
          WHITE
          TEE（以下「当店」）は、お客様の個人情報を適切に管理し、以下の方針に基づき取り扱います。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">収集する情報</h2>
        <p>
          氏名、メールアドレス、配送先住所、決済情報（Stripe
          経由）など、注文処理に必要な情報を収集します。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">利用目的</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>商品の発送・決済処理</li>
          <li>お問い合わせへの対応</li>
          <li>サービス改善のための分析（個人を特定しない形式）</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">第三者提供</h2>
        <p>
          決済処理（Stripe）、配送（配送業者）など、サービス提供に必要な範囲でのみ第三者と共有します。法令に基づく場合を除き、同意なく第三者に提供することはありません。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">お問い合わせ</h2>
        <p>
          個人情報に関するご請求は、Contact ページよりご連絡ください。
        </p>
      </section>
    </LegalPageLayout>
  );
}
