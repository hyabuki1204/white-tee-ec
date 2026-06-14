import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | WHITE TEE",
  description: "WHITE TEE 利用規約",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <section className="space-y-4">
        <h2 className="text-neutral-800">第1条（適用）</h2>
        <p>
          本規約は、WHITE TEE
          が提供するオンラインショップの利用条件を定めるものです。ご注文時点で本規約に同意したものとみなします。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">第2条（注文）</h2>
        <p>
          ご注文は、当店による受注確認メールの送信をもって成立します。在庫切れ等によりご注文をお受けできない場合があります。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">第3条（価格・支払い）</h2>
        <p>
          表示価格は税込です。お支払いは Stripe
          経由のクレジットカード等で行います。決済完了後、発送手続きに進みます。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-neutral-800">第4条（返品・キャンセル）</h2>
        <p>
          返品・交換条件は Shipping & Returns
          ページに記載のとおりです。発送前のキャンセルは Contact
          よりご連絡ください。
        </p>
      </section>
    </LegalPageLayout>
  );
}
