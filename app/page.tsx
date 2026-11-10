import { CornerLinks } from "./components/CornerLinks";
import { FluidBackground } from "./components/FluidBackground";
import { Hero } from "./components/Hero";
import { SectionBoundary } from "./components/SectionBoundary";
import { getLiveProfile } from "./lib/profile";

export default async function Home() {
  const profile = await getLiveProfile();

  return (
    <div className="page-lock">
      <a className="skip" href="#top">
        Skip to content
      </a>
      <FluidBackground />
      <CornerLinks />
      <main>
        <SectionBoundary>
          <Hero role={profile.role} focusBlurb={profile.focusBlurb} openToWork={profile.openToWork} />
        </SectionBoundary>
      </main>
    </div>
  );
}
