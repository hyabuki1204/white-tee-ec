/** Shared UI copy — quiet, consistent brand voice. Japanese and English side by side. */
import { defineCopy } from "@/lib/i18n/define-copy";
import type { Locale } from "@/lib/i18n/config";
import { getReturnsPolicy } from "@/lib/store-ui/returns-policy";

const returnsJa = getReturnsPolicy("ja");
const returnsEn = getReturnsPolicy("en");

export const getSiteUiCopy = defineCopy(
  {
    nav: {
      fabric: "Fabric",
      products: "Products",
    },
    cart: {
      title: "カート",
      empty: "カートに商品がありません。",
      continue: "買い物を続ける",
      checkout: "レジに進む",
      subtotal: "小計",
      shipping: "送料",
      shippingFree: "無料",
      shippingFlat: "¥600",
      total: "合計",
      taxIncluded: "税込",
      processing: "処理中…",
      remove: "削除",
      unavailable: "在庫なし — 削除してください",
      checkoutFailed: "決済に失敗しました。",
      checkoutBlocked: "在庫切れ商品を削除してください",
      removedUnavailable: (count: number) =>
        `在庫切れの商品 ${count}点をカートから除外しました。`,
      trimmedUnavailable: "在庫数に合わせて数量を調整しました。",
      decreaseQty: "数量を減らす",
      increaseQty: "数量を増やす",
      freeShippingProgress: (remaining: string) =>
        `あと${remaining}で送料無料`,
      freeShippingReached: "送料無料が適用されました",
      shippingNote: returnsJa.shippingNote,
      exploreFabric: "生地について",
      viewProducts: "商品一覧",
    },
    product: {
      selectSize: "サイズを選択",
      selectSizeButton: "サイズを選ぶ",
      addToBag: "カートに入れる",
      addedConfirm: "追加しました",
      outOfStock: "在庫切れ",
      maxInBag: "カート上限",
      cannotAddOutOfStock:
        "このサイズは在庫切れのため、カートに追加できません。",
      maxInBagError: "在庫分はすでにカートに入っています。",
      insufficientStock: (available: number) =>
        `追加できるのはあと${available}点までです。`,
      chooseSize: "サイズをお選びください",
      unavailable: "在庫なし",
      allInBag: "在庫分すべてカートに入っています",
      inBagMore: (inBag: number, more: number) =>
        `カート ${inBag}点 · あと${more}点追加可`,
      added: (size: string, qty?: number) =>
        qty && qty > 1
          ? `${size} · ${qty}点追加しました`
          : `${size} を追加しました`,
      viewBag: "カートを見る",
      size: "サイズ",
      sizeGuide: "サイズガイド",
      qty: "数量",
      qtyLeft: (n: number) => `残り${n}点`,
      sizeSelected: (size: string) => `${size} を選択中`,
      priceUpdated: (price: string) => `価格を ${price} に更新しました`,
      modelCaption: "モデル",
      measurementsLabel: "採寸（cm）",
      scrollHint: "スクロール →",
      plpIntro: "まずゲージから。",
      plpIntroSub: "ゲージ、そしてシルエット。",
      filteredIntro: (fabricName: string) => `${fabricName}。`,
      reassurance: {
        shipping: returnsJa.shipping,
        returns: returnsJa.returns,
        shippingLink: returnsJa.shippingLink,
        helperJa: returnsJa.helperJa,
      },
      gallerySwipeHint: "スワイプ →",
      sizeTableHeaders: ["サイズ", "着丈", "肩幅", "身幅", "袖丈"],
      sizeTableCaption: "サイズガイド（cm）",
      sizeTableExplainer:
        "後ろ首下から裾まで。肩端から肩端。身幅は平置き採寸。",
      taxIncluded: "(税込)",
      sizeAria: (size: string, inStock: boolean) =>
        `サイズ ${size}${inStock ? "" : "、在庫切れ"}`,
      askConcierge: "サイズとゲージを相談する",
    },
    modelFit: {
      sectionLabel: "モデルとフィット",
      modelLine: (heightCm: number, weightKg: number) =>
        `モデル ${heightCm}cm / ${weightKg}kg`,
      wearingSize: (size: string) => `着用サイズ ${size}`,
      modelLineJa: (heightCm: number, weightKg: number, size: string) =>
        `モデル ${heightCm}cm・${weightKg}kg、着用サイズ ${size}`,
      moreModels: "他のモデル",
      sizeHint: "普段のTシャツと同じサイズからお試しください。",
    },
    sizeRecommendation: {
      sectionLabel: "サイズの目安",
      heading: "サイズを探す",
      height: "身長（cm）",
      weight: "体重（kg）",
      preference: "着用の好み",
      preferences: [
        { value: "just-fit" as const, label: "ジャスト" },
        { value: "relaxed" as const, label: "ゆったり" },
        { value: "oversized" as const, label: "オーバーサイズ" },
      ],
      submit: "おすすめを見る",
      disclaimer: "目安です — 体型や着方で異なります。",
      invalidInput: "表示範囲内の身長・体重を入力してください。",
      recommended: (size: string) => `おすすめサイズ：${size}`,
      preferLooser: (size: string) => `ゆったり着たい方は ${size} を。`,
      preferCloser: (size: string) => `よりフィットさせたい方は ${size} を。`,
    },
    fabric: {
      title: "生地",
      introLine: "まずゲージから。",
      introSubline: "28G、36G、46G。厚みと密度が変わります。",
      allFabrics: "すべての生地",
      inThisFabric: "同じ生地",
      thisFabric: "この生地",
      viewAll: "すべての商品",
      exploreFabric: "生地について",
      pieceCount: (count: number) => `${count}点`,
      character: {
        thickness: "厚み",
        softness: "やわらかさ",
        structure: "ハリ",
        sheerness: "透け感",
        surface: "表面感",
      },
      compareTitle: "比較",
      viewFabric: "生地",
    },
    home: {
      selection: "Selection",
      allPieces: "すべての商品",
      exploreFabric: "生地について",
      heroFabricLine: "Knitted in Wakayama.",
    },
    checkout: {
      thankYou: "ご注文ありがとうございます",
      orderConfirmed: "ご注文を確認しました。確認メールをお送りしました。",
      orderId: (id: string) => `注文番号 ${id}`,
      nextSteps: "まもなく商品の準備を開始します。",
      orderSummaryLabel: "ご注文内容",
      paymentPending: "決済確認中",
      paymentUnconfirmed: "決済を確認できませんでした。カートはそのままです。",
      cancelled: "決済がキャンセルされました",
      paymentIncomplete: "決済が完了しませんでした。",
      cancelRecovery: "カートは保存されています。準備ができたらお続けください。",
      backToLastProduct: "閲覧していた商品に戻る",
      backToBag: "カートに戻る",
      continue: "買い物を続ける",
      exploreFabric: "生地について",
      viewProducts: "商品一覧",
    },
    breadcrumbs: {
      home: "Home",
      fabric: "Fabric",
      products: "Products",
    },
    states: {
      notFound: {
        label: "404",
        message: "ページが見つかりません。",
        back: "戻る",
      },
      error: {
        label: "Error",
        message: "問題が発生しました。しばらくしてからお試しください。",
        retry: "再試行",
        back: "戻る",
      },
      loading: "読み込み中",
    },
  },
  {
    nav: {
      fabric: "Fabric",
      products: "Products",
    },
    cart: {
      title: "Bag",
      empty: "Your bag is empty.",
      continue: "Continue shopping",
      checkout: "Checkout",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingFree: "Free",
      shippingFlat: "¥600",
      total: "Total",
      taxIncluded: "tax included",
      processing: "Processing…",
      remove: "Remove",
      unavailable: "Out of stock — please remove",
      checkoutFailed: "Payment could not be started.",
      checkoutBlocked: "Remove the out-of-stock items to continue",
      removedUnavailable: (count: number) =>
        count === 1
          ? "1 out-of-stock item was removed from your bag."
          : `${count} out-of-stock items were removed from your bag.`,
      trimmedUnavailable: "Quantities were adjusted to match stock.",
      decreaseQty: "Decrease quantity",
      increaseQty: "Increase quantity",
      freeShippingProgress: (remaining: string) =>
        `${remaining} more for free shipping`,
      freeShippingReached: "Free shipping applied",
      shippingNote: returnsEn.shippingNote,
      exploreFabric: "About the fabric",
      viewProducts: "All pieces",
    },
    product: {
      selectSize: "Select a size",
      selectSizeButton: "Select size",
      addToBag: "Add to bag",
      addedConfirm: "Added",
      outOfStock: "Out of stock",
      maxInBag: "Bag limit reached",
      cannotAddOutOfStock:
        "This size is out of stock and cannot be added to your bag.",
      maxInBagError: "All available stock is already in your bag.",
      insufficientStock: (available: number) =>
        `You can add ${available} more at most.`,
      chooseSize: "Please select a size",
      unavailable: "Out of stock",
      allInBag: "All available stock is in your bag",
      inBagMore: (inBag: number, more: number) =>
        `${inBag} in bag · ${more} more available`,
      added: (size: string, qty?: number) =>
        qty && qty > 1 ? `${size} · ${qty} added` : `${size} added`,
      viewBag: "View bag",
      size: "Size",
      sizeGuide: "Size guide",
      qty: "Quantity",
      qtyLeft: (n: number) => `${n} left`,
      sizeSelected: (size: string) => `${size} selected`,
      priceUpdated: (price: string) => `Price updated to ${price}`,
      modelCaption: "Model",
      measurementsLabel: "Measurements (cm)",
      scrollHint: "Scroll →",
      plpIntro: "Start with the gauge.",
      plpIntroSub: "Gauge first, then silhouette.",
      filteredIntro: (fabricName: string) => `${fabricName}.`,
      reassurance: {
        shipping: returnsEn.shipping,
        returns: returnsEn.returns,
        shippingLink: returnsEn.shippingLink,
        helperJa: returnsEn.helperJa,
      },
      gallerySwipeHint: "Swipe →",
      sizeTableHeaders: ["Size", "Length", "Shoulder", "Chest", "Sleeve"],
      sizeTableCaption: "Size guide (cm and inches)",
      sizeTableExplainer:
        "Length: back of the neck to the hem. Shoulder: seam to seam. Chest: measured flat. Inches are rounded to the nearest quarter.",
      taxIncluded: "(tax included)",
      sizeAria: (size: string, inStock: boolean) =>
        `Size ${size}${inStock ? "" : ", out of stock"}`,
      askConcierge: "Ask about size and gauge",
    },
    modelFit: {
      sectionLabel: "Model and fit",
      modelLine: (heightCm: number, weightKg: number) =>
        `Model ${heightCm} cm / ${weightKg} kg`,
      wearingSize: (size: string) => `Wearing size ${size}`,
      modelLineJa: (heightCm: number, weightKg: number, size: string) =>
        `Model ${heightCm} cm, ${weightKg} kg, wearing size ${size}`,
      moreModels: "Other models",
      sizeHint: "Start with the size you usually wear in a T-shirt.",
    },
    sizeRecommendation: {
      sectionLabel: "Size finder",
      heading: "Find your size",
      height: "Height (cm)",
      weight: "Weight (kg)",
      preference: "How you like it to fit",
      preferences: [
        { value: "just-fit" as const, label: "True to size" },
        { value: "relaxed" as const, label: "Relaxed" },
        { value: "oversized" as const, label: "Oversized" },
      ],
      submit: "Show my size",
      disclaimer: "A guide only — it varies with build and how you wear it.",
      invalidInput: "Enter a height of 130–220 cm and a weight of 30–150 kg.",
      recommended: (size: string) => `Recommended size: ${size}`,
      preferLooser: (size: string) => `For a looser fit, take ${size}.`,
      preferCloser: (size: string) => `For a closer fit, take ${size}.`,
    },
    fabric: {
      title: "Fabric",
      introLine: "Start with the gauge.",
      introSubline: "28G, 36G, 46G. Thickness and density change.",
      allFabrics: "All fabrics",
      inThisFabric: "In this fabric",
      thisFabric: "This fabric",
      viewAll: "All pieces",
      exploreFabric: "About the fabric",
      pieceCount: (count: number) =>
        count === 1 ? "1 piece" : `${count} pieces`,
      character: {
        thickness: "Thickness",
        softness: "Softness",
        structure: "Body",
        sheerness: "Sheerness",
        surface: "Surface",
      },
      compareTitle: "Compare",
      viewFabric: "Fabric",
    },
    home: {
      selection: "Selection",
      allPieces: "All pieces",
      exploreFabric: "About the fabric",
      heroFabricLine: "Knitted in Wakayama.",
    },
    checkout: {
      thankYou: "Thank you for your order",
      orderConfirmed:
        "Your order is confirmed. We have sent you a confirmation email.",
      orderId: (id: string) => `Order ${id}`,
      nextSteps: "We will start preparing your order shortly.",
      orderSummaryLabel: "Your order",
      paymentPending: "Confirming payment",
      paymentUnconfirmed:
        "We could not confirm the payment. Your bag is unchanged.",
      cancelled: "Payment was cancelled",
      paymentIncomplete: "The payment was not completed.",
      cancelRecovery: "Your bag is saved. Continue when you are ready.",
      backToLastProduct: "Back to the piece you were viewing",
      backToBag: "Back to bag",
      continue: "Continue shopping",
      exploreFabric: "About the fabric",
      viewProducts: "All pieces",
    },
    breadcrumbs: {
      home: "Home",
      fabric: "Gauge",
      products: "Collection",
    },
    states: {
      notFound: {
        label: "404",
        message: "Page not found.",
        back: "Back",
      },
      error: {
        label: "Error",
        message: "Something went wrong. Please try again in a moment.",
        retry: "Try again",
        back: "Back",
      },
      loading: "Loading",
    },
  },
);

export type SiteUiCopy = ReturnType<typeof getSiteUiCopy>;

/** Convenience for code that only needs one section. */
export function getProductCopy(locale: Locale): SiteUiCopy["product"] {
  return getSiteUiCopy(locale).product;
}
