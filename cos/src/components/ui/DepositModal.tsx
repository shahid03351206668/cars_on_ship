// components/DepositModal.tsx
import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe('pk_test_51SaZBpFlivs5TGAkrlAzDb2dFDfu1AB3CZpIKOoviB3y3Eyt5SlPQQFGKGZv6eEYu82rPmWEkAxvivUAdhrw5UFK00Fy2EmGSa')

interface DepositModalProps {
  onClose: () => void
  onSuccess?: () => void
}

function PaymentForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      // 1. Create Payment Intent on backend
      const res = await fetch('/api/method/cars_on_ship.stripe.create_payment_intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) * 100 }) // cents
      })

      const data = await res.json()
      if (!data.message.client_secret) throw new Error('Failed to create payment intent')

      // 2. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.message.client_secret,
        { payment_method: { card: elements.getElement(CardElement)! } }
      )

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        {loading ? 'Processing...' : `Pay $${amount || '0'}`}
      </button>
    </form>
  )
}

export default function DepositModal({ onClose, onSuccess }: DepositModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add Balance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  )
}