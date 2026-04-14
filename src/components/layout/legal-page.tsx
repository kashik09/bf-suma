import { PageContainer } from "@/components/layout/page-container";

interface LegalPageTocItem {
  id: string;
  label: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  toc: LegalPageTocItem[];
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, toc, children }: LegalPageProps) {
  return (
    <PageContainer className="py-10 sm:py-12">
      <header className="mx-auto mb-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Last updated: {lastUpdated}</p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0">
          <div className="prose prose-slate mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft prose-headings:font-semibold prose-h2:mt-10 prose-h2:border-t prose-h2:border-slate-200 prose-h2:pt-6 prose-h2:text-xl prose-h3:mt-6 prose-h3:text-lg prose-p:leading-7 prose-li:leading-7 prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline sm:p-8">
            {children}
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">On this page</p>
            <nav aria-label="Table of contents">
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      className="block rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      href={`#${item.id}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

export type { LegalPageTocItem };
