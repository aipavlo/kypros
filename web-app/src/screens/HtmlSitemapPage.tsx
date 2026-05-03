import { AppLink as Link } from "@/src/components/AppLink";
import { getHtmlSitemapSections } from "@/src/seo/htmlSitemap";

export function HtmlSitemapPage() {
  const sections = getHtmlSitemapSections();

  return (
    <div className="stack">
      <section className="panel page-banner html-sitemap-hero">
        <p className="eyebrow">HTML sitemap</p>
        <h1>Карта сайта: ключевые страницы и уроки</h1>
        <p className="section-copy">
          Обычная HTML-страница со ссылками на главные search-entry routes и стартовые lesson pages,
          чтобы по сайту можно было пройтись без XML sitemap и без длинного ручного поиска.
        </p>
      </section>

      {sections.map((section) => (
        <section className="panel html-sitemap-panel" key={section.title}>
          <div className="section-head">
            <div>
              <p className="eyebrow">Навигация</p>
              <h2>{section.title}</h2>
              <p className="section-copy">{section.description}</p>
            </div>
          </div>

          <div className="html-sitemap-grid">
            {section.links.map((link) => (
              <Link className="card-link-panel html-sitemap-card" key={link.href} to={link.href}>
                <h3>{link.label}</h3>
                <p>{link.description ?? "Открыть страницу"}</p>
                <span className="action-link">Открыть страницу</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
