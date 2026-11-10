import { skillGroups } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading, Stagger } from "./SectionStage";

export function Skills() {
  return (
    <Stage id="skills">
      <StageHeading>Skills</StageHeading>
      <Stagger className="skill-grid">
        {skillGroups.map((group) => (
          <GlowCard key={group.name} className="skill-group" stagger>
            <h3>{group.name}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlowCard>
        ))}
      </Stagger>
    </Stage>
  );
}
