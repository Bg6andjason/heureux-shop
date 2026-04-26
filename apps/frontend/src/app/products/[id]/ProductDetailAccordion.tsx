"use client";

interface ProductDetailAccordionProps {
  description?: string | null;
  productName: string;
}

export default function ProductDetailAccordion({ description, productName }: ProductDetailAccordionProps) {
  const descText = description || `The ${productName} is a testament to minimalist design and maximum quality. Crafted from premium materials, it offers a structured yet breathable fit that evolves with every wear.`;

  return (
    <>
      <details className="group" open>
        <summary className="flex justify-between items-center font-bold text-sm uppercase tracking-widest cursor-pointer list-none">
          Description
          <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3">
          <p>{descText}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>100% Premium Organic Cotton</li>
            <li>Boxy, oversized silhouette</li>
            <li>Ribbed crewneck collar</li>
            <li>Signature HEUREUX logo embroidery</li>
          </ul>
        </div>
      </details>
      <details className="group">
        <summary className="flex justify-between items-center font-bold text-sm uppercase tracking-widest cursor-pointer list-none">
          Shipping & Returns
          <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>Free standard shipping on orders over $150. Returns accepted within 30 days of purchase in original condition with tags attached.</p>
        </div>
      </details>
      <details className="group">
        <summary className="flex justify-between items-center font-bold text-sm uppercase tracking-widest cursor-pointer list-none">
          Sustainability
          <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>Produced in fair-trade certified facilities using GOTS certified organic cotton. Our packaging is 100% biodegradable.</p>
        </div>
      </details>
    </>
  );
}
