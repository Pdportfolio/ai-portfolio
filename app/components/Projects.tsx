import { projects } from "@/app/lib/content";
import { GlowCard } from "./GlowCard";
import { Stage, StageHeading, Stagger } from "./SectionStage";

export function Projects() {
  return (
    <Stage id="projects">
      <StageHeading>Projects</StageHeading>
      <Stagger className="project-list">
        {projects.map((project) => (
          <GlowCard key={project.github} className="project" stagger>
            <div className="project__head">
              <h3>{project.title}</h3>
              {project.demo ? <span className="live-flag">Live demo</span> : null}
            </div>
            <p>{project.body}</p>
            <div className="project__links">
              <a href={project.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              {project.demo ? (
                <a href={project.demo} target="_blank" rel="noreferrer">
                  Open live demo
                </a>
              ) : null}
            </div>
          </GlowCard>
        ))}
      </Stagger>
    </Stage>
  );
}
