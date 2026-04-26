// Real HTTP client for the deployed Lumina POC APIM gateway.
// Every call is real — no mocks, no fixtures.

import type { OrderPayload, RequestRecord } from "./types";
import { APIM_BASE_URL, ORDERS_PATH } from "./config";

export interface PostOrderResult {
  request: RequestRecord;
  /** Parsed body of the response (may be {orderId,status,...} on 202 or {isValid,errors[]} on 400) */
  body: unknown;
}

export async function postOrder(payload: OrderPayload): Promise<PostOrderResult> {
  const url = `${APIM_BASE_URL}${ORDERS_PATH}`;
  const startedAt = performance.now();

  const request: RequestRecord = {
    method: "POST",
    url,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const durationMs = Math.round(performance.now() - startedAt);
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    request.status = response.status;
    request.durationMs = durationMs;
    request.responseBody = body;

    return { request, body };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startedAt);
    request.status = 0;
    request.durationMs = durationMs;
    request.errorMessage = err instanceof Error ? err.message : String(err);
    throw { request, error: err };
  }
}

export type AlertInfo =
  | {
      sent: true;
      location: string;
      details: {
        orderId: string;
        alertSentAt: string;
        channel: string;
        recipient: string;
        subject: string;
        logicAppRunId?: string;
        sourceBlob?: string;
      };
    }
  | { sent: false };

export type StatusResponse =
  | {
      orderId: string;
      status: "completed";
      location: string;
      body: unknown;
      alert?: AlertInfo;
    }
  | {
      orderId: string;
      status: "dead-lettered";
      location: string;
      body: unknown;
      alert?: AlertInfo;
    }
  | {
      orderId: string;
      status: "pending";
      message: string;
      alert?: AlertInfo;
    };

export interface GetStatusResult {
  request: RequestRecord;
  body: StatusResponse | null;
}

export async function getOrderStatus(orderId: string): Promise<GetStatusResult> {
  const url = `${APIM_BASE_URL}${ORDERS_PATH}/${encodeURIComponent(orderId)}/status`;
  const startedAt = performance.now();

  const request: RequestRecord = {
    method: "GET",
    url,
  };

  try {
    const response = await fetch(url, { method: "GET" });
    const durationMs = Math.round(performance.now() - startedAt);
    const text = await response.text();

    let body: StatusResponse | null = null;
    try {
      body = text ? (JSON.parse(text) as StatusResponse) : null;
    } catch {
      body = null;
    }

    request.status = response.status;
    request.durationMs = durationMs;
    request.responseBody = body;

    return { request, body };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startedAt);
    request.status = 0;
    request.durationMs = durationMs;
    request.errorMessage = err instanceof Error ? err.message : String(err);
    throw { request, error: err };
  }
}
