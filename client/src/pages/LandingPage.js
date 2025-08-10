import React from 'react';

const LandingPage = () => {
  return (
    <div className="landing-page bg-gray-900 text-white min-h-screen font-sans">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 bg-gray-900 bg-opacity-90 backdrop-blur-md z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-neon-green cursor-pointer">
            Trading Journal
          </div>
          <div className="space-x-6 hidden md:flex">
            <a href="#features" className="hover:text-neon-green transition">Features</a>
            <a href="#testimonials" className="hover:text-neon-green transition">Testimonials</a>
            <a href="#start" className="hover:text-neon-green transition">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="hero relative flex items-center justify-center text-center px-6 py-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
        }}
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 neon-text">
            Unlock Financial Freedom in Just 30 Minutes a Day
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300">
            Master trading with our comprehensive journal and interactive learning platform.
          </p>
          <div className="space-x-4">
            <a
              href="#start"
              className="inline-block bg-neon-green text-gray-900 font-semibold px-8 py-3 rounded shadow-lg hover:bg-green-600 transition"
            >
              Start Your Trading Journey
            </a>
            <a
              href="#features"
              className="inline-block border border-neon-green text-neon-green font-semibold px-8 py-3 rounded hover:bg-neon-green hover:text-gray-900 transition"
            >
              Learn Basics
            </a>
          </div>
        </div>
      </section>

      {/* Visual Blocks */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="feature-block p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-neon-green transition">
          <div className="mb-4">
            <svg className="mx-auto w-12 h-12 text-neon-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 00-7 7v3a7 7 0 0014 0v-3a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Live Interactive Sessions</h3>
          <p className="text-gray-400">Engage with experts in real-time to sharpen your skills.</p>
        </div>
        <div className="feature-block p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-neon-green transition">
          <div className="mb-4">
            <svg className="mx-auto w-12 h-12 text-neon-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a3 3 0 016 0v6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Comprehensive Course Material</h3>
          <p className="text-gray-400">Access detailed guides, videos, and resources anytime.</p>
        </div>
        <div className="feature-block p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-neon-green transition">
          <div className="mb-4">
            <svg className="mx-auto w-12 h-12 text-neon-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 14h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Flexible Learning</h3>
          <p className="text-gray-400">Learn at your own pace with our modular and easy-to-follow lessons.</p>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text">Trusted by students worldwide</h2>
        <div className="carousel space-y-8">
          <blockquote className="bg-gray-800 p-6 rounded-lg shadow-lg neon-border">
            <p className="text-gray-300 italic">"This platform transformed my trading skills and confidence!"</p>
            <footer className="mt-4 text-neon-green font-semibold">- Alex P.</footer>
          </blockquote>
          <blockquote className="bg-gray-800 p-6 rounded-lg shadow-lg neon-border">
            <p className="text-gray-300 italic">"The live sessions and materials are top-notch."</p>
            <footer className="mt-4 text-neon-green font-semibold">- Maria S.</footer>
          </blockquote>
          <blockquote className="bg-gray-800 p-6 rounded-lg shadow-lg neon-border">
            <p className="text-gray-300 italic">"Flexible learning that fits my busy schedule."</p>
            <footer className="mt-4 text-neon-green font-semibold">- John D.</footer>
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section id="start" className="text-center py-20 bg-gray-800">
        <h2 className="text-3xl font-bold mb-6 neon-text">Ready to start your trading journey?</h2>
        <a
          href="#"
          className="inline-block bg-neon-green text-gray-900 font-semibold px-10 py-4 rounded shadow-lg hover:bg-green-600 transition"
        >
          Get Started Now
        </a>
      </section>

      {/* Styles */}
      <style jsx>{`
        .neon-text {
          color: #00ff99;
          text-shadow:
            0 0 5px #00ff99,
            0 0 10px #00ff99,
            0 0 20px #00ff99,
            0 0 40px #00ff99;
        }
        .neon-green {
          color: #00ff99;
        }
        .hover\\:shadow-neon-green:hover {
          box-shadow: 0 0 10px #00ff99;
        }
        .neon-border {
          border: 2px solid #00ff99;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
