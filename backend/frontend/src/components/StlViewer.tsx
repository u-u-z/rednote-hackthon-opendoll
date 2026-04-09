import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { initFromWasmMulti, type WasmInitResult } from "@/lib/wasm-loader";
import type { GeometryData } from "@/lib/geometry-format";

const WASM_MODEL_URL = "/runtime/threejs.wasm";
const FACE_COLOR = new THREE.Color("#f3c4bf");
const BG_COLOR = new THREE.Color("#141414");
const MODEL_SCALE = 0.017;

interface FaceViewerProps {
  shapekeys: Record<string, number>;
}

interface LoadedGeometry {
  name: string;
  geometry: THREE.BufferGeometry;
  transform: GeometryData["transform"];
}

function FaceMeshes({
  geometries,
  morphTargetDictionary,
  shapekeys,
  wireframe,
}: {
  geometries: LoadedGeometry[];
  morphTargetDictionary: Record<string, number>;
  shapekeys: Record<string, number>;
  wireframe: boolean;
}) {
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  const morphInfluences = useMemo(() => {
    const sorted = Object.keys(morphTargetDictionary).sort(
      (a, b) => morphTargetDictionary[a] - morphTargetDictionary[b],
    );
    return sorted.map((key) => (shapekeys[key] ?? 0) * 0.5);
  }, [morphTargetDictionary, shapekeys]);

  useFrame(() => {
    meshRefs.current.forEach((mesh) => {
      if (!mesh.morphTargetInfluences) return;
      for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
        mesh.morphTargetInfluences[i] = morphInfluences[i] ?? 0;
      }
    });
  });

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: FACE_COLOR,
        roughness: 0.6,
        metalness: 0,
        wireframe,
      }),
    [wireframe],
  );

  const HIDDEN_PARTS = new Set(["人耳", "妖精耳", "兽耳"]);

  return (
    <group>
      {geometries.map((geo) => {
        if (HIDDEN_PARTS.has(geo.name)) return null;

        return (
          <mesh
            key={geo.name}
            ref={(mesh: THREE.Mesh | null) => {
              if (mesh) {
                meshRefs.current.set(geo.name, mesh);
                mesh.morphTargetDictionary = { ...morphTargetDictionary };
                mesh.morphTargetInfluences = [...morphInfluences];
              } else {
                meshRefs.current.delete(geo.name);
              }
            }}
            geometry={geo.geometry}
            material={material}
            position={geo.transform.position}
            rotation={geo.transform.rotation}
            scale={geo.transform.scale}
          />
        );
      })}
    </group>
  );
}

function AutoRotate({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.4;
  });
  return <group ref={groupRef}>{children}</group>;
}

function FixedLights({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<any>(null!);

  useFrame(() => {
    if (!groupRef.current || !controlsRef.current) return;
    const cam = controlsRef.current.object;
    if (cam) groupRef.current.rotation.copy(cam.rotation);
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
      />
      <group ref={groupRef}>{children}</group>
    </>
  );
}

function FaceScene({
  geometries,
  morphTargetDictionary,
  shapekeys,
  wireframe,
}: {
  geometries: LoadedGeometry[];
  morphTargetDictionary: Record<string, number>;
  shapekeys: Record<string, number>;
  wireframe: boolean;
}) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 10],
        fov: 50,
        near: 0.1,
        far: 5000,
      }}
      style={{ height: "100%" }}
      gl={{ alpha: false }}
      scene={{ background: BG_COLOR }}
    >
      <AutoRotate>
        <group scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}>
          <FaceMeshes
            geometries={geometries}
            morphTargetDictionary={morphTargetDictionary}
            shapekeys={shapekeys}
            wireframe={wireframe}
          />
        </group>
      </AutoRotate>
      <FixedLights>
        <spotLight position={[190, 80, 60]} angle={1} penumbra={1} decay={0.8} intensity={20} />
        <pointLight position={[100, 100, 150]} decay={0} intensity={2.5} />
        <pointLight position={[-350, -60, 90]} decay={0} intensity={1} />
        <pointLight position={[20, -10, 60]} decay={0} intensity={1} />
      </FixedLights>
    </Canvas>
  );
}

export function StlViewer({ shapekeys }: FaceViewerProps) {
  const [wasmData, setWasmData] = useState<WasmInitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [wireframe, setWireframe] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHasError(false);

    initFromWasmMulti(WASM_MODEL_URL)
      .then((data) => {
        if (!cancelled) setWasmData(data);
      })
      .catch((err) => {
        console.error("Failed to load WASM model:", err);
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (hasError) {
    return (
      <div className="relative aspect-square bg-[#141414] border border-border overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-muted-foreground/50 tracking-widest uppercase">
            3D 预览不可用
          </div>
        </div>
      </div>
    );
  }

  if (loading || !wasmData) {
    return (
      <div className="relative aspect-square bg-[#141414] border border-border overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">
            加载 3D 模型…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#141414] border border-border overflow-hidden">
      <ErrorBoundary onError={() => setHasError(true)}>
        <FaceScene
          geometries={wasmData.geometries}
          morphTargetDictionary={wasmData.morphTargetDictionary}
          shapekeys={shapekeys}
          wireframe={wireframe}
        />
      </ErrorBoundary>
      <button
        onClick={() => setWireframe((w) => !w)}
        className="absolute top-2 right-2 px-2 py-1 text-[10px] tracking-wider uppercase border transition-colors bg-black/50 backdrop-blur-sm hover:bg-white/10"
        style={{ color: wireframe ? "#f3c4bf" : "rgba(255,255,255,0.5)", borderColor: wireframe ? "rgba(243,196,191,0.4)" : "rgba(255,255,255,0.15)" }}
      >
        wireframe
      </button>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
