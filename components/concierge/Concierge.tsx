"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ConciergeCard } from "@/components/concierge/ConciergeCard";
import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import type {
  ConciergeReply,
  ConciergeResponse,
  ConciergeTurn,
} from "@/lib/concierge/types";
import { cn } from "@/lib/utils";

type ConciergeProps = {
  /** Product page the customer came from; sizes that piece by default. */
  contextSlug?: string | null;
  contextName?: string | null;
  className?: string;
};

type Entry =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; reply: ConciergeReply };

type ChipGroup = {
  label: string;
  /** Only one chip of the group can be on at a time. */
  exclusive: boolean;
  chips: string[];
};

const CHIP_GROUPS: ChipGroup[] = [
  {
    label: "着方",
    exclusive: false,
    chips: ["一枚で着る", "ジャケットの下に着る", "毎日着る", "暑い時期に着る"],
  },
  {
    label: "フィット",
    exclusive: true,
    chips: ["ジャストで着たい", "ゆったり着たい"],
  },
  {
    label: "普段のサイズ",
    exclusive: true,
    chips: ["普段はS", "普段はM", "普段はL"],
  },
  {
    label: "そのほか",
    exclusive: false,
    chips: ["透けが気になる", "はじめての一枚", "2枚目を買い足す"],
  },
];

const COPY = {
  intro:
    "身長か普段のサイズと、どう着たいかを教えてください。ゲージ・シルエット・サイズを一つご提案します。",
  disclaimer: "自動応答です。サイズは目安としてご利用ください。",
  heightLabel: "身長",
  messageLabel: "ご相談内容",
  placeholder: "例：体重65kg。白シャツの代わりに着たい。",
  submit: "相談する",
  pending: "確認しています",
  reset: "はじめから",
  empty: "身長、当てはまる項目、またはご相談内容のいずれかをご入力ください。",
  tooLong: `${CONCIERGE_LIMITS.maxMessageChars}文字以内でご入力ください。`,
  rateLimited: (seconds: number) =>
    `続けてのご相談が多くなっています。${seconds}秒ほどおいて、もう一度お試しください。`,
  unavailable:
    "ただいまお答えできません。時間をおいてお試しいただくか、お問い合わせください。",
} as const;

function toTurn(entry: Entry): ConciergeTurn {
  if (entry.role === "user") return { role: "user", content: entry.text };

  const { reply } = entry;
  const picked = reply.primary
    ? `（${reply.primary.name}${reply.primary.size ? ` ${reply.primary.size}` : ""}）`
    : "";

  return {
    role: "assistant",
    content: [reply.reply + picked, reply.followUpQuestion]
      .filter(Boolean)
      .join("\n"),
  };
}

/**
 * The Gauge Concierge conversation. One instance per page; used by the home
 * section, the product page link's destination and /concierge.
 *
 * The conversation lives in component state only. Nothing is stored in the
 * browser or on the server, and leaving the page discards it.
 */
export function Concierge({ contextSlug, contextName, className }: ConciergeProps) {
  const baseId = useId();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestRef = useRef<HTMLLIElement>(null);
  const composingRef = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Bring a new reply into view without yanking the page: only scrolls when
  // the reply starts outside the viewport.
  const lastEntry = entries[entries.length - 1];
  useEffect(() => {
    if (lastEntry?.role !== "assistant") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    latestRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [lastEntry]);

  const heightNumber = Number(height);
  const heightValid =
    height !== "" && Number.isFinite(heightNumber) && heightNumber >= 130 && heightNumber <= 220;

  const composed = [
    heightValid ? `身長${Math.round(heightNumber)}cm` : "",
    ...CHIP_GROUPS.flatMap((group) =>
      group.chips.filter((chip) => selected.includes(chip)),
    ),
    draft.trim(),
  ]
    .filter(Boolean)
    .join("。");

  const overLimit = composed.length > CONCIERGE_LIMITS.maxMessageChars;

  const toggleChip = (group: ChipGroup, chip: string) => {
    setError(null);
    setSelected((current) => {
      if (current.includes(chip)) return current.filter((item) => item !== chip);

      const kept = group.exclusive
        ? current.filter((item) => !group.chips.includes(item))
        : current;

      return [...kept, chip];
    });
  };

  // While a request is in flight the controls are marked aria-disabled and
  // ignore input rather than being disabled: a disabled control drops
  // keyboard focus, and the customer would have to find the form again.
  const send = async () => {
    if (pending) return;

    if (!composed) {
      setError(COPY.empty);
      return;
    }

    if (overLimit) {
      setError(COPY.tooLong);
      return;
    }

    const userEntry: Entry = { id: nextId.current++, role: "user", text: composed };
    const history = [...entries, userEntry];

    setEntries(history);
    setPending(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    // On failure the customer's line is taken back out and their input is
    // left in the form, so nothing they typed is lost.
    const fail = (message: string) => {
      setEntries((current) => current.filter((entry) => entry.id !== userEntry.id));
      setError(message);
    };

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-CONCIERGE_LIMITS.maxTurnsKept).map(toTurn),
          contextSlug: contextSlug ?? null,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ConciergeResponse
        | null;

      if (!data || !data.ok) {
        if (data?.error === "rate_limited") {
          fail(COPY.rateLimited(data.retryAfterSeconds ?? 10));
        } else if (data?.error === "message_too_long") {
          fail(COPY.tooLong);
        } else {
          fail(COPY.unavailable);
        }
        return;
      }

      const reply: ConciergeReply = {
        reply: data.reply,
        primary: data.primary,
        alternative: data.alternative,
        followUpQuestion: data.followUpQuestion,
        links: data.links,
      };

      setEntries((current) => [
        ...current,
        { id: nextId.current++, role: "assistant", reply },
      ]);
      setSelected([]);
      setHeight("");
      setDraft("");
    } catch (caught) {
      if ((caught as Error)?.name !== "AbortError") fail(COPY.unavailable);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setPending(false);
      }
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setEntries([]);
    setSelected([]);
    setHeight("");
    setDraft("");
    setError(null);
    setPending(false);
    textareaRef.current?.focus();
  };

  const heightId = `${baseId}-height`;
  const rowClass = "grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4";
  const errorId = `${baseId}-error`;
  const counterId = `${baseId}-counter`;

  return (
    <div className={cn("min-w-0", className)}>
      <ol
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="コンシェルジュとの会話"
        aria-busy={pending}
        className="space-y-6"
      >
        <li>
          <p className="type-label !text-[var(--color-navy)]">Concierge</p>
          <p className="type-body mt-2 max-w-[36em] text-[var(--color-ink)]">
            {contextName
              ? `${contextName} をご覧いただいています。${COPY.intro}`
              : COPY.intro}
          </p>
          <p className="type-caption mt-2">{COPY.disclaimer}</p>
        </li>

        {entries.map((entry, index) => {
          const isLatest = index === entries.length - 1;

          if (entry.role === "user") {
            return (
              <li key={entry.id} className="flex justify-end">
                <p className="type-body max-w-[85%] whitespace-pre-line break-words border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)]">
                  <span className="sr-only">お客様：</span>
                  {entry.text}
                </p>
              </li>
            );
          }

          const { reply } = entry;

          return (
            <li
              key={entry.id}
              ref={isLatest ? latestRef : undefined}
              className="scroll-mt-[calc(var(--header-height)+16px)] space-y-4"
            >
              <div>
                <p className="type-label !text-[var(--color-navy)]">Concierge</p>
                <p className="type-body mt-2 max-w-[36em] whitespace-pre-line break-words text-[var(--color-ink)]">
                  {reply.reply}
                </p>
              </div>

              {reply.primary ? (
                <ConciergeCard card={reply.primary} kind="primary" />
              ) : null}
              {reply.alternative ? (
                <ConciergeCard card={reply.alternative} kind="alternative" />
              ) : null}

              {reply.followUpQuestion ? (
                <p className="type-body max-w-[36em] break-words border-l-2 border-[var(--color-navy)] pl-4 text-[var(--color-ink)]">
                  {reply.followUpQuestion}
                </p>
              ) : null}

              {reply.links.length > 0 ? (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {reply.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="type-label inline-flex min-h-11 items-center border-b border-[var(--color-ink)] !text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}

        {pending ? (
          <li>
            <p className="type-label !text-[var(--color-navy)]">Concierge</p>
            <p className="type-body mt-2 flex items-center gap-3 text-[var(--color-ink-soft)]">
              {COPY.pending}
              <span aria-hidden className="skeleton-block h-px w-16" />
            </p>
          </li>
        ) : null}
      </ol>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="mt-8 border-t border-[var(--color-ink)] pt-6"
      >
        <div className="space-y-4">
          <div className={rowClass}>
            <label htmlFor={heightId} className="type-caption sm:pt-3">
              {COPY.heightLabel}
            </label>
            <span className="flex h-11 w-36 items-center border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 focus-within:border-[var(--color-ink)]">
              <input
                id={heightId}
                type="number"
                inputMode="numeric"
                min={130}
                max={220}
                placeholder="170"
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  setError(null);
                }}
                readOnly={pending}
                className="font-en w-full min-w-0 bg-transparent text-[16px] text-[var(--color-ink)] tabular-nums outline-none placeholder:text-[var(--color-ink-faint)]"
              />
              <span aria-hidden className="font-en text-[13px] text-[var(--color-ink-soft)]">
                cm
              </span>
            </span>
          </div>

          {CHIP_GROUPS.map((group, groupIndex) => {
            const groupId = `${baseId}-group-${groupIndex}`;

            return (
              <div
                key={group.label}
                role="group"
                aria-labelledby={groupId}
                className={rowClass}
              >
                <p id={groupId} className="type-caption sm:pt-3">
                  {group.label}
                </p>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {group.chips.map((chip) => {
                    const on = selected.includes(chip);

                    return (
                      <button
                        key={chip}
                        type="button"
                        aria-pressed={on}
                        aria-disabled={pending}
                        onClick={() => {
                          if (!pending) toggleChip(group, chip);
                        }}
                        className={cn(
                          "min-h-11 border px-3 text-[13px] tracking-[0.02em] transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
                          on
                            ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                            : "border-[var(--color-hairline)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]",
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <label className="mt-6 block">
          <span className="type-caption block">{COPY.messageLabel}</span>
          <textarea
            ref={textareaRef}
            rows={2}
            value={draft}
            maxLength={CONCIERGE_LIMITS.maxMessageChars}
            placeholder={COPY.placeholder}
            readOnly={pending}
            aria-describedby={`${counterId}${error ? ` ${errorId}` : ""}`}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter breaks the line. Enter that only
              // confirms a Japanese IME conversion must not send.
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !composingRef.current &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void send();
              }
            }}
            className="type-body mt-2 block w-full resize-y border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3 text-[16px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-ink)] md:text-[14px]"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p
            id={counterId}
            className={cn(
              "type-fine font-en tabular-nums",
              overLimit && "!text-[var(--color-ink)]",
            )}
          >
            <span className="sr-only">文字数 </span>
            {composed.length} / {CONCIERGE_LIMITS.maxMessageChars}
          </p>

          <div className="flex items-center gap-5">
            {entries.length > 0 ? (
              <button
                type="button"
                onClick={reset}
                className="min-h-11 text-[13px] tracking-[0.04em] text-[var(--color-ink-soft)] underline underline-offset-4 transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
              >
                {COPY.reset}
              </button>
            ) : null}
            <button
              type="submit"
              aria-disabled={pending}
              className="flex min-h-12 min-w-36 items-center justify-center border border-[var(--color-navy)] bg-[var(--color-navy)] px-8 text-[14px] tracking-[0.1em] text-white transition-colors duration-[var(--duration-quiet)] ease-[var(--ease-quiet)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
            >
              {pending ? COPY.pending : COPY.submit}
            </button>
          </div>
        </div>

        <p
          id={errorId}
          role="alert"
          className="type-body mt-3 min-h-[1.9em] border-l-2 border-transparent text-[var(--color-ink)] [&:not(:empty)]:border-[var(--color-ink)] [&:not(:empty)]:pl-4"
        >
          {error}
          {error === COPY.unavailable ? (
            <Link
              href="/contact"
              className="ml-2 underline underline-offset-4 hover:opacity-60"
            >
              お問い合わせ
            </Link>
          ) : null}
        </p>

      </form>
    </div>
  );
}
