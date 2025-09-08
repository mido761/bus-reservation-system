import React from "react"

export default function SeatLegend() {
  const legends = [
    { color: "bg-red-500", label: "Booked" },
    { color: "bg-gray-200", label: "Available" },
    { color: "bg-green-500", label: "Selected" }, 
  ]

  return (
    <div className="flex space-x-6">
      {legends.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <span className={`w-6 h-6 rounded-md shadow ${item.color}`}></span>
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
