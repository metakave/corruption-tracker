import MapWrapper from '@/components/MapWrapper'

export default function FullScreenMapPage() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-900">
            <MapWrapper />
        </div>
    )
}
