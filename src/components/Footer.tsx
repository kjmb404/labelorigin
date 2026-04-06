const serviceLinks = [
  { label: "New Product Development", href: "#npd" },
  { label: "Branding & Packaging", href: "#branding" },
  { label: "Manufacturing", href: "#manufacturing" },
  { label: "Third Party Testing", href: "#testing" },
];

const companyLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Services", href: "#services" },
  { label: "Previous Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-section-light">
      {/* Contact CTA */}
      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-24 md:py-32 text-center border-b border-border">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
          Building something
          <br />
          worth making properly?
        </h2>
        <p className="text-muted text-lg mb-10 max-w-lg mx-auto">
          If you have a clear category ambition and want a manufacturing partner
          you can grow with — we should talk.
        </p>
        <a
          href="mailto:hello@labelorigin.com"
          className="inline-block bg-foreground text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-primary-light transition-colors"
        >
          hello@labelorigin.com
        </a>
      </div>

      {/* Footer links */}
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 text-xs text-muted">
          <div className="space-y-1">
            <p className="text-foreground font-medium text-sm mb-2">Label Origin</p>
            <p>12 Pittbrook Street</p>
            <p>Manchester, M12 6AT</p>
            <p className="mt-2">ISO9001 Accredited</p>
          </div>

          <div className="flex gap-12">
            <div className="space-y-1.5">
              <p className="text-foreground font-medium mb-1">Services</p>
              {serviceLinks.map((link) => (
                <a key={link.label} href={link.href} className="block hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-foreground font-medium mb-1">Company</p>
              {companyLinks.map((link) => (
                <a key={link.label} href={link.href} className="block hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-4 text-xs text-muted">
          Copyright &copy; {new Date().getFullYear()} Label Origin. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
