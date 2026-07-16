"use client";

import { useEffect, useState, useRef } from "react";

interface Heading {
  id: string;
  text: string;
  depth: number;
}

export default function TOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll(".prose h2, .prose h3")
    );

    const items: Heading[] = elements.map((el) => ({
      id: el.id,
      text: el.textContent || "",
      depth: el.tagName === "H2" ? 2 : 3,
    }));

    setHeadings(items);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="toc pixel-panel p-3" style={{ position: "sticky" as const, top: "calc(var(--header-height) + 1rem)" }}>
      <h4 className="font-['Press_Start_2P'] text-[9px] mb-3 text-(--color-accent) opacity-70">
        TOC
      </h4>
      <ul className="space-y-0">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              data-depth={h.depth}
              className={`${activeId === h.id ? "active" : ""}`}
              style={{ paddingLeft: h.depth === 3 ? "1.25rem" : "0" }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
