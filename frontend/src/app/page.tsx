import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { auth } from "~/server/auth";

export default async function HomePage() {

  const session = await auth();

  const user = session?.user;
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="text-xl font-bold text-white">Dukem Shorts</span>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-slate-700 text-slate-900 hover:bg-slate-800 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-6 border-purple-500/50 bg-purple-500/10 text-purple-300">
          AI-Powered Video Clipping
        </Badge>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Turn Long Podcasts into
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}Viral Shorts
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Automatically extract the best moments from your podcast videos and convert them into 
          vertical clips perfect for TikTok, Instagram Reels, and YouTube Shorts.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg hover:from-purple-700 hover:to-pink-700">
              Start Creating Free
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-slate-700 px-8 text-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Powerful AI Features
          </h2>
          <p className="text-lg text-slate-400">
            Everything you need to create professional short-form content
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle className="text-white">Smart Content Detection</CardTitle>
              <CardDescription className="text-slate-400">
                AI automatically identifies the best Q&A moments and stories from your podcast
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/10">
                <span className="text-2xl">📱</span>
              </div>
              <CardTitle className="text-white">Vertical Format</CardTitle>
              <CardDescription className="text-slate-400">
                Converts horizontal videos to 9:16 vertical format with smart face tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle className="text-white">Auto Subtitles</CardTitle>
              <CardDescription className="text-slate-400">
                Word-level transcription with beautifully styled subtitles burned into video
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <span className="text-2xl">🎬</span>
              </div>
              <CardTitle className="text-white">Active Speaker Detection</CardTitle>
              <CardDescription className="text-slate-400">
                Automatically focuses on whoever is speaking with smooth tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle className="text-white">GPU Accelerated</CardTitle>
              <CardDescription className="text-slate-400">
                Lightning-fast processing powered by Modal.com serverless infrastructure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <span className="text-2xl">🎨</span>
              </div>
              <CardTitle className="text-white">Custom Styling</CardTitle>
              <CardDescription className="text-slate-400">
                Professional subtitle styling with custom fonts and positioning
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="text-lg text-slate-400">
            From upload to viral-ready in minutes
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {[
            { step: "1", title: "Upload Your Video", description: "Upload your podcast video to our secure S3 storage" },
            { step: "2", title: "AI Processing", description: "Our AI transcribes, identifies key moments, and tracks speakers" },
            { step: "3", title: "Smart Cropping", description: "Video is converted to vertical format with face tracking" },
            { step: "4", title: "Download & Share", description: "Get your clips with subtitles, ready to post" }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                {item.step}
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-slate-800 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Go Viral?
            </h2>
            <p className="mb-8 text-lg text-slate-300">
              Start creating engaging short-form content from your podcasts today
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white px-8 text-lg text-purple-900 hover:bg-slate-100">
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2025 Dukem Shorts. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
