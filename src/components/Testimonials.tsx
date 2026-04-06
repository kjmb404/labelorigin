import { TestimonialCards } from "@/components/ui/testimonial"

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            What clients say.
          </h2>
        </div>
        <p className="text-center text-[#86868b] text-lg md:text-xl max-w-2xl mx-auto mb-16">
          Brands that trusted us to make it properly.
        </p>
        <TestimonialCards />
      </div>
    </section>
  )
}
