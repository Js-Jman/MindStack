export const WelcomeBanner = () => {
  return (
    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-md">
      <h1 className="text-3xl font-bold tracking-tight"> 
        {/* Changed from text-5xl to text-3xl and font-extrabold to font-bold */}
        <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-500 bg-clip-text text-transparent">
          Hello, Admin! 👋
        </span>
      </h1>
      <p className="text-slate-500 mt-2 text-base font-medium max-w-xl leading-relaxed">
        {/* Changed mt-4 to mt-2, text-lg to text-base, and max-w-2xl to max-w-xl */}
        Welcome back to the MindStack control center. Monitor your platform&apos;s growth, manage users, and handle support requests all in one place.
      </p>
    </div>
  );
};