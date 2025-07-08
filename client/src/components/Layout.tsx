import Navigation from "./Navigation";
import AudioPlayer from "./AudioPlayer";
import AnimatedBackground from "./AnimatedBackground";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter overflow-x-hidden relative">
      <AnimatedBackground />
      <Navigation />
      <AudioPlayer />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
