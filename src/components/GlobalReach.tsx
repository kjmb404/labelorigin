"use client"

import dynamic from "next/dynamic"

const GlobeInteractive = dynamic(
  () => import("@/components/ui/cobe-globe-interactive").then((m) => m.GlobeInteractive),
  { ssr: false }
)

const ukMarkers: { id: string; location: [number, number]; name: string; users: number }[] = [
  { id: "london", location: [51.51, -0.12], name: "London", users: 0 },
  { id: "manchester", location: [53.48, -2.24], name: "Manchester", users: 0 },
  { id: "berlin", location: [52.52, 13.41], name: "Berlin", users: 0 },
  { id: "amsterdam", location: [52.37, 4.89], name: "Amsterdam", users: 0 },
  { id: "paris", location: [48.86, 2.35], name: "Paris", users: 0 },
  { id: "dubai", location: [25.2, 55.27], name: "Dubai", users: 0 },
  { id: "nyc", location: [40.71, -74.01], name: "New York", users: 0 },
]

export default function GlobalReach() {
  return (
    <section className="py-24 md:py-32 bg-section-light overflow-hidden">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Text */}
          <div className="flex-1 md:max-w-sm">
            <p className="text-accent text-sm font-medium mb-2">Distribution</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
              Built for
              <br />
              European retail.
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-6">
              UK-manufactured with full European documentation and labelling compliance built in.
              Ready for Holland &amp; Barrett, Whole Foods, and direct-to-consumer from day one.
            </p>
            <ul className="space-y-2 text-sm text-muted">
              {[
                "ISO9001 accredited facility",
                "UKAS-accredited third-party testing",
                "EU labelling & regulatory compliance",
                "UK, EU & DTC distribution ready",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Globe */}
          <div className="flex-1 w-full max-w-[420px] mx-auto">
            <GlobeInteractive
              markers={ukMarkers}
              speed={0.002}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
