
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Terminal, Eye, GitFork, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: <Terminal className="h-6 w-6" />,
    title: "Intelligent Agent Diagnostics",
    description: "Agents collect system data and automatically diagnose complex issues across your Linux infrastructure."
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "Centralized API Control",
    description: "Control and monitor all your Linux agents from a single API, making management simple and efficient."
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Real-time Monitoring",
    description: "Get instant insights into system performance, errors, and potential issues before they cause downtime."
  },
  {
    icon: <GitFork className="h-6 w-6" />,
    title: "Distributed Systems Support",
    description: "Diagnose issues across multiple connected systems to identify cross-system dependencies and failures."
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Complete Interaction History",
    description: "Access comprehensive logs of all agent interactions and diagnostic steps for audit and review."
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Advanced Visualization",
    description: "View complex diagnostic data in an intuitive interface designed for both operators and managers."
  }
];

const Features = () => {
  return (
    <div className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Diagnostics for Complex Systems</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            NannyAI combines intelligent agents with powerful APIs to provide seamless Linux diagnostics across your entire infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
