import { Facebook, Twitter, Instagram, Youtube, Linkedin, Phone } from "lucide-react"

const FOOTER_LINKS = {
  Makers: ["Audi", "BMW", "Honda", "Mazda", "Mercedes", "Toyota", "Volkswagen", "Volvo"],
  Models: ["Coupe", "Hatchback", "Ninja", "Pick Up", "Sedan", "Station Wagon", "Van"],
  Regions: ["Cyprus", "Ireland", "Japan", "United Kingdom", "Pakistan"],
}

export default function Footer() {
  return (
    <footer className="bg-[#212123] text-gray-400">
      {/* Main footer */}
      <div className="px-4 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* Logo */}
              <div className="w-8 h-8 bg-[#FC7844] rounded flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white">Cars on Ship</span>
            </div>

            <p className="mb-6 text-xs leading-relaxed text-gray-500">
              Lorem ipsum dolor sit amet consectetur. Adipiscing ut faucibus ullamcorper velit adipiscing sed. 3 ullamcorper est facilisi. Ut pariatur nisi nisi malesuada parturient consequat nulla.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mb-6">
              {[Facebook, Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:border-[#FC7844] hover:text-[#FC7844] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Contact Us:</p>
              <a href="tel:+447761975326" className="flex items-center gap-2 text-xs text-[#FC7844] hover:text-[#e86a35] transition-colors">
                <Phone className="w-3 h-3" />
                +44 7761 975326
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide font-['Barlow_Condensed',sans-serif]">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-gray-500 hover:text-[#FC7844] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
          <span>© Copyright 2025 Cars on Ship. All rights reserved.</span>
          <a href="mailto:info@carsonship.com" className="hover:text-[#FC7844] transition-colors">
            info@carsonship.com
          </a>
        </div>
      </div>
    </footer>
  )
}