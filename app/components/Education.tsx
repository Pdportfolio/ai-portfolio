import { certifications, education } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading, Stagger } from "./SectionStage";

export function Education() {
  return (
    <Stage id="education">
      <StageHeading>Education</StageHeading>
      <Stagger className="edu-list">
        {education.map((entry) => (
          <GlowCard key={entry.school} className="edu" stagger>
            <h3>{entry.school}</h3>
            <p>{entry.detail}</p>
            {entry.dates ? <p className="edu__dates">{entry.dates}</p> : null}
          </GlowCard>
        ))}
        <GlowCard className="certs" stagger>
          <h3>Certifications</h3>
          <ul>
            {certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </GlowCard>
      </Stagger>
    </Stage>
  );
}
