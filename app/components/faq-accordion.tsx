"use client";

import { useId, useState } from "react";

type Faq = { question: string; answer: string };

export function FaqAccordion({ items }: { items: readonly Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return <div className="faq-accordion">{items.map((item, index) => {
    const isOpen = openIndex === index;
    const panelId = `${baseId}-${index}`;
    return <article className="faq-item" key={item.question}>
      <h2><button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenIndex(isOpen ? null : index)}>{item.question}<span aria-hidden="true">{isOpen ? "−" : "+"}</span></button></h2>
      <div id={panelId} hidden={!isOpen}><p>{item.answer}</p></div>
    </article>;
  })}</div>;
}
