const Header = () => {
  return (
    <div className="text-center mb-16 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-medium text-emerald-400/60 tracking-[0.2em] uppercase">НДС Калькулятор</span>
      </div>
      <h1 className="sm:text-7xl font-light tracking-tight text-white/95 text-5xl">
        Узнать размер НДС для ИП
      </h1>
      <p className="text-lg font-light text-slate-400">
        или как не сесть в тюрьму за неуплату налогов в 2026 году
      </p>
    </div>
  );
};

export default Header;
