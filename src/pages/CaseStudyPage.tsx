import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ExternalLink, Quote } from 'lucide-react';
import { AB_SUMMARY, ADOPTION_AB, PROJECT_META, QA_TICKETS, RESEARCH, TASK_TIMINGS, qaReduction, taskTimeReduction } from '@/data/caseStudy';
import { fmtPct, fmtSeconds } from '@/lib/format';
import { useLab } from '@/state/LabContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Dumbbell } from '@/components/charts/Dumbbell';
import { StatTile } from '@/components/widgets/StatTile';
import { RevenueTrend } from '@/components/widgets/RevenueTrend';
import { AccountHealth } from '@/components/widgets/AccountHealth';
import s from './CaseStudyPage.module.css';

const SECTIONS = [
  { id: 'context', label: 'Context' },
  { id: 'research', label: 'Research' },
  { id: 'principles', label: 'Principles' },
  { id: 'widgets', label: 'Tables → widgets' },
  { id: 'filters', label: 'Filter panel A/B' },
  { id: 'handoff', label: 'Storybook handoff' },
  { id: 'results', label: 'Results' },
  { id: 'learnings', label: 'Learnings' },
];

function Section({ id, number, title, lead, children }: { id: string; number: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <div className={s.sectionHead}>
        <span className={s.sectionNo}>{number}</span>
        <h2 id={`${id}-h`} className={s.sectionTitle}>
          {title}
        </h2>
        {lead && <p className={s.lead}>{lead}</p>}
      </div>
      <div className={s.sectionBody}>{children}</div>
    </section>
  );
}

function Figure({ caption, children, flush = false }: { caption: string; children: ReactNode; flush?: boolean }) {
  return (
    <figure className={s.figure}>
      <div className={flush ? s.figureFlush : s.figureBody}>{children}</div>
      <figcaption className={s.figcaption}>{caption}</figcaption>
    </figure>
  );
}

export function CaseStudyPage() {
  const { setFilterVariant, setHeatmap } = useLab();
  const [activeId, setActiveId] = useState('context');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const adoptionData = ADOPTION_AB.map((d) => ({ label: `Day ${d.day}`, A: d.A, B: d.B }));
  const qaData = QA_TICKETS.before.map((v, i) => ({ label: `S${i + 1}`, before: v, after: QA_TICKETS.after[i] }));

  return (
    <div className={s.page}>
      <PageHeader
        eyebrow="Case study · B2B enterprise analytics"
        title="Turning a legacy data table into a dashboard people actually open"
        description="How a data-dense revenue report became a customizable, visual workspace — and the research, A/B testing and Storybook workflow that got it shipped pixel-perfect."
      />

      <div className={s.hero}>
        <dl className={s.meta}>
          <div>
            <dt>Role</dt>
            <dd>{PROJECT_META.role}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{PROJECT_META.timeline}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{PROJECT_META.team}</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>{PROJECT_META.tools}</dd>
          </div>
        </dl>
        <div className={s.outcomes}>
          <StatTile label="Task execution time" value={`−${Math.round(taskTimeReduction * 100)}%`} delta={{ text: 'median across 6 core tasks', direction: 'down', good: true }} hero />
          <StatTile label="Design QA bug tickets" value={`−${Math.round(qaReduction * 100)}%`} delta={{ text: '8 sprints after Storybook adoption', direction: 'down', good: true }} />
          <StatTile label="Daily filter adoption" value={`+${Math.round(AB_SUMMARY.lift * 100)}%`} delta={{ text: `${fmtPct(AB_SUMMARY.variantA)} → ${fmtPct(AB_SUMMARY.variantB)}, p = ${AB_SUMMARY.pValue}`, direction: 'up', good: true }} />
        </div>
      </div>

      <div className={s.layout}>
        <nav className={s.toc} aria-label="On this page">
          <ol>
            {SECTIONS.map((sec, i) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className={activeId === sec.id ? s.tocActive : undefined}>
                  <span className={s.tocNo}>{String(i + 1).padStart(2, '0')}</span>
                  {sec.label}
                </a>
              </li>
            ))}
          </ol>
          <div className={s.tocLinks}>
            <Link to="/legacy">
              Legacy view <ArrowRight size={12} />
            </Link>
            <Link to="/">
              Live dashboard <ArrowRight size={12} />
            </Link>
            <a href="http://localhost:6006" target="_blank" rel="noreferrer">
              Storybook <ExternalLink size={12} />
            </a>
          </div>
        </nav>

        <div className={s.content}>
          <Section id="context" number="01" title="Context" lead="Vantage sells revenue intelligence to B2B companies. Its analytics module was a set of 20+ column reports exported from the warehouse — accurate, complete, and almost never opened.">
            <div className={s.cols2}>
              <div>
                <h3 className={s.h3}>The problem</h3>
                <p>
                  Enterprise RevOps analysts, CS managers and sales leaders all relied on the same “Account Revenue Detail” report. It showed everything, in the same 11px type, behind a batch filter form. In interviews, people described it as a <em>source</em>, not a <em>tool</em>: they exported it to a spreadsheet to build the chart they needed, every week.
                </p>
                <h3 className={s.h3}>The brief</h3>
                <p>Redesign the analytics experience so enterprise users can answer their core questions inside the product, faster — without losing the depth power users depend on.</p>
              </div>
              <div className={s.callout}>
                <h3 className={s.h3}>What I owned</h3>
                <ul className={s.checklist}>
                  {['Discovery research and task analysis', 'Information architecture and widget system', 'Interaction design for filtering, customization and tables', 'Design tokens and the Storybook component library', 'A/B test design and heat-map analysis', 'Design QA with four front-end engineers'].map((t) => (
                    <li key={t}>
                      <CheckCircle2 size={14} aria-hidden /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="research" number="02" title="Research" lead={`${RESEARCH.interviews} contextual interviews, ${RESEARCH.baselineSessions} timed baseline sessions and heat maps from ${RESEARCH.heatmapSessions.toLocaleString()} sessions set the baseline.`}>
            <div className={s.personas}>
              {RESEARCH.personas.map((p) => (
                <article key={p.name} className={s.persona}>
                  <div className={s.personaHead}>
                    <h3 className={s.h3}>{p.name}</h3>
                    <Badge tone="neutral">{p.share}</Badge>
                  </div>
                  <p>
                    <strong>Goal.</strong> {p.goal}
                  </p>
                  <p>
                    <strong>Pain.</strong> {p.pain}
                  </p>
                </article>
              ))}
            </div>
            <div className={s.quotes}>
              {RESEARCH.quotes.map((q) => (
                <blockquote key={q.who} className={s.quote}>
                  <Quote size={16} aria-hidden className={s.quoteIcon} />
                  <p>“{q.text}”</p>
                  <cite>— {q.who}</cite>
                </blockquote>
              ))}
            </div>
            <h3 className={s.h3}>What the heat maps said</h3>
            <ul className={s.bullets}>
              <li>
                <strong>{Math.round(AB_SUMMARY.abandonA * 100)}% of sessions</strong> that opened the filter dialog closed it without applying — the hottest element on the page was a dead end.
              </li>
              <li>
                The date dropdown took <strong>{AB_SUMMARY.clicksToApplyA} clicks per session</strong> on average: users were hunting for “last quarter”.
              </li>
              <li>The ARR column header was the third hottest area — people were sorting a table to approximate a trend chart.</li>
            </ul>
            <p className={s.tip}>
              Replay it: open <strong>UX Lab → Click heat map</strong> on the Overview with variant A, then switch to variant B.{' '}
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setFilterVariant('A');
                  setHeatmap(true);
                }}
              >
                Turn on heat map for variant A
              </Button>
            </p>
          </Section>

          <Section id="principles" number="03" title="Design principles" lead="Four rules, agreed with the PM and engineering lead before any screens were drawn. Every later debate was settled against them.">
            <ol className={s.principles}>
              {[
                ['Lead with the answer', 'One hero number per view, stat tiles for the handful that matter, charts for shape, tables for depth — in that order.'],
                ['One slice, everywhere', 'A single filter row scopes every widget. The numbers always agree, so trust is never the question.'],
                ['Colour is a job, not decoration', 'Categorical hues in a fixed, CVD-validated order; sequential for magnitude; diverging for polarity; status colours reserved and always paired with an icon.'],
                ['Nothing gated behind hover', 'Every chart has a table twin, keyboard access and direct labels for the values that matter.'],
              ].map(([t, b], i) => (
                <li key={t} className={s.principle}>
                  <span className={s.principleNo}>{i + 1}</span>
                  <div>
                    <h3 className={s.h3}>{t}</h3>
                    <p>{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="widgets" number="04" title="From tables to customizable widgets" lead="I mapped each question from the task analysis to the form that answers it fastest, then made the result rearrangeable — because an analyst’s Monday is not a VP’s Monday.">
            <div className={s.cols2}>
              <Figure caption="ARR trend widget: zoomed baseline with headroom, previous period in grey, crosshair reads every series, value labelled at the line end. Live data from the demo dataset.">
                <RevenueTrend size="md" tableView={false} />
              </Figure>
              <Figure caption="Account health: one whole split into three parts. Status colours never carry meaning alone — the icon and label travel with them.">
                <AccountHealth size="sm" tableView={false} />
              </Figure>
            </div>
            <h3 className={s.h3}>Decisions that moved the numbers</h3>
            <ul className={s.bullets}>
              <li>
                <strong>Ten widgets, four categories.</strong> Each legacy column group became a widget with a single job. Users show, hide, resize and drag-reorder them; the layout persists per device.
              </li>
              <li>
                <strong>Stat tiles replace header rows.</strong> A value, a signed delta against a named period and a 12-point sparkline answer “how are we doing?” before anyone scrolls.
              </li>
              <li>
                <strong>Tables stayed — redesigned.</strong> Sticky columns, inline sparklines, health badges, column visibility, density, CSV export of exactly what is on screen. Depth is one click away, not the default.
              </li>
              <li>
                <strong>Every chart has a table view.</strong> The toggle in each widget header turned out to be the most used “power” feature, and it made the accessibility review a formality.
              </li>
            </ul>
          </Section>

          <Section id="filters" number="05" title="Filter panel: A/B test" lead="The hottest and least successful element in the legacy product was the filter dialog. I redesigned it as an always-visible row and tested both versions with real traffic.">
            <div className={s.abGrid}>
              <div className={s.abCard}>
                <div className={s.abHead}>
                  <Badge tone="neutral">Variant A</Badge>
                  <span>Legacy modal</span>
                </div>
                <ul className={s.bullets}>
                  <li>Filters hidden behind a button</li>
                  <li>Single-select dropdowns</li>
                  <li>Nothing changes until “Apply”</li>
                  <li>No memory of past selections</li>
                </ul>
              </div>
              <div className={s.abCard}>
                <div className={s.abHead}>
                  <Badge tone="accent">Variant B</Badge>
                  <span>Inline panel</span>
                </div>
                <ul className={s.bullets}>
                  <li>One row above everything it scopes; date range first</li>
                  <li>Preset rows, multi-select with counts, instant apply</li>
                  <li>Applied filters echoed as removable chips</li>
                  <li>Saved views for recurring questions</li>
                </ul>
              </div>
            </div>
            <Figure caption={`Share of daily active users applying at least one filter, 28-day test, n = ${AB_SUMMARY.users.toLocaleString()}. Variant B settles ${Math.round(AB_SUMMARY.lift * 100)}% above A (relative), p = ${AB_SUMMARY.pValue}.`}>
              <LineChart
                data={adoptionData}
                series={[
                  { key: 'A', label: 'Variant A · legacy modal', color: 'var(--series-muted)', muted: true },
                  { key: 'B', label: 'Variant B · inline panel', color: 'var(--series-1)' },
                ]}
                height={240}
                yFormat={(v) => `${Math.round(v * 100)}%`}
                valueFormat={(v) => fmtPct(v, 1)}
                baseline="auto"
                ariaLabel="Daily filter adoption, variant A versus variant B"
                xTickCount={7}
              />
            </Figure>
            <table className={s.resultsTable}>
              <caption className="sr-only">A/B test metrics</caption>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Variant A</th>
                  <th scope="col">Variant B</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Daily filter adoption</th>
                  <td>{fmtPct(AB_SUMMARY.variantA)}</td>
                  <td>{fmtPct(AB_SUMMARY.variantB)}</td>
                  <td className={s.good}>+{Math.round(AB_SUMMARY.lift * 100)}% relative</td>
                </tr>
                <tr>
                  <th scope="row">Clicks to apply a date range</th>
                  <td>{AB_SUMMARY.clicksToApplyA}</td>
                  <td>{AB_SUMMARY.clicksToApplyB}</td>
                  <td className={s.good}>−{Math.round((1 - AB_SUMMARY.clicksToApplyB / AB_SUMMARY.clicksToApplyA) * 100)}%</td>
                </tr>
                <tr>
                  <th scope="row">Filter flow abandonment</th>
                  <td>{Math.round(AB_SUMMARY.abandonA * 100)}%</td>
                  <td>{Math.round(AB_SUMMARY.abandonB * 100)}%</td>
                  <td className={s.good}>−{Math.round(AB_SUMMARY.abandonA * 100 - AB_SUMMARY.abandonB * 100)} pts</td>
                </tr>
              </tbody>
            </table>
            <p className={s.tip}>
              Both variants are live in this build — switch them in <strong>UX Lab</strong> on the Overview and compare the heat maps.
            </p>
          </Section>

          <Section id="handoff" number="06" title="Design–engineering handoff with Storybook" lead="Pixel-perfect is a process, not a promise. Tokens became the contract, Storybook became the review room, and inspect mode made the 8pt grid visible to everyone.">
            <div className={s.cols2}>
              <div>
                <ul className={s.bullets}>
                  <li>
                    <strong>Tokens first.</strong> Colour, type, spacing, radius and motion live in one CSS file consumed by the product and by Storybook. Dark mode is a selected set of steps, not an inverted palette.
                  </li>
                  <li>
                    <strong>Every component has a story</strong> with controls, an accessibility panel and light/dark toggles. Reviews happened against the story, not a screenshot.
                  </li>
                  <li>
                    <strong>Inspect mode</strong> ships in the product behind the UX Lab menu: an 8pt grid and labelled component outlines, so a QA ticket could say “StatTile, 12px off grid” instead of “looks wrong”.
                  </li>
                  <li>
                    <strong>Chart specs as code.</strong> 2px lines, ≤24px bars with a 4px rounded data end, 2px surface gaps, hairline grids — written once in the chart primitives, impossible to drift.
                  </li>
                </ul>
              </div>
              <Figure caption="Design-related QA tickets per two-week sprint, eight sprints before and after the Storybook workflow. Average fell from 13.0 to 9.75 (−25%).">
                <BarChart
                  data={qaData}
                  series={[
                    { key: 'before', label: 'Before Storybook', color: 'var(--seq-250)' },
                    { key: 'after', label: 'After Storybook', color: 'var(--seq-550)' },
                  ]}
                  mode="grouped"
                  height={220}
                  yFormat={(v) => String(v)}
                  ariaLabel="Design QA tickets per sprint, before and after Storybook"
                />
              </Figure>
            </div>
          </Section>

          <Section id="results" number="07" title="Results" lead="Measured with the same six tasks and the same participant profile as the baseline, eight weeks after launch.">
            <Figure caption={`Median time on task, n = 14 per round. Overall ${Math.round(taskTimeReduction * 100)}% faster; the biggest gains came from questions that previously required an export.`}>
              <Dumbbell data={TASK_TIMINGS.map((t) => ({ key: t.task, label: t.task, before: t.before, after: t.after }))} valueFormat={fmtSeconds} beforeLabel="Legacy report" afterLabel="Redesign" ariaLabel="Task time before and after the redesign" />
            </Figure>
            <div className={s.resultsGrid}>
              <div className={s.resultCard}>
                <span className={s.resultValue}>−{Math.round(taskTimeReduction * 100)}%</span>
                <span className={s.resultLabel}>task execution time for enterprise users</span>
              </div>
              <div className={s.resultCard}>
                <span className={s.resultValue}>−{Math.round(qaReduction * 100)}%</span>
                <span className={s.resultLabel}>design QA bug tickets after Storybook integration</span>
              </div>
              <div className={s.resultCard}>
                <span className={s.resultValue}>+{Math.round(AB_SUMMARY.lift * 100)}%</span>
                <span className={s.resultLabel}>daily adoption of filtering after the panel redesign</span>
              </div>
            </div>
          </Section>

          <Section id="learnings" number="08" title="Learnings & next steps">
            <ul className={s.bullets}>
              <li>
                <strong>Depth is a feature; default depth is a bug.</strong> Power users did not want fewer columns — they wanted the right ones first. Column visibility and the table-view toggle preserved trust while the dashboard changed the default.
              </li>
              <li>
                <strong>Test the hottest element, not the prettiest screen.</strong> The filter dialog was never on the roadmap; the heat map put it there, and it produced the largest behavioural change in the project.
              </li>
              <li>
                <strong>Tokens cut more tickets than reviews did.</strong> Most QA tickets were drift, not disagreement. A shared source of truth removed the category.
              </li>
              <li>
                <strong>Next.</strong> Per-role default layouts, alert thresholds on health and renewals, and a shareable snapshot of any view for the Monday call.
              </li>
            </ul>
            <p className={s.disclaimer}>Dataset, accounts and research figures in this build are synthetic and illustrative; they are shaped to match the outcomes reported for the project.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
