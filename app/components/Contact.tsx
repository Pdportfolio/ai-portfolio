import { person } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading } from "./SectionStage";

export function Contact() {
  return (
    <Stage id="contact" narrow>
      <StageHeading>Contact</StageHeading>
      <GlowCard>
        <p className="lede">Email, GitHub, or LinkedIn.</p>
        <div className="contact-links">
          <a className="btn" href={`mailto:${person.email}`}>
            Email Prakhar
          </a>
          <a className="btn btn--ghost" href={person.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="btn btn--ghost" href={person.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
        <p className="contact-note">The floating chat is the live Agentic AI Portfolio assistant.</p>
      </GlowCard>
    </Stage>
  );
}
