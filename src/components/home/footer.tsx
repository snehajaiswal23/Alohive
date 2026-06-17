import Link from "next/link"
import { MessageCircle } from "lucide-react"

const links = {
  Product:  ["How it works", "Features", "Pricing", "Changelog", "Status"],
  "For you": ["Salons", "Cafes", "Gyms", "Clinics", "Retail"],
  Company:  ["About", "Blog", "Careers", "Privacy Policy", "Terms of Service"],
}

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/5 pt-16 pb-8 px-6 relative">
      <div className="max-w-7xl mx-auto">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-display font-bold text-text-primary mb-3 tracking-tight">
              Al<span className="text-clarity-400">o</span>hive
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-5">
              Where every customer keeps coming back.
              WhatsApp-first growth for local businesses across India.
            </p>
            {/* WhatsApp inline link */}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-growth-400 hover:text-growth-300 transition-colors"
            >
              <MessageCircle size={13} />
              Chat with us on WhatsApp
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            © {year} Alohive · Made with care in Bangalore, India
          </p>
          <p className="text-xs text-text-tertiary">
            WhatsApp is a registered trademark of Meta Platforms, Inc.
          </p>
        </div>
      </div>

      {/* Floating WA button */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-12 h-12 bg-growth-500 rounded-full flex items-center justify-center shadow-xl glow-green-btn hover:bg-growth-400 transition-colors duration-200 z-50"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" fill="white" />
      </a>
    </footer>
  )
}
