import { experience } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading, Stagger } from "./SectionStage";

export function Experience() {
  return (
    <Stage id="experience">
      <StageHeading>Experience</StageHeading>
      <Stagger className="timeline">
        {experience.map((job) => (
          <GlowCard key={`${job.org}-${job.dates}`} className="job" stagger>
            <header>
              <h3>
                {job.title} — {job.org}
              </h3>
              <p>
                <span>{job.place}</span>
                <time>{job.dates}</time>
              </p>
            </header>
            <ul>
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </GlowCard>
        ))}
      </Stagger>
    </Stage>
  );
}
