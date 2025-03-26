
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Server, Shield, Users, Clock, Zap, MessageCircle, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionWrapper from '@/components/TransitionWrapper';

const PlanFeature: React.FC<{ name: string; included: boolean }> = ({ name, included }) => (
  <div className="flex items-center mb-3">
    {included ? (
      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
    )}
    <span className={included ? '' : 'text-muted-foreground'}>{name}</span>
  </div>
);

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For personal projects and small teams',
      features: [
        { name: 'Up to 2 agents', included: true },
        { name: 'Core API access', included: true },
        { name: 'Basic monitoring', included: true },
        { name: 'Community support', included: true },
        { name: '50 API calls / day', included: true },
        { name: 'Data retention: 7 days', included: true },
        { name: 'Advanced security features', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom agents', included: false },
      ],
      icon: Server,
      cta: 'Start for Free',
      popular: false,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      description: 'For growing businesses and teams',
      features: [
        { name: 'Up to 10 agents', included: true },
        { name: 'Full API access', included: true },
        { name: 'Advanced monitoring', included: true },
        { name: 'Email support', included: true },
        { name: '500 API calls / day', included: true },
        { name: 'Data retention: 30 days', included: true },
        { name: 'Basic security features', included: true },
        { name: 'Priority support', included: false },
        { name: 'Custom agents', included: false },
      ],
      icon: Shield,
      cta: 'Start 14-Day Trial',
      popular: true,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For enterprises and large teams',
      features: [
        { name: 'Unlimited agents', included: true },
        { name: 'Full API access', included: true },
        { name: 'Enterprise monitoring', included: true },
        { name: 'Priority support', included: true },
        { name: 'Unlimited API calls', included: true },
        { name: 'Data retention: 1 year', included: true },
        { name: 'Advanced security features', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom agents', included: true },
      ],
      icon: Users,
      cta: 'Contact Sales',
      popular: false,
      color: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Quick Setup',
      description: 'Get started in minutes with our simple onboarding process'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Fast response times with global distribution'
    },
    {
      icon: MessageCircle,
      title: 'Expert Support',
      description: 'Get help when you need it from our support team'
    },
    {
      icon: Database,
      title: 'Reliable Infrastructure',
      description: '99.9% uptime guarantee across all our services'
    }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto">
          <div className="container py-8 px-4">
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <motion.h1 
                className="text-4xl font-bold tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Simple, Transparent Pricing
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mt-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Choose the plan that best fits your needs. All plans include access to our API.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex flex-col"
                >
                  <Card className={`h-full flex flex-col ${plan.popular ? 'border-2 border-primary shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1 rounded-t-md">
                        MOST POPULAR
                      </div>
                    )}
                    <CardHeader className={`${plan.color} rounded-t-lg`}>
                      <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                        <plan.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="pt-4">
                        {plan.features.map((feature, index) => (
                          <PlanFeature 
                            key={index} 
                            name={feature.name} 
                            included={feature.included} 
                          />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <button 
                        className={`w-full py-2 px-4 rounded-md text-center ${
                          plan.popular 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        } font-medium transition-colors`}
                      >
                        {plan.cta}
                      </button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our API Platform?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, i) => (
                  <Card key={i} className="border border-border/50">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="max-w-3xl mx-auto text-center bg-muted/30 p-8 rounded-lg border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
              <p className="text-muted-foreground mb-6">
                Contact our sales team for custom pricing and enterprise features.
                We offer tailored solutions for large-scale deployments.
              </p>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-6 rounded-md transition-colors">
                Contact Sales
              </button>
            </motion.div>
          </div>
          <Footer />
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Pricing;
