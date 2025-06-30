'use client'

import { useState, useEffect } from 'react'
import { Mail, Play, Plus, Minus, Calendar, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import CongratsModal from '@/components/CongratsModal'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface FAQItem {
  question: string
  answer: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [waitlistCount, setWaitlistCount] = useState(10247)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 188,
    hours: 9,
    minutes: 56,
    seconds: 46
  })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setSubmittedEmail(email)
        setWaitlistCount(prev => prev + 1)
        setEmail('')
        
        // Show modal after a brief delay
        setTimeout(() => {
          setIsSubmitted(false)
          setShowModal(true)
        }, 1500)
      }
    } catch (error) {
      console.error('Error submitting email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqItems: FAQItem[] = [
    {
      question: "What is Wait?",
      answer: "Wait is a powerful waitlist platform that helps you build anticipation and gather early supporters for your product launch. Create beautiful landing pages, manage signups, and engage your audience before you go live."
    },
    {
      question: "What's included in this template?",
      answer: "This template includes a complete waitlist landing page with email collection, countdown timer, social proof elements, FAQ section, and mobile-responsive design. It's built with Next.js, TypeScript, and Tailwind CSS for easy customization."
    },
    {
      question: "How do I customize this template?",
      answer: "You can easily customize colors, fonts, content, and layout by editing the Tailwind CSS classes and React components. The code is well-structured and commented for easy modification."
    },
    {
      question: "Is there support available?",
      answer: "Yes! This template comes with comprehensive documentation and community support. You can also reach out for help with customization and implementation."
    },
    {
      question: "How much will this cost?",
      answer: "The template is available for free with basic features. Premium features and advanced customization options are available with our paid plans starting at $29/month."
    }
  ]

  const avatars = [
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop",
    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop",
    "https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop",
    "https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop"
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 grid-pattern"></div>
      </div>


      <div className="relative z-10">
        {/* Header */}
        <header className="flex flex-col items-center pt-16 pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-lime-400 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-yellow-400/20 hover:scale-110 transform transition-all duration-300">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-400 rounded transform rotate-45"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-full px-4 py-2 hover:border-lime-400/50 transition-colors">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Available in Early 2025</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight">
            Get early access
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Be amongst the first to experience Wait and launch a viral waitlist. Sign up to be notified when we launch!
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all hover:border-gray-700"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isSubmitted}
              className="bg-gradient-to-r from-lime-400 to-yellow-400 text-black font-semibold px-8 py-4 rounded-lg hover:scale-105 transform transition-all duration-200 shadow-2xl shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Joining...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Welcome!
                </>
              ) : (
                'Join waitlist'
              )}
            </button>
          </form>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="flex -space-x-2">
              {avatars.map((avatar, index) => (
                <div key={index} className="relative">
                  <Image
                    src={avatar}
                    alt={`User ${index + 1}`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover hover:scale-110 transform transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              Join {waitlistCount.toLocaleString()}+ others on the waitlist
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="mb-12">
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-6">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 hover:border-lime-400/30 transition-colors">
                    <div className="text-2xl md:text-3xl font-bold text-white">{item.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Left until full release</span>
            </div>
          </div>

          {/* Main Visual Element */}
          <div className="relative mb-16">
            <div className="w-80 h-80 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-lime-400/10 to-yellow-400/10 rounded-full border border-lime-400/30"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-lime-400/5 to-yellow-400/5 rounded-full border border-lime-400/20"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full shadow-2xl shadow-lime-400/40 animate-bounce-slow glow-effect"></div>
            </div>
            
            <button className="flex items-center gap-2 mx-auto mt-8 text-gray-400 hover:text-white transition-colors group">
              <Play className="w-4 h-4 group-hover:scale-110 transform transition-transform" />
              <span className="text-sm">See how Wait works (3m)</span>
            </button>
          </div>
        </main>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Frequently asked questions</h2>
          <p className="text-gray-400 text-center mb-12">
            Everything you need to know about the Wait template. Find answers to the most common questions below.
          </p>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-medium text-white">{item.question}</span>
                  <div className="transform transition-transform duration-200">
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-lime-400" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="hover:text-gray-300 transition-colors cursor-pointer">Built using Next.js</span>
                <span className="hover:text-gray-300 transition-colors cursor-pointer">Get this template</span>
                <span className="hover:text-gray-300 transition-colors cursor-pointer">Become an affiliate</span>
              </div>
              <div className="text-sm text-gray-500">
                © 2025 Wait by <span className="text-white font-medium hover:text-lime-400 transition-colors cursor-pointer">CMD Supply ⚡</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Congratulations Modal */}
      <CongratsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        email={submittedEmail}
        waitlistCount={waitlistCount}
      />
    </div>
  )
}