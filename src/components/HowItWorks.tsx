import { FlaskConical, Microscope, Truck, FileCheck, Brain, Globe } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Gummy Specialism",
    description:
      "Vegan, gelatine, sucrose-free, sugar-free. Every matrix mastered in-house with formulation depth that sets benchmarks.",
  },
  {
    icon: Brain,
    title: "End-to-End NPD",
    description:
      "Category analysis to regulatory review. You focus on brand and sales. We make the product work.",
  },
  {
    icon: Microscope,
    title: "Independent QA",
    description:
      "UKAS-accredited lab testing on every batch. Full Certificate of Analysis, sharable with retailers.",
  },
  {
    icon: Globe,
    title: "Europe-Ready",
    description:
      "ISO9001 accredited, UK-manufactured. Labelling compliance and documentation built in from day one.",
  },
  {
    icon: FileCheck,
    title: "Sophisticated Formulation",
    description:
      "Nootropic blends, adaptogenic synergies, dual-extract mushrooms. If the science supports it, we can build it.",
  },
  {
    icon: Truck,
    title: "Commercialisation Platform",
    description:
      "Expertise, infrastructure, and supply relationships that turn a concept into a category-defining product.",
  },
];

export default function HowItWorks() {
  return (
    <section id="platform" className="py-24 md:py-32">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Our Platform.
          </h2>
        </div>
        <p className="text-center text-muted text-lg md:text-xl max-w-2xl mx-auto mb-20">
          Built for brands that want to lead their category.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {features.map((feature) => (
            <div key={feature.title}>
              <feature.icon className="text-muted mb-4" size={28} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
