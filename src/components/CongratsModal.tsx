'use client'

import { useState } from 'react'
import { X, Sparkles, Send, CheckCircle } from 'lucide-react'

interface CongratsModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  waitlistCount: number
}

export default function CongratsModal({ isOpen, onClose, email, waitlistCount }: CongratsModalProps) {
  const [featureRequest, setFeatureRequest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!featureRequest.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          featureRequest: featureRequest.trim() 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          onClose()
          setIsSubmitted(false)
          setFeatureRequest('')
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit feature request')
      }
    } catch (error) {
      console.error('Error submitting feature request:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
    setFeatureRequest('')
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm modal-backdrop"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full modal-content overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-lime-400/30 animate-pulse-slow">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Welcome to the waitlist!
            </h2>
            
            <p className="text-gray-400 text-sm">
              You're now #{waitlistCount.toLocaleString()} in line! 
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feature Request Section */}
              <div>
                <label htmlFor="featureRequest" className="block text-sm font-medium text-gray-300 mb-2">
                  What feature would you like this app to have?
                </label>
                <textarea
                  id="featureRequest"
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  placeholder="Tell us about a feature that would make this app amazing for you..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {featureRequest.length}/1000 characters
                  </span>
                  {featureRequest.trim().length > 0 && featureRequest.trim().length < 10 && (
                    <span className="text-xs text-red-400">
                      Minimum 10 characters
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-4 py-3 rounded-lg transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || featureRequest.trim().length < 10}
                  className="flex-1 bg-gradient-to-r from-lime-400 to-yellow-400 text-black font-semibold px-4 py-3 rounded-lg hover:scale-105 transform transition-all duration-200 shadow-lg shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Thank you for your feedback!
                </h3>
                <p className="text-gray-400 text-sm">
                  We'll consider your feature request for the upcoming release.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}