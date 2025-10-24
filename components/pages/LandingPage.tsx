
import React from 'react';
import FFButton from '../education/shared/FFButton';
import FFCard from '../education/shared/FFCard';

interface LandingPageProps {
  onLogin: () => void;
  onStartDemo: () => void;
}

const FeatureIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <div className="bg-ff-surface p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4 border border-slate-700">
        {icon}
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onStartDemo }) => {
  return (
    <div className="ff-fade-in-up">
      {/* Hero Section */}
      <section className="text-center py-20 px-4" style={{ background: 'radial-gradient(circle, var(--ff-surface) 0%, var(--ff-bg-dark) 70%)' }}>
        <h1 
            style={{ fontFamily: 'var(--ff-font-primary)', fontSize: '2.5rem', fontWeight: 'var(--ff-weight-bold)' }}
            className="text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight"
        >
          Revolutionize Your Classroom with <span className="text-ff-primary">AI-Powered Content</span>
        </h1>
        <p 
            style={{ fontFamily: 'var(--ff-font-secondary)', color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)' }}
            className="mt-6 max-w-2xl mx-auto text-lg"
        >
          FlashFusion AI helps educators, content creators, and students generate high-quality lesson plans, assessments, and study aids in minutes, not hours.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <FFButton onClick={onStartDemo} variant="secondary" className="ff-pulse-glow" style={{padding: '1rem 2rem', fontSize: 'var(--ff-text-base)'}}>Start a Free Demo</FFButton>
          <FFButton onClick={onLogin} style={{backgroundColor: 'var(--ff-surface)', padding: '1rem 2rem', fontSize: 'var(--ff-text-base)'}}>Sign In</FFButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-ff-bg-dark">
        <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-3xl md:text-4xl font-bold">The Ultimate Toolkit for Modern Education</h2>
            <p style={{color: 'var(--ff-text-secondary)'}} className="mt-4 text-lg max-w-3xl mx-auto">
                Everything you need to create engaging, standards-aligned content that inspires.
            </p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 ff-stagger-fade">
            <FFCard style={{'--stagger-index': 1} as React.CSSProperties}>
                <FeatureIcon icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ff-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v.214A2.25 2.25 0 0117.25 17h-10.5a2.25 2.25 0 01-2.25-2.25v-.214M19 14.5l-4-4m0 0l-4-4m4 4l-4 4m4-4l4 4" /></svg>} />
                <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-xl font-bold mb-2">Effortless Content Creation</h3>
                <p style={{color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}}>Our Content Studio crafts everything from detailed lesson plans to complex assessments, aligned to your specific curriculum standards.</p>
            </FFCard>
             <FFCard style={{'--stagger-index': 2} as React.CSSProperties}>
                <FeatureIcon icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ff-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>} />
                <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-xl font-bold mb-2">A Universe of Teaching Tools</h3>
                <p style={{color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}}>Access a vast library of specialized AI tools for creating games, printables, study aids, parent communications, and more.</p>
            </FFCard>
             <FFCard style={{'--stagger-index': 3} as React.CSSProperties}>
                <FeatureIcon icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ff-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>} />
                <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-xl font-bold mb-2">Data-Driven Insights</h3>
                <p style={{color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)'}}>Understand content trends with our analytics dashboard. See which subjects, grades, and tools are most popular to inform your strategy.</p>
            </FFCard>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 md:px-8 bg-ff-surface">
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-3xl md:text-4xl font-bold">Trusted by Innovative Educators</h2>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-8">
                <FFCard>
                    <p style={{color: 'var(--ff-text-primary)', lineHeight: 'var(--ff-leading-relaxed)'}} className="mb-4 text-lg">"FlashFusion AI has cut my lesson prep time in half. I can create differentiated materials for my students in minutes. It's an absolute game-changer."</p>
                    <p style={{color: 'var(--ff-text-muted)'}} className="font-semibold">— Sarah J., 5th Grade Teacher</p>
                </FFCard>
                <FFCard>
                    <p style={{color: 'var(--ff-text-primary)', lineHeight: 'var(--ff-leading-relaxed)'}} className="mb-4 text-lg">"As a TPT seller, generating fresh ideas for printables and activity packs is crucial. This tool is my new secret weapon for brainstorming and creating high-quality content."</p>
                    <p style={{color: 'var(--ff-text-muted)'}} className="font-semibold">— Mike R., Digital Product Creator</p>
                </FFCard>
            </div>
        </div>
      </section>

      {/* Final CTA */}
       <section className="py-24 px-4 text-center bg-ff-bg-dark">
         <div className="max-w-3xl mx-auto">
            <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-3xl md:text-4xl font-bold">Ready to Transform Your Workflow?</h2>
            <p style={{color: 'var(--ff-text-secondary)'}} className="mt-4 text-lg">
                Stop spending countless hours on content creation. Start building amazing learning experiences today. No credit card required for demo.
            </p>
            <div className="mt-8">
                 <FFButton onClick={onStartDemo} variant="primary" style={{padding: '1rem 2.5rem', fontSize: 'var(--ff-text-lg)'}}>Get Started Now</FFButton>
            </div>
         </div>
       </section>
    </div>
  );
};

export default LandingPage;
