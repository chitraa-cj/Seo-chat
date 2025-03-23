import type { Metadata } from "next"
import AuthForm from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Login - SEO Agent",
  description: "Login or sign up to access your SEO assistant",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center w-full px-4 py-12 sm:px-6 lg:flex-none lg:w-[55%] xl:w-1/2">
        <div className="w-full max-w-sm mx-auto lg:w-[450px]">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
              J
            </div>
            <h2 className="ml-3 text-2xl font-bold text-gray-900">SEO Agent</h2>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue with your SEO optimization journey
            </p>
          </div>

          <div className="mt-8">
            <AuthForm />
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden relative lg:block lg:w-[45%] xl:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-purple-800">
          <div className="absolute inset-0 bg-opacity-80 flex flex-col items-center justify-center text-white p-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">J</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-center">Optimize Your SEO Strategy</h3>
            <p className="text-lg text-center max-w-md">
              Get personalized recommendations, track your performance, and boost your search rankings with our
              AI-powered SEO assistant.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Keyword Analysis</h4>
                <p className="text-sm">Discover high-performing keywords for your content strategy</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Content Optimization</h4>
                <p className="text-sm">Get recommendations to improve your content's SEO score</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Performance Tracking</h4>
                <p className="text-sm">Monitor your website's search performance over time</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Competitor Analysis</h4>
                <p className="text-sm">See how your content stacks up against competitors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

