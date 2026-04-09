/**
 * Geometry Format Deserialization
 * Ported from @kigland/studio - custom Three.js geometry binary format
 */

import * as THREE from "three";

export interface GeometryTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface GeometryData {
  name: string;
  geometry: THREE.BufferGeometry;
  transform: GeometryTransform;
}

export interface MultiGeometryData {
  geometries: GeometryData[];
  morphTargetDictionary: Record<string, number>;
}

const DEFAULT_TRANSFORM: GeometryTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

function readAttributes(
  u8: Uint8Array,
  view: DataView,
  startOffset: number,
): {
  attributes: Record<string, Float32Array | Uint8Array | Uint16Array>;
  nextOffset: number;
} {
  let offset = startOffset;
  const attributes: Record<string, Float32Array | Uint8Array | Uint16Array> = {};

  while (true) {
    const nameLen = view.getUint32(offset, true);
    offset += 4;
    if (nameLen === 0) break;

    const nameBytes = u8.slice(offset, offset + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    offset += nameLen;

    const dataLen = view.getUint32(offset, true);
    offset += 4;
    const data = u8.slice(offset, offset + dataLen);
    offset += dataLen;

    if (name === "position" || name === "normal" || name === "uv") {
      attributes[name] = new Float32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    } else if (name === "color") {
      attributes[name] = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } else if (name === "color_1") {
      attributes[name] = new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    }
  }

  return { attributes, nextOffset: offset };
}

function applyAttributes(
  geometry: THREE.BufferGeometry,
  attributes: Record<string, Float32Array | Uint8Array | Uint16Array>,
): void {
  if (attributes.position)
    geometry.setAttribute("position", new THREE.BufferAttribute(attributes.position, 3));
  if (attributes.normal)
    geometry.setAttribute("normal", new THREE.BufferAttribute(attributes.normal, 3));
  if (attributes.uv)
    geometry.setAttribute("uv", new THREE.BufferAttribute(attributes.uv, 2));
}

function readIndex(
  u8: Uint8Array,
  view: DataView,
  offset: number,
  geometry: THREE.BufferGeometry,
): number {
  const indexType = view.getUint8(offset++);
  if (indexType > 0) {
    const indexLen = view.getUint32(offset, true);
    offset += 4;
    const indexData = u8.slice(offset, offset + indexLen);
    offset += indexLen;

    const indexArray =
      indexType === 2
        ? new Uint32Array(indexData.buffer, indexData.byteOffset, indexData.byteLength / 4)
        : new Uint16Array(indexData.buffer, indexData.byteOffset, indexData.byteLength / 2);

    geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
  }
  return offset;
}

function readMorphTargets(
  u8: Uint8Array,
  view: DataView,
  offset: number,
  geometry: THREE.BufferGeometry,
  attributes: Record<string, Float32Array | Uint8Array | Uint16Array>,
  morphTargetsRelative: boolean,
): number {
  const morphCount = view.getUint16(offset, true);
  offset += 2;

  if (morphCount > 0 && attributes.position && attributes.normal) {
    const posLen = attributes.position.length;
    const normLen = attributes.normal.length;

    geometry.morphAttributes.position = [];
    for (let i = 0; i < morphCount; i++) {
      const data = u8.slice(offset, offset + posLen * 4);
      offset += posLen * 4;
      const arr = new Float32Array(data.buffer, data.byteOffset, posLen);
      geometry.morphAttributes.position.push(new THREE.BufferAttribute(arr, 3));
    }

    geometry.morphAttributes.normal = [];
    for (let i = 0; i < morphCount; i++) {
      const data = u8.slice(offset, offset + normLen * 4);
      offset += normLen * 4;
      const arr = new Float32Array(data.buffer, data.byteOffset, normLen);
      geometry.morphAttributes.normal.push(new THREE.BufferAttribute(arr, 3));
    }

    geometry.morphTargetsRelative = morphTargetsRelative;
  }

  return offset;
}

function deserializeSingleGeometryData(
  u8: Uint8Array,
  view: DataView,
  startOffset: number,
  morphTargetsRelative: boolean,
): { data: GeometryData; nextOffset: number } {
  let offset = startOffset;

  const nameLen = view.getUint16(offset, true);
  offset += 2;
  const nameBytes = u8.slice(offset, offset + nameLen);
  const name = new TextDecoder().decode(nameBytes);
  offset += nameLen;

  const transform: GeometryTransform = {
    position: [
      view.getFloat32(offset, true),
      view.getFloat32(offset + 4, true),
      view.getFloat32(offset + 8, true),
    ],
    rotation: [
      view.getFloat32(offset + 12, true),
      view.getFloat32(offset + 16, true),
      view.getFloat32(offset + 20, true),
    ],
    scale: [
      view.getFloat32(offset + 24, true),
      view.getFloat32(offset + 28, true),
      view.getFloat32(offset + 32, true),
    ],
  };
  offset += 36;

  const geometry = new THREE.BufferGeometry();
  const { attributes, nextOffset: attrEndOffset } = readAttributes(u8, view, offset);
  offset = attrEndOffset;
  applyAttributes(geometry, attributes);
  offset = readIndex(u8, view, offset, geometry);
  offset = readMorphTargets(u8, view, offset, geometry, attributes, morphTargetsRelative);

  return { data: { name, geometry, transform }, nextOffset: offset };
}

function deserializeGeometryV1(buffer: ArrayBuffer): {
  geometry: THREE.BufferGeometry;
  morphTargetDictionary: Record<string, number>;
} {
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  let offset = 4;

  view.getUint8(offset++);
  const morphTargetsRelative = view.getUint8(offset++) === 1;
  offset += 2;

  const geometry = new THREE.BufferGeometry();
  const { attributes, nextOffset: attrEndOffset } = readAttributes(u8, view, offset);
  offset = attrEndOffset;
  applyAttributes(geometry, attributes);
  offset = readIndex(u8, view, offset, geometry);
  offset = readMorphTargets(u8, view, offset, geometry, attributes, morphTargetsRelative);

  const dictLen = view.getUint32(offset, true);
  offset += 4;
  const dictBytes = u8.slice(offset, offset + dictLen);
  const morphTargetDictionary = JSON.parse(new TextDecoder().decode(dictBytes));

  return { geometry, morphTargetDictionary };
}

export function deserializeMultiGeometry(buffer: ArrayBuffer): MultiGeometryData {
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  let offset = 0;

  const magic = String.fromCharCode(u8[offset], u8[offset + 1], u8[offset + 2], u8[offset + 3]);
  if (magic !== "GEOM") throw new Error("Invalid geometry format");
  offset += 4;

  const version = view.getUint8(offset++);

  if (version === 1) {
    const { geometry, morphTargetDictionary } = deserializeGeometryV1(buffer);
    return {
      geometries: [{ name: "default", geometry, transform: DEFAULT_TRANSFORM }],
      morphTargetDictionary,
    };
  }

  if (version !== 2) throw new Error(`Unsupported geometry version: ${version}`);

  const morphTargetsRelative = view.getUint8(offset++) === 1;
  const geometryCount = view.getUint16(offset, true);
  offset += 2;
  offset += 4;

  const dictLen = view.getUint32(offset, true);
  offset += 4;
  const dictBytes = u8.slice(offset, offset + dictLen);
  const morphTargetDictionary = JSON.parse(new TextDecoder().decode(dictBytes));
  offset += dictLen;

  const geometries: GeometryData[] = [];
  for (let i = 0; i < geometryCount; i++) {
    const result = deserializeSingleGeometryData(u8, view, offset, morphTargetsRelative);
    geometries.push(result.data);
    offset = result.nextOffset;
  }

  return { geometries, morphTargetDictionary };
}
