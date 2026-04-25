// Async runner — orchestrates the live demo flow:
//   1. POST to APIM
//   2. If 400 → done (validation failed)
//   3. If 202 → enter polling loop until 'completed' / 'dead-lettered' / timeout

import type { Dispatch } from "react";
import { postOrder, getOrderStatus } from "./api";
import { POLL_INTERVAL_MS, POLL_MAX_ATTEMPTS } from "./config";
import type { Action } from "./reducer";
import type { OrderPayload, ScenarioId } from "./types";

export interface RunnerOptions {
  payload: OrderPayload;
  scenarioId: ScenarioId | null;
  dispatch: Dispatch<Action>;
  /** Returns true if the run was cancelled (e.g. user hit Reset). The runner checks this between async ops. */
  isCancelled: () => boolean;
}

/**
 * Run a complete demo cycle. Returns when either:
 *  - The phase becomes 'validation-failed', 'completed-gold', 'completed-dlq', 'timeout', or 'error'
 *  - The run is cancelled
 */
export async function runDemoCycle(opts: RunnerOptions): Promise<void> {
  const { payload, scenarioId, dispatch, isCancelled } = opts;

  dispatch({
    type: "RUN_START",
    orderId: payload.orderId,
    payload,
    scenarioId,
  });

  // === PHASE 1: POST ===
  let postResult;
  try {
    postResult = await postOrder(payload);
  } catch (err: any) {
    if (isCancelled()) return;
    const request = err.request ?? {
      method: "POST" as const,
      url: "",
      errorMessage: String(err),
    };
    dispatch({ type: "POST_NETWORK_ERROR", request });
    return;
  }

  if (isCancelled()) return;

  const status = postResult.request.status ?? 0;
  if (status === 202) {
    dispatch({ type: "POST_DONE", request: postResult.request });
  } else if (status === 400) {
    dispatch({ type: "POST_VALIDATION_FAILED", request: postResult.request });
    return; // No polling needed — validation failed at producer
  } else {
    dispatch({ type: "POST_NETWORK_ERROR", request: postResult.request });
    return;
  }

  // === PHASE 2: POLLING ===
  await sleep(1000); // give the consumer a head start before first poll
  if (isCancelled()) return;

  for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
    if (isCancelled()) return;

    dispatch({ type: "POLL_START" });

    let pollResult;
    try {
      pollResult = await getOrderStatus(payload.orderId);
    } catch (err: any) {
      if (isCancelled()) return;
      const request = err.request ?? {
        method: "GET" as const,
        url: "",
        errorMessage: String(err),
      };
      dispatch({ type: "POLL_NETWORK_ERROR", request });
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (isCancelled()) return;

    const body = pollResult.body;
    if (!body) {
      // Unexpected empty body — treat as transient
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const persistedBody = "body" in body ? (body as any).body : undefined;

    dispatch({
      type: "POLL_RESULT",
      request: pollResult.request,
      status: body.status,
      persistedBody,
    });

    if (body.status === "completed" || body.status === "dead-lettered") {
      return; // terminal state
    }

    // status === 'pending' — wait and try again
    await sleep(POLL_INTERVAL_MS);
  }

  if (!isCancelled()) {
    dispatch({ type: "POLL_TIMEOUT" });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
