"use client";

import { useState, useCallback } from "react";

interface WasmPlaygroundProps {
  title: string;
  watCode: string;
  jsCode: string;
  wasmHex: string;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export default function WasmPlayground({
  title,
  watCode,
  jsCode,
  wasmHex,
}: WasmPlaygroundProps) {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>("");

  const run = useCallback(async () => {
    setIsRunning(true);
    setError("");
    setOutput("");

    // 收集 console.log 输出
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map((a) => String(a)).join(" "));
      originalLog(...args);
    };

    try {
      const wasmBytes = hexToBytes(wasmHex);
      const result = await WebAssembly.instantiate(wasmBytes);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exports = (result as any).instance.exports as Record<string, Function>;

      // 在沙箱中执行用户代码
      const fn = new Function("exports", "log", jsCode);
      const localLogs: string[] = [];
      fn(exports, (msg: string) => localLogs.push(msg));

      const allLogs = [...logs, ...localLogs];
      setOutput(allLogs.join("\n") || "(无输出)");
    } catch (e) {
      setError(String(e));
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  }, [wasmHex, jsCode]);

  return (
    <div className="my-8 pixel-panel">
      <h3 className="font-['Press_Start_2P'] text-xs text-(--color-accent) mb-4">
        {title}
      </h3>

      {/* WAT 源码 */}
      <div className="mb-4">
        <div className="font-['Press_Start_2P'] text-[10px] text-(--color-text-secondary) mb-2">
          WAT 源码
        </div>
        <pre className="bg-(--color-code-bg) text-(--color-code-text) p-4 rounded text-xs overflow-x-auto font-mono leading-relaxed">
          <code>{watCode}</code>
        </pre>
      </div>

      {/* JavaScript */}
      <div className="mb-4">
        <div className="font-['Press_Start_2P'] text-[10px] text-(--color-text-secondary) mb-2">
          JavaScript
        </div>
        <pre className="bg-(--color-code-bg) text-(--color-code-text) p-4 rounded text-xs overflow-x-auto font-mono leading-relaxed">
          <code>{jsCode}</code>
        </pre>
      </div>

      {/* Run button */}
      <button
        onClick={run}
        disabled={isRunning}
        className="pixel-btn pixel-btn-primary mb-4 text-xs"
      >
        {isRunning ? "运行中..." : "运行"}
      </button>

      {/* Output */}
      {(output || error) && (
        <div className="mt-3">
          <div className="font-['Press_Start_2P'] text-[10px] text-(--color-text-secondary) mb-2">
            输出
          </div>
          <pre
            className={`p-4 rounded text-xs font-mono leading-relaxed overflow-x-auto ${
              error
                ? "bg-red-900/20 text-red-400 border border-red-500/30"
                : "bg-(--color-bg-secondary) text-(--color-text)"
            }`}
          >
            <code>{error || output}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
