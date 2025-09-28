import React from 'react';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { FilePlusIcon, MapPinIcon, CpuIcon, MessagesSquareIcon, ArrowRightIcon } from '../components/Icons.js';

const FeatureCard = ({ icon: Icon, title, description }) => (
    React.createElement(Card, { className: "hover:shadow-lg transition-shadow duration-300" },
        React.createElement(CardHeader, { className: "flex flex-row items-center space-x-4" },
            React.createElement('div', { className: "bg-primary/10 p-3 rounded-full" }, React.createElement(Icon, { className: "h-6 w-6 text-primary" })),
            React.createElement(CardTitle, null, title)
        ),
        React.createElement(CardContent, null,
            React.createElement('p', { className: "text-muted-foreground" }, description)
        )
    )
);

const HomePage = ({ navigate }) => {
  const features = [
    {
      icon: FilePlusIcon,
      title: 'Quick Issue Reporting',
      description: 'Easily submit new civic issues with detailed descriptions, categories, and images.'
    },
    {
      icon: MapPinIcon,
      title: 'Real-Time Tracking',
      description: 'Follow the status of your reports from submission to resolution with a clear timeline.'
    },
    {
      icon: CpuIcon,
      title: 'AI-Powered Estimates',
      description: 'Get an AI-generated Estimated Time to Resolution for your submitted issues.'
    },
    {
      icon: MessagesSquareIcon,
      title: 'Direct Communication',
      description: 'Admins can provide notes and updates directly on your reports for clear communication.'
    }
  ];

  return (
    React.createElement('div', { className: "w-full max-w-7xl mx-auto" },
      React.createElement('section', { className: "text-center py-20" },
        React.createElement('h1', { className: "text-5xl md:text-6xl font-extrabold tracking-tight text-primary" },
          "Report, Track, Resolve"
        ),
        React.createElement('p', { className: "mt-4 max-w-2xl mx-auto text-lg text-muted-foreground" },
          "CivicLens empowers you to be an active part of your community's improvement. Report issues, track their progress, and see real change happen."
        ),
        React.createElement('div', { className: "mt-8" },
          React.createElement(Button, { size: "lg", onClick: navigate },
            "Go to Dashboard",
            React.createElement(ArrowRightIcon, { className: "ml-2 h-5 w-5" })
          )
        )
      ),
      React.createElement('section', { className: "py-16" },
        React.createElement('div', { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8" },
            features.map(feature => (
                React.createElement(FeatureCard, { key: feature.title, icon: feature.icon, title: feature.title, description: feature.description })
            ))
        )
      )
    )
  );
};

export default HomePage;