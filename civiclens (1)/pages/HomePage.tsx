import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FilePlusIcon, MapPinIcon, CpuIcon, MessagesSquareIcon, ArrowRightIcon } from '../components/Icons';

type FeatureCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
    return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full"><Icon className="h-6 w-6 text-primary" /></div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
    );
}

const HomePage = ({ navigate }: { navigate: () => void }) => {
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
    <div className="w-full max-w-7xl mx-auto">
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
          Report, Track, Resolve
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          CivicLens empowers you to be an active part of your community's improvement. Report issues, track their progress, and see real change happen.
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={navigate}>
            Go to Dashboard
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(feature => (
                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;