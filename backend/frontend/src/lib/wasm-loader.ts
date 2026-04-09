/**
 * WASM geometry loader
 * Ported from @kigland/studio wasmInit.ts
 *
 * Loads face geometry from a .wasm file, decompresses and deserializes
 * to Three.js BufferGeometry with morph targets.
 */

import { decode as msgpackDecode } from "@msgpack/msgpack";
import { deserializeMultiGeometry, type GeometryData } from "./geometry-format";

export interface WasmInitResult {
  geometries: GeometryData[];
  morphTargetDictionary: Record<string, number>;
}

interface ExportNames {
  get_ptr: string;
  get_len: string;
  get_seed?: string;
  get_chunk_info?: string;
  assemble?: string;
}

async function gunzip(buffer: ArrayBufferLike): Promise<ArrayBuffer> {
  const uint8 = new Uint8Array(buffer);
  const arrayBuf = uint8.slice().buffer;
  const cs = new DecompressionStream("gzip");
  const input = new Blob([arrayBuf]).stream();
  const output = input.pipeThrough(cs);
  return new Response(output).arrayBuffer();
}

function xorDeobfuscate(data: Uint8Array, seed: number): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const key = ((seed + i) * 0x5deece66d + 0xb) & 0xff;
    result[i] = data[i] ^ key;
  }
  return result;
}

async function loadExportNames(wasmUrl: string): Promise<ExportNames> {
  const exportsUrl = wasmUrl.replace(/\.wasm$/, ".wasm.bin");
  try {
    const response = await fetch(exportsUrl, { cache: "no-store" });
    if (!response.ok) return { get_ptr: "get_ptr", get_len: "get_len" };

    const arrayBuffer = await response.arrayBuffer();
    const decoded = msgpackDecode(new Uint8Array(arrayBuffer)) as string[];
    return {
      get_ptr: decoded[0],
      get_len: decoded[1],
      get_seed: decoded[2],
      get_chunk_info: decoded[3],
    };
  } catch {
    return { get_ptr: "get_ptr", get_len: "get_len" };
  }
}

async function loadWasmData(wasmUrl: string): Promise<ArrayBuffer> {
  const exportNames = await loadExportNames(wasmUrl);

  const resp = await fetch(wasmUrl, { cache: "no-store" });
  if (!resp.ok) throw new Error(`Failed to fetch wasm: ${resp.status}`);
  const wasmBytes = await resp.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(wasmBytes, {});
  const exports = instance.exports as Record<string, unknown>;

  const getPtrFunc = exports[exportNames.get_ptr] as () => number;
  const getLenFunc = exports[exportNames.get_len] as () => number;
  const getSeedFunc = exportNames.get_seed
    ? (exports[exportNames.get_seed] as (() => number) | undefined)
    : null;
  const getChunkInfoFunc = exportNames.get_chunk_info
    ? (exports[exportNames.get_chunk_info] as (() => number) | undefined)
    : null;
  const assembleFunc = exportNames.assemble
    ? (exports[exportNames.assemble] as (() => void) | undefined)
    : null;

  if (!exports.memory || !getPtrFunc || !getLenFunc) {
    throw new Error("WASM module missing required exports");
  }

  const memory = exports.memory as WebAssembly.Memory;

  if (assembleFunc) assembleFunc();

  let gzBuf: ArrayBufferLike;

  if (getChunkInfoFunc) {
    const numChunks = getChunkInfoFunc();
    const chunks: Uint8Array[] = [];
    let totalLen = 0;

    for (let i = 0; i < numChunks; i++) {
      const chunkOffset = getChunkInfoFunc();
      const length = getChunkInfoFunc();
      const chunk = new Uint8Array(memory.buffer, chunkOffset, length);
      chunks.push(chunk.slice());
      totalLen += length;
    }

    const merged = new Uint8Array(totalLen);
    let pos = 0;
    for (const chunk of chunks) {
      merged.set(chunk, pos);
      pos += chunk.length;
    }

    gzBuf = getSeedFunc
      ? xorDeobfuscate(merged, getSeedFunc()).buffer
      : merged.buffer;
  } else {
    const ptr = getPtrFunc();
    const len = getLenFunc();
    if (len === 0) throw new Error("WASM module contains no data");

    const bytes = new Uint8Array(memory.buffer, ptr, len);
    gzBuf = getSeedFunc
      ? xorDeobfuscate(bytes, getSeedFunc()).buffer
      : bytes.buffer;
  }

  return gunzip(gzBuf);
}

export async function initFromWasmMulti(wasmUrl: string): Promise<WasmInitResult> {
  const dataBuf = await loadWasmData(wasmUrl);
  const result = deserializeMultiGeometry(dataBuf);
  return {
    geometries: result.geometries,
    morphTargetDictionary: result.morphTargetDictionary,
  };
}
