export default function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-space-purple/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-electric-cyan/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-electric-cyan rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="text-electric-cyan text-sm font-medium animate-pulse">
          Entering the Universe...
        </p>
      </div>
    </div>
  )
}
