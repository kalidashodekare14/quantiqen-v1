const AppLoading = () => {
  return (
    <div className="bg-background fixed inset-0 flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-chart-5 text-5xl font-bold tracking-widest sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          QUANTIQEN
        </h1>

        <div className="bg-primary/20 h-0.75 w-50 overflow-hidden rounded-full">
          <div className="loading-bar bg-chart-5 h-full w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default AppLoading;
