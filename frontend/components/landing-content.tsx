"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const testimonials = [
  {
    name: "Jhon",
    avatar: "J",
    title: "Security Expert",
    description: "This application is essential for quick threat detection and response.",
  },
  {
    name: "Peter",
    avatar: "P",
    title: "CISO",
    description: "This tool has significantly improved the security of our infrastructure. It is indispensable for our team.",
  },
  {
    name: "Mary",
    avatar: "M",
    title: "CFO",
    description: "The best cybersecurity solution we have implemented. Worth every penny of the premium subscription.",
  },
  {
    name: "Tom",
    avatar: "M",
    title: "CTO",
    description: "The best cybersecurity tool.",
  }
];

export const LandingContent = () => {
  return (
    <div className="px-10 pb-20">
      <h2 className="text-center text-4xl text-white font-extrabold mb-10">Testimonials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testimonials.map((item) => (
          <Card key={item.description} className="bg-[#192339] border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div>
                  <p className="text-lg">{item.name}</p>
                  <p className="text-zinc-400 text-sm">{item.title}</p>
                </div>
              </CardTitle>
              <CardContent className="pt-4 px-0">
                {item.description}
              </CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}