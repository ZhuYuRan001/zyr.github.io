"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";

const GISCUS_CONFIG = {
  repo: "zyr/zyr.github.io" as const,
  repoId: "" as const,
  category: "Announcements" as const,
  categoryId: "" as const,
};

export default function GiscusComments() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    setTheme(getTheme());

    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!GISCUS_CONFIG.repoId || !GISCUS_CONFIG.categoryId) {
    return null;
  }

  return (
    <div className="mt-16 pixel-panel">
      <div className="font-['Press_Start_2P'] text-[10px] text-(--color-accent) mb-4 opacity-60 text-center">
        COMMENTS
      </div>
      <Giscus
        repo={GISCUS_CONFIG.repo}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
