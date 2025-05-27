import Navigation from "./Navigation";
import AudioPlayer from "./AudioPlayer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[hsl(210,40%,12%)] text-white font-inter overflow-x-hidden">
      <Navigation />
      <AudioPlayer />
      <main>{children}</main>
    </div>
  );
}
