'use client'

import { usePathname } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'

export function WhatsAppButton() {
    const pathname = usePathname()

    if (pathname === '/map') return null
    return (
        <a
            href="https://wa.me/8801924572887"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer group"
            title="Chat on WhatsApp"
        >
            <FaWhatsapp className="w-8 h-8" />
            <span className="absolute right-full mr-3 bg-white dark:bg-slate-800 text-gray-800 dark:text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Contact Us
            </span>
        </a>
    )
}
