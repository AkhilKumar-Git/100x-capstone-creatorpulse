import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid"
import {
    Clock,
    TrendingUp,
    Globe,
    Sparkles,
} from "lucide-react";

const creatorPulsseItems: BentoItem[] = [
    {
        title: "AI-Powered Content Generation",
        meta: "2x faster",
        description:
            "Generate engaging posts, threads, and captions in seconds with our advanced AI that understands your brand voice",
        icon: <Sparkles className="w-4 h-4 text-purple-500" />,
        status: "Popular",
        tags: ["AI", "Content", "Speed"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "Trend Intelligence",
        meta: "Real-time",
        description: "Stay ahead with trending topics and hashtags that are performing right now",
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        status: "Live",
        tags: ["Trends", "Analytics"],
    },
    {
        title: "Multi-Platform Publishing",
        meta: "8 platforms",
        description: "Create once, publish everywhere. Optimized content for Instagram, Twitter, LinkedIn, and more",
        icon: <Globe className="w-4 h-4 text-emerald-500" />,
        tags: ["Multi-platform", "Automation"],
        colSpan: 2,
    },
    {
        title: "Time-Saving Workflows",
        meta: "Save 2+ hours",
        description: "Automated scheduling, batch creation, and smart templates that streamline your content process",
        icon: <Clock className="w-4 h-4 text-orange-500" />,
        status: "Featured",
        tags: ["Productivity", "Automation"],
    },
];

function BentoGridDemo() {
    return (
        <div className="w-full py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Why Creators Choose CreatorPulsse
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Join thousands of creators who are already saving time and growing their audience with our AI-powered platform
                </p>
            </div>
            <BentoGrid items={creatorPulsseItems} />
        </div>
    );
}

export { BentoGridDemo }
