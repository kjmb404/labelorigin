import Hero from "@/components/Hero";
import LeadCapture from "@/components/LeadCapture";
import Services from "@/components/Services";
import Formats from "@/components/Formats";
import HowItWorks from "@/components/HowItWorks";
import GlobalReach from "@/components/GlobalReach";
import Guarantee from "@/components/Guarantee";
import VerticalTabs from "@/components/ui/vertical-tabs";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LeadCapture />
        <Services />
        <Formats />
        <HowItWorks />
        <GlobalReach />
        <Guarantee />
        <VerticalTabs />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
