'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
})

export default function MapWrapper() {
    return <Map />
}
