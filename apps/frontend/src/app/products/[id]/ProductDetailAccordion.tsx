"use client";

import { useState, type PointerEvent } from "react";

interface ProductDetailAccordionProps {
  description?: string | null;
  productName: string;
}

export default function ProductDetailAccordion({ description, productName }: ProductDetailAccordionProps) {
  const [openSections, setOpenSections] = useState({
    description: true,
    shipping: false,
    sustainability: false,
  });
  const descText = description || `The ${productName} is a testament to minimalist design and maximum quality. Crafted from premium materials, it offers a structured yet breathable fit that evolves with every wear.`;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const preventPointerFocus = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <section>
        <button
          type="button"
          aria-expanded={openSections.description}
          className="flex min-h-11 w-full touch-manipulation select-none items-center justify-between text-left text-base font-bold uppercase tracking-widest transition-colors hover:text-primary sm:text-sm"
          onPointerDown={preventPointerFocus}
          onClick={() => toggleSection("description")}
        >
          Description
          <span className={`material-symbols-outlined transition-transform ${openSections.description ? "rotate-180" : ""}`}>expand_more</span>
        </button>
        {openSections.description ? (
          <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-3">
            <p>{descText}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>100% Premium Organic Cotton</li>
              <li>Boxy, oversized silhouette</li>
              <li>Ribbed crewneck collar</li>
              <li>Signature HEUREUX logo embroidery</li>
            </ul>
          </div>
        ) : null}
      </section>
      {/* <section>
        <button
          type="button"
          aria-expanded={openSections.shipping}
          className="flex min-h-11 w-full touch-manipulation select-none items-center justify-between text-left text-base font-bold uppercase tracking-widest transition-colors hover:text-primary sm:text-sm"
          onPointerDown={preventPointerFocus}
          onClick={() => toggleSection("shipping")}
        >
          Shipping & Returns
          <span className={`material-symbols-outlined transition-transform ${openSections.shipping ? "rotate-180" : ""}`}>expand_more</span>
        </button>
        {openSections.shipping ? (
          <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <p>Free standard shipping on orders over $150. Returns accepted within 30 days of purchase in original condition with tags attached.</p>
          </div>
        ) : null}
      </section>
      <section>
        <button
          type="button"
          aria-expanded={openSections.sustainability}
          className="flex min-h-11 w-full touch-manipulation select-none items-center justify-between text-left text-base font-bold uppercase tracking-widest transition-colors hover:text-primary sm:text-sm"
          onPointerDown={preventPointerFocus}
          onClick={() => toggleSection("sustainability")}
        >
          Sustainability
          <span className={`material-symbols-outlined transition-transform ${openSections.sustainability ? "rotate-180" : ""}`}>expand_more</span>
        </button>
        {openSections.sustainability ? (
          <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <p>Produced in fair-trade certified facilities using GOTS certified organic cotton. Our packaging is 100% biodegradable.</p>
          </div>
        ) : null}
      </section> */}
    </>
  );
}
