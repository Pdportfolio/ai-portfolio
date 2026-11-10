import { person } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading } from "./SectionStage";

export function About() {
  return (
    <Stage id="about" narrow>
      <StageHeading>About</StageHeading>
      <GlowCard>
        <p className="lede">{person.summary}</p>
      </GlowCard>
    </Stage>
  );
}
