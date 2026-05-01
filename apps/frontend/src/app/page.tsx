import Image from "next/image";
import Link from "next/link";
import FaultyTerminal from "@/app/components/vision/FaultyTerminal";

async function getLatestProducts(): Promise<
  {
    id: number;
    name: string;
    price: number;
    image_url?: string | null;
    category?: string | null;
  }[]
> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return [];
  try {
    const res = await fetch(`${baseUrl}/api/products?page=1`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { ok: boolean; items?: unknown[] };
    const items = Array.isArray(body.items) ? body.items.slice(0, 4) : [];
    return items as {
      id: number;
      name: string;
      price: number;
      image_url?: string | null;
      category?: string | null;
    }[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const latestProducts = await getLatestProducts();

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-primary/10">
          <div className="absolute inset-0 z-1 opacity-40 bg-cover bg-center">
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <FaultyTerminal
                scale={2.5}
                gridMul={[2, 1]}
                digitSize={1.2}
                timeScale={0.5}
                pause={false}
                scanlineIntensity={0.5}
                glitchAmount={1}
                flickerAmount={1}
                noiseAmp={1}
                chromaticAberration={0}
                dither={0}
                curvature={0.1}
                tint="#A7EF9E"
                mouseReact
                mouseStrength={0.5}
                pageLoadAnimation
                brightness={0.6}
              />
            </div>
          </div>

          <div className="gap-4 md:mt-24 flex flex-col items-center justify-center">
            <div className="h-full w-full from-black via-black/40 to-transparent flex items-center justify-center z-2">
              {/* <ASCIIText
              text="HEUREUX"
              enableWaves={true}  
              asciiFontSize={8}
            /> */}
              <h1 className="text-7xl md:text-[14rem] font-black leading-[0.8] tracking-normal text-slate-100 mix-blend-difference font-display">
                HEUREUX
              </h1>
            </div>

            <div className="relative z-10 text-center px-4 py-12 max-w-5xl mt-24 md:mt-32">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <p className="max-w-xs text-left text-sm font-medium leading-relaxed border-l-2 border-primary pl-4 tracking-tight text-slate-300">
                  PURE FORM OVER REDUNDANT FUNCTION. THE ESSENTIALS REIMAGINED
                  FOR THE MODERN BRUTALIST.
                </p>
                <Link
                  href="/products"
                  className="tap-target tap-target-solid group relative inline-flex items-center justify-center px-12 py-5 bg-primary text-white font-black tracking-widest text-lg overflow-hidden transition-all hover:pr-16"
                >
                  <span className="font-display">EXPLORE THE SHOP</span>
                  <span className="material-symbols-outlined absolute right-4 translate-x-10 group-hover:translate-x-0 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 hidden xl:block">
              <p className="text-[10px] font-bold tracking-[0.5em] uppercase vertical-text transform -rotate-90 origin-left text-primary/40">
                SPRING_SUMMER_2024
              </p>
            </div>
          </div>
        </section>

        {/* Featured Grid - Selected Gear */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-16 border-b border-primary/20 pb-8">
            <div>
              <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-2">
                {"// CURRENT_DROPS"}
              </span>
              <h2 className="text-6xl font-black tracking-normal uppercase font-display">
                Selected Gear
              </h2>
            </div>
            <Link
              className="tap-target tap-target-subtle -mx-2 rounded-full px-2 text-xs font-bold tracking-[0.2em] uppercase border-b border-primary pb-1 hover:text-primary transition-colors"
              href="/products"
            >
              View_All_Inventory
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-primary/10 border border-primary/10">
            {latestProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="tap-target tap-target-subtle bg-[var(--background-dark)] group cursor-pointer p-6 transition-all hover:bg-primary/5"
              >
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-primary/5 grayscale hover:grayscale-0 transition-all duration-500">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-primary tracking-widest mt-1">
                      {p.category ?? "CAT"} / COTTON
                    </p>
                  </div>
                  <span className="text-xl font-bold font-display">
                    NT$ {p.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Marquee */}
        <section className="bg-primary py-12 overflow-hidden border-y-4 border-black">
          <div className="flex whitespace-nowrap w-max">
            <div className="flex gap-20 text-white text-7xl font-black italic tracking-normal uppercase items-center font-display animate-marquee">
              <span>Pure Form</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Zero Waste</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Limited Release</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Radical Aesthetic</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Pure Form</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Zero Waste</span>
              <span>Pure Form</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Zero Waste</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Limited Release</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
              <span>Radical Aesthetic</span>
              <span className="material-symbols-outlined text-5xl">
                emergency
              </span>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-52 items-center">
            <div>
              <h2 className="text-7xl md:text-9xl font-black tracking-normal uppercase leading-none mb-8 font-display">
                JOIN_THE
                <br />
                <span className="text-primary italic">SYSTEM_</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium max-w-md">
                BE THE FIRST TO ACCESS ARCHIVE DROPS AND EXCLUSIVE
                COLLABORATIONS. NO SPAM, ONLY ESSENTIAL INTEL.
              </p>
            </div>
            <div className="flex flex-col items-start gap-6">
              <Link
                href="/login"
                className="tap-target tap-target-solid group relative inline-flex items-center justify-center overflow-hidden bg-primary px-12 py-5 text-lg font-black tracking-widest text-white transition-all hover:pr-16"
              >
                <span className="font-display">LOGIN_TO_JOIN</span>
                <span className="material-symbols-outlined absolute right-4 translate-x-10 transition-transform group-hover:translate-x-0">
                  arrow_forward
                </span>
              </Link>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                SIGN IN TO ACCESS MEMBER DROPS.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
