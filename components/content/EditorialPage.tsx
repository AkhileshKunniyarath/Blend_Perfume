import type { ReactNode } from 'react';

type EditorialSection = {
  title: string;
  paragraphs: string[];
};

type EditorialPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt?: string;
  sections: EditorialSection[];
  noteTitle: string;
  noteBody: ReactNode;
};

export default function EditorialPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
  noteTitle,
  noteBody,
}: EditorialPageProps) {
  return (
    <div className="pb-24">
      <section className="section-shell py-10 sm:py-14">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.48fr]">
          <div className="luxury-panel rounded-[2.4rem] p-7 sm:p-9">
            <p className="text-xs uppercase tracking-[0.36em] text-[var(--accent-strong)]">{eyebrow}</p>
            <h1 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--foreground-soft)]">{intro}</p>

            {updatedAt && (
              <div className="mt-8 inline-flex rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--foreground-soft)]">
                Updated {updatedAt}
              </div>
            )}

            <div className="mt-10 space-y-5">
              {sections.map((section) => (
                <section key={section.title} className="rounded-[1.8rem] border border-white/55 bg-white/58 p-5 sm:p-6">
                  <h2 className="text-2xl text-[var(--deep-black)]">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--foreground-soft)] sm:text-[15px]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="luxury-panel h-fit rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.34em] text-[var(--accent-strong)]">Need Help?</p>
            <h2 className="mt-4 text-2xl text-[var(--deep-black)]">{noteTitle}</h2>
            <div className="mt-5 text-sm leading-7 text-[var(--foreground-soft)]">{noteBody}</div>
          </aside>
        </div>
      </section>
    </div>
  );
}
