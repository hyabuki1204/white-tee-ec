import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Anthropic from "@anthropic-ai/sdk";
import type { ConciergeMessagesClient } from "@/lib/concierge/model";
import { answerConcierge } from "@/lib/concierge/respond";
import { productsWithStock, user } from "@/tests/concierge/helpers";

/**
 * The model path with a stubbed SDK client. This exercises request
 * construction, output handling and every fallback — not the model itself,
 * which cannot be called from the test environment.
 */

type CreateParams = Anthropic.MessageCreateParamsNonStreaming;

function message(
  content: Anthropic.Message["content"],
  stopReason: Anthropic.Message["stop_reason"] = "end_turn",
): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-haiku-5-5",
    content,
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 },
  } as unknown as Anthropic.Message;
}

function textBlock(value: unknown): Anthropic.TextBlock {
  return {
    type: "text",
    text: typeof value === "string" ? value : JSON.stringify(value),
    citations: null,
  } as Anthropic.TextBlock;
}

function stubClient(
  respond: (params: CreateParams) => Anthropic.Message | Promise<Anthropic.Message>,
): { client: ConciergeMessagesClient; calls: CreateParams[] } {
  const calls: CreateParams[] = [];

  return {
    calls,
    client: {
      messages: {
        create: async (params) => {
          calls.push(params);
          return respond(params);
        },
      },
    },
  };
}

const input = {
  messages: user("身長172cm。ジャケットの下に着たい。"),
  contextSlug: null,
  products: productsWithStock(),
};

const modelAnswer = {
  reply: "46G Regular Tee の M をおすすめします。",
  primary: {
    productSlug: "46g-regular-tee",
    size: "M",
    reason: "80/1 コーマコンパクト糸、目付130g/m²。ジャケットの下に収まります。",
  },
  alternative: null,
  followUpQuestion: null,
};

describe("answerConcierge", () => {
  it("uses the rules path and spends no budget when there is no client", async () => {
    let budgetCalls = 0;
    const answer = await answerConcierge(input, {
      getClient: () => null,
      consumeBudget: async () => {
        budgetCalls += 1;
        return true;
      },
    });

    assert.equal(answer.source, "rules");
    assert.equal(answer.primary?.productSlug, "46g-regular-tee");
    assert.equal(budgetCalls, 0);
  });

  it("uses the rules path without calling the model when the budget is spent", async () => {
    const { client, calls } = stubClient(() => message([textBlock(modelAnswer)]));
    const answer = await answerConcierge(input, {
      getClient: () => client,
      consumeBudget: async () => false,
    });

    assert.equal(answer.source, "rules");
    assert.equal(calls.length, 0);
  });

  it("returns the model's validated answer, skipping thinking blocks", async () => {
    const { client, calls } = stubClient(() =>
      message([
        { type: "thinking", thinking: "", signature: "sig" } as Anthropic.ThinkingBlock,
        textBlock(modelAnswer),
      ]),
    );
    const answer = await answerConcierge(input, {
      getClient: () => client,
      consumeBudget: async () => true,
    });

    assert.equal(answer.source, "model");
    assert.equal(answer.primary?.productSlug, "46g-regular-tee");
    assert.equal(answer.primary?.size, "M");
    assert.equal(answer.primary?.href, "/products/46g-regular-tee?size=M");
    assert.equal(answer.primary?.price, 18_000);

    const [params] = calls;
    const system = params.system as Anthropic.TextBlockParam[];

    assert.equal(params.model, "claude-haiku-5-5");
    assert.equal(params.max_tokens, 1_024);
    assert.equal(params.output_config?.effort, "low");
    assert.equal(params.output_config?.format?.type, "json_schema");
    // Cache breakpoint on the static block only; stock comes after it.
    assert.deepEqual(system[0].cache_control, { type: "ephemeral" });
    assert.equal(system[1].cache_control, undefined);
    assert.match(system[1].text, /Stock right now/);
    assert.deepEqual(params.messages, [
      { role: "user", content: "身長172cm。ジャケットの下に着たい。" },
    ]);
    // Parameters the current models reject must not be sent.
    assert.equal("temperature" in params, false);
    assert.equal("thinking" in params, false);
  });

  it("falls back to rules on refusal, truncation, bad JSON and invalid content", async () => {
    const cases: Array<() => Anthropic.Message> = [
      () => message([], "refusal"),
      () => message([textBlock('{"reply": "46G')], "max_tokens"),
      () => message([textBlock("not json")]),
      () => message([textBlock({ ...modelAnswer, reply: "" })]),
      () => message([textBlock({ ...modelAnswer, reply: "KANEMASA PHIL. の生地です。" })]),
    ];

    for (const respond of cases) {
      const { client } = stubClient(respond);
      const answer = await answerConcierge(input, {
        getClient: () => client,
        consumeBudget: async () => true,
      });

      assert.equal(answer.source, "rules");
      assert.equal(answer.primary?.productSlug, "46g-regular-tee");
    }
  });

  it("falls back to rules when the API throws", async () => {
    const { client } = stubClient(() => {
      throw new Anthropic.APIConnectionTimeoutError();
    });
    const answer = await answerConcierge(input, {
      getClient: () => client,
      consumeBudget: async () => true,
    });

    assert.equal(answer.source, "rules");
    assert.ok(answer.primary);
  });

  it("keeps the model's reply but drops a product it invented", async () => {
    const { client } = stubClient(() =>
      message([
        textBlock({
          ...modelAnswer,
          primary: { productSlug: "60g-silk-tee", size: "M", reason: "x" },
        }),
      ]),
    );
    const answer = await answerConcierge(input, {
      getClient: () => client,
      consumeBudget: async () => true,
    });

    assert.equal(answer.source, "model");
    assert.equal(answer.primary, null);
  });

  it("enforces stock on the model's pick", async () => {
    const { client } = stubClient(() => message([textBlock(modelAnswer)]));
    const answer = await answerConcierge(
      { ...input, products: productsWithStock({ "46g-regular-tee": { M: 0 } }) },
      { getClient: () => client, consumeBudget: async () => true },
    );

    assert.equal(answer.source, "model");
    assert.equal(answer.primary?.size, "L");
    assert.match(answer.reply, /在庫切れ/);
  });
});
