import { cn } from "@/shared/utils/cn"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
  platform?: 'twitter' | 'linkedin' | 'producthunt'
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

const PlatformIcon = ({ platform }: { platform?: 'twitter' | 'linkedin' | 'producthunt' }) => {
  if (!platform) return null;
  
  switch (platform) {
    case 'twitter':
      return (
        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'producthunt':
      return (
        <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 0 0 0-3.6zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.803a4.2 4.2 0 1 1 0 8.4z"/>
        </svg>
      );
    default:
      return null;
  }
};

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "group flex flex-col rounded-lg border border-neutral-700",
        "bg-gradient-to-b from-neutral-800/50 to-neutral-800/20",
        "p-4 text-start sm:p-6",
        "hover:from-neutral-800/70 hover:to-neutral-800/30",
        "hover:scale-105",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-all duration-300",
        "relative",
        className
      )}
    >
      {/* Magic UI Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-neutral-600">
            <AvatarImage src={author.avatar} alt={author.name} />
          </Avatar>
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold leading-none text-white">
                {author.name}
              </h3>
              <PlatformIcon platform={author.platform} />
            </div>
            <p className="text-sm text-gray-400">
              {author.handle}
            </p>
          </div>
        </div>
        <p className="sm:text-md text-sm text-gray-300 leading-relaxed">
          "{text}"
        </p>
      </div>
    </Card>
  )
}