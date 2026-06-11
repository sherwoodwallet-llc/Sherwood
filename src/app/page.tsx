import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Thesis from "@/components/Thesis";
import ProductDemo from "@/components/ProductDemo";
import HowItWorks from "@/components/HowItWorks";
import Categories from "@/components/Categories";
import Dashboard from "@/components/Dashboard";
import Movement from "@/components/Movement";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Ticker />
      <Thesis />
      <ProductDemo />
      <HowItWorks />
      <Categories />
      <Dashboard />
      <Movement />
      <Waitlist />
      <Footer />
    </main>
  );
}
