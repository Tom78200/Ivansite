import Navigation from "./Navigation";
import AudioPlayer from "./AudioPlayer";
import AnimatedBackground from "./AnimatedBackground";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,50%,8%)] via-[hsl(210,40%,12%)] to-[hsl(200,30%,15%)] text-white font-inter overflow-x-hidden relative">
      <AnimatedBackground />
      <Navigation />
      <AudioPlayer />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
