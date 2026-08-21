import type { Metadata } from 'next'
import MapWrapper from '@/components/MapWrapper'

export const metadata: Metadata = {
    title: "Interactive Violence Map | Bangladesh District-wise Statistics",
    description: "Explore the live interactive map of political violence in Bangladesh. Filter by district, date, and incident type to see real-time data visualization. | ইন্টারঅ্যাক্টিভ ভায়োলেন্স ম্যাপ।",
    openGraph: {
        title: "Interactive Violence Map | Bangladesh District-wise Statistics",
        description: "Explore the live interactive map of political violence in Bangladesh.",
        type: 'website',
    }
}

export default function FullScreenMapPage() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-900">
            <MapWrapper />
        </div>
    )
}
