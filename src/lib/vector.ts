import { Index } from "@upstash/vector";

let _index: Index | null = null;

export function getVectorIndex(): Index {
  if (!_index) {
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error("Upstash Vector env vars are not set");
    }
    _index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  return _index;
}
