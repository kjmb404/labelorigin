const clients = [
  "Dr Fungi Performance Blend",
  "Shroomology Micros Focus Blend",
  "Mycologic Mind Flow Gummies",
  "Dr Fungi Vitality Blend",
  "Super Tahr Shilajit+ Gummies",
  "Shroomology Micros Energy Blend",
  "Kloris Vegan Gummies",
  "Solace Electrolytes",
];

export default function Providers() {
  return (
    <section id="work" className="py-24 md:py-32 bg-section-light">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Previous Work.
          </h2>
        </div>
        <p className="text-center text-muted text-lg md:text-xl max-w-2xl mx-auto mb-16">
          Brands that trust us with their product.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div
              key={client}
              className="bg-white rounded-2xl p-8 text-center hover:shadow-sm transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-section-light flex items-center justify-center">
                <span className="text-sm font-semibold text-muted">
                  {client.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </div>
              <h3 className="text-sm font-medium text-foreground leading-tight">
                {client}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
