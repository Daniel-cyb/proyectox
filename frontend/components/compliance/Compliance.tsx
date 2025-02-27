import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, Zap, BarChart, Cog, Lock } from "lucide-react"
import React from "react"

export default function ComplianceLanding() {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="container mx-auto py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Automate Your ISO 27001:2022 Compliance</h1>
          <p className="text-xl mb-8">
            Implement and manage your Information Security Management System with ease
          </p>
          <Button size="lg" className="bg-green-500 hover:bg-green-600">
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-400" />}
            title="AI-Powered Implementation"
            description="Our AI algorithms guide you through the ISO 27001:2022 implementation process, customizing steps based on your organization's needs."
          />
          <FeatureCard
            icon={<BarChart className="w-12 h-12 text-blue-400" />}
            title="Real-time Compliance Monitoring"
            description="Continuously track your compliance status with real-time dashboards and alerts, ensuring you're always audit-ready."
          />
          <FeatureCard
            icon={<Lock className="w-12 h-12 text-red-400" />}
            title="Automated Risk Management"
            description="Identify, assess, and mitigate risks automatically with our advanced AI risk management module."
          />
          <FeatureCard
            icon={<Cog className="w-12 h-12 text-purple-400" />}
            title="Integration with Existing Tools"
            description="Seamlessly integrate with your current cybersecurity stack, including SIEM, vulnerability scanners, and asset management tools."
          />
          <FeatureCard
            icon={<CheckCircle className="w-12 h-12 text-green-400" />}
            title="Compliance Documentation"
            description="Automatically generate and update all required ISO 27001:2022 documentation, saving you time and ensuring accuracy."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-orange-400" />}
            title="Continuous Improvement"
            description="Our AI continuously learns from your data, providing insights and recommendations for improving your security posture."
          />
        </div>
      </main>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-gray-200 border-none">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white-700">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
