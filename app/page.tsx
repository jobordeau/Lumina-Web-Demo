import Hero from "@/components/home/Hero";
import KeyStats from "@/components/home/KeyStats";
import Story from "@/components/home/Story";
import ArchPreview from "@/components/home/ArchPreview";
import Patterns from "@/components/home/Patterns";
import TechStack from "@/components/home/TechStack";
import ClosingCTA from "@/components/home/ClosingCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <KeyStats />
      <Story />
      <ArchPreview />
      <Patterns />
      <TechStack />
      <ClosingCTA />
    </>
  );
}
