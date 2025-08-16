import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Users, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Photo Generation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Create <span className="gradient-text">Stunning AI Photos</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Train custom AI models with your photos and generate unlimited professional-quality images. 
            Perfect for social media, business, and creative projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gallery">View Examples</Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Custom Models</CardTitle>
                <CardDescription>
                  Train AI models with your own photos for personalized results
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <Zap className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Generate high-quality photos in seconds with our optimized infrastructure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your photos and models are private and secure with enterprise-grade protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-12">Choose the plan that fits your needs</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>✓ 1 AI model</div>
                <div>✓ 10 generations/month</div>
                <div>✓ 512x512 resolution</div>
                <div>✓ Community support</div>
                <Button className="w-full mt-6" variant="outline">Get Started</Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-purple-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-3xl font-bold">$19<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>✓ 3 AI models</div>
                <div>✓ 100 generations/month</div>
                <div>✓ Up to 1024x1024 resolution</div>
                <div>✓ No watermarks</div>
                <div>✓ Premium packages</div>
                <Button className="w-full mt-6">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Gold Plan */}
            <Card className="border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-2xl">Gold</CardTitle>
                <div className="text-3xl font-bold">$49<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>✓ Unlimited models</div>
                <div>✓ 500 generations/month</div>
                <div>✓ Up to 2048x2048 resolution</div>
                <div>✓ API access</div>
                <div>✓ Priority support</div>
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}