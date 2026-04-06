"use client";

import { BentoGridShowcase } from "@/components/ui/bento-product-features";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Leaf, Zap, Droplets, Package, Layers } from "lucide-react";

const GummyCard = () => (
  <Card className="flex h-full flex-col bg-[#1d1d1f] text-white border-0">
    <CardHeader>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
        <FlaskConical className="w-6 h-6 text-white" />
      </div>
      <CardTitle className="text-white text-xl">Gummy Specialism</CardTitle>
      <CardDescription className="text-white/60">
        Our core format. Vegan, gelatine, sucrose-free, and sugar-free matrices — all mastered in-house. Complex active stacks handled with precision.
      </CardDescription>
    </CardHeader>
    <CardFooter className="mt-auto flex flex-wrap gap-2">
      {["Vegan", "Gelatine", "Sugar-free", "Sucrose-free"].map((tag) => (
        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/70">
          {tag}
        </span>
      ))}
    </CardFooter>
  </Card>
);

const FormatCountCard = () => (
  <Card className="h-full border-[#d2d2d7]">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div>
        <CardTitle className="text-base font-medium text-[#1d1d1f]">Active Formats</CardTitle>
        <CardDescription>8 product formats supported</CardDescription>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { icon: FlaskConical, label: "Gummy" },
          { icon: Droplets, label: "Drink" },
          { icon: Layers, label: "Powder" },
          { icon: Package, label: "Bar" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1 text-xs bg-[#f5f5f7] rounded-full px-2.5 py-1 text-[#1d1d1f]">
            <Icon className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StatCard = () => (
  <Card className="relative h-full overflow-hidden border-[#d2d2d7]">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: "radial-gradient(#1d1d1f 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    />
    <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
      <span className="text-7xl font-bold text-[#1d1d1f]">50+</span>
      <span className="text-sm text-[#86868b] mt-2">brands launched</span>
    </CardContent>
  </Card>
);

const CertCard = () => (
  <Card className="h-full border-[#d2d2d7]">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-medium text-[#1d1d1f]">Certified</CardTitle>
          <CardDescription>Every batch, every time</CardDescription>
        </div>
        <Badge variant="outline" className="border-green-300 text-green-700 text-[10px]">
          ISO9001
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-[#1d1d1f]">Vegan Society approved</span>
      </div>
    </CardContent>
  </Card>
);

const PowderCard = () => (
  <Card className="h-full border-[#d2d2d7]">
    <CardContent className="flex h-full flex-col justify-end p-6">
      <Zap className="w-5 h-5 text-[#86868b] mb-3" />
      <CardTitle className="text-base font-medium text-[#1d1d1f]">Powder Blends</CardTitle>
      <CardDescription className="mt-1">
        Nootropic stacks, pre-workout, collagen, and adaptogen blends — precisely dosed.
      </CardDescription>
    </CardContent>
  </Card>
);

const OtherFormatsCard = () => (
  <Card className="h-full border-[#d2d2d7]">
    <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <CardTitle className="text-base font-medium text-[#1d1d1f]">More Formats</CardTitle>
        <CardDescription>Health drinks · Effervescents · Chewable tablets · Functional bars · Capsules</CardDescription>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {["Drink", "Effervescent", "Chewable", "Bar", "Capsule"].map((f) => (
          <span key={f} className="text-xs font-medium px-3 py-1 rounded-full border border-[#d2d2d7] text-[#1d1d1f]">
            {f}
          </span>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function Stats() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            By the numbers.
          </h2>
        </div>
        <p className="text-center text-[#86868b] text-lg md:text-xl max-w-2xl mx-auto mb-16">
          The infrastructure behind the brands you see on shelf.
        </p>

        <BentoGridShowcase
          integration={<GummyCard />}
          trackers={<FormatCountCard />}
          statistic={<StatCard />}
          focus={<CertCard />}
          productivity={<PowderCard />}
          shortcuts={<OtherFormatsCard />}
        />
      </div>
    </section>
  );
}
