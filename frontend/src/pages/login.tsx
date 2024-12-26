import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setSuccess('Redirecting to: ' + data.message);

        // Redirect the user to the OAuth URL
        router.push(data.redirect);
    } catch (error) {
        console.log("in error client");
        setError(error+' An error occurred during login');
    }
  };

  return (
    <div id="root" className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Header */}
      <div id="header" className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Statusphere</h1>
        <p className="text-gray-600">Set your status on the Atmosphere.</p>
      </div>

      {/* Login Form */}
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="handle"
            placeholder="Enter your handle (e.g., alice.bsky.social)"
            value={handle}
            onChange={(e) => setHandle(e.target.value)} // Update handle state
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Log in
          </button>
        </form>

        {/* Error or Success Messages */}
        {error && (
          <p className="text-red-500 text-sm mt-4">
            Error: <i>{error}</i>
          </p>
        )}
        {success && (
          <p className="text-green-500 text-sm mt-4">
            {success}
          </p>
        )}

        {/* Signup CTA */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account on the Atmosphere?{' '}
          <a
            href="https://bsky.app"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign up for Bluesky
          </a>{' '}
          to create one now!
        </div>
      </div>
    </div>
  );
}