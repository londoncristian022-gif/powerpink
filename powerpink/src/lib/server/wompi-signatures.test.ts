import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createIntegritySignature, verifyWompiEvent, type WompiEvent } from "./wompi-signatures";

describe("Wompi signature verification", () => {
  it("creates the checkout integrity hash using the Wompi field order", () => {
    expect(
      createIntegritySignature(
        "sk8-438k4-xmxm392-sn2m",
        2490000,
        "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6",
      ),
    ).toBe("37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5");
  });

  it("accepts authentic event checksums and rejects tampered data", () => {
    const secret = "test-events-secret";
    const event: WompiEvent = {
      event: "transaction.updated",
      data: {
        transaction: {
          id: "test-transaction",
          status: "APPROVED",
          amount_in_cents: 8990000,
        },
      },
      environment: "test",
      signature: {
        properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
        checksum: "",
      },
      timestamp: 1792440591,
    };
    event.signature.checksum = createHash("sha256")
      .update(`test-transactionAPPROVED8990000${event.timestamp}${secret}`, "utf8")
      .digest("hex");

    expect(verifyWompiEvent(event, secret)).toBe(true);
    event.data["transaction"] = {
      id: "test-transaction",
      status: "DECLINED",
      amount_in_cents: 8990000,
    };
    expect(verifyWompiEvent(event, secret)).toBe(false);
  });

  it("rejects event signatures with missing signed properties", () => {
    const event: WompiEvent = {
      event: "transaction.updated",
      data: { transaction: { id: "test-transaction" } },
      environment: "test",
      signature: {
        properties: ["transaction.status"],
        checksum: "0".repeat(64),
      },
      timestamp: 1792440591,
    };

    expect(verifyWompiEvent(event, "test-events-secret")).toBe(false);
  });
});
