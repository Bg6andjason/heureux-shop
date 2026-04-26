import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-primary/20 py-20 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
            <h2 className="text-3xl font-black tracking-normal text-white font-display">HEUREUX</h2>
          </div>
          <p className="text-xs font-bold tracking-widest text-slate-500 leading-relaxed uppercase">
            Built for those who find beauty in the brutal.
            Designed in Paris. Dispatched worldwide.
            © 2024 HEUREUX_LAB. ALL_RIGHTS_RESERVED.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-8">{"// NAVIGATION"}</h4>
          <ul className="space-y-4">
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/products">Shop All</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/products">Latest Drops</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/products">Collections</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Size Guide</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-8">{"// SUPPORT"}</h4>
          <ul className="space-y-4">
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Shipping</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Returns</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Contact</Link></li>
            <li><Link className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-8">{"// CONNECT"}</h4>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          SYSTEM_STATUS: <span className="text-primary">ONLINE</span>
        </div>
        <div className="flex gap-8 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          <Link className="hover:text-slate-100 transition-colors" href="#">Privacy_Policy</Link>
          <Link className="hover:text-slate-100 transition-colors" href="#">Terms_Of_Service</Link>
          <Link className="hover:text-slate-100 transition-colors" href="#">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
