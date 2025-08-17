# 🚀 CreatorPulse

**AI-Powered Content Creation Platform for Modern Creators**

CreatorPulse is a comprehensive content creation and management platform that helps creators build, schedule, and optimize their content across multiple social media platforms using AI-powered assistance.

![CreatorPulse](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Content Generation** - Generate platform-specific content with customizable tones
- **Multi-Platform Support** - X (Twitter), LinkedIn, and Instagram optimized content
- **Content Scheduling** - Advanced calendar-based scheduling with timezone support
- **Style Profile Learning** - AI learns your unique writing style from uploaded content
- **Real-time Analytics** - Track performance across all platforms

### 🎨 **User Experience**
- **Beautiful Dark Mode Interface** - Modern, professional design with smooth animations
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Intuitive Navigation** - Smart routing with context-aware workflows
- **Real-time Previews** - See exactly how your content will look on each platform

### 📊 **Dashboard & Analytics**
- **Overview Dashboard** - Key metrics, trending topics, and recent drafts
- **Performance Analytics** - Detailed insights with interactive charts
- **Source Management** - Connect and manage content inspiration sources
- **Delivery Scheduling** - Visual calendar with drag-and-drop planning

### 📝 **Content Creation**
- **AI Co-Pilot** - Smart content suggestions with tone customization
- **Multi-Platform Editor** - Specialized editors for each platform
- **Thread Builder** - Create engaging Twitter threads with character counting
- **Media Upload** - Support for images and videos across platforms
- **Live Previews** - Pixel-perfect platform previews

### 🎭 **Style Board**
- **Content Analysis** - Upload your best content for AI style learning
- **Vocabulary Mapping** - Visual representation of your signature words
- **Tone Analysis** - Understand your unique voice patterns
- **Profile Management** - Update and refine your AI writing assistant

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Shadcn/UI** - High-quality component library

### **UI Components**
- **Lucide React** - Beautiful icon library
- **Recharts** - Interactive data visualization
- **Date-fns** - Date manipulation utilities
- **Zustand** - Lightweight state management
- **CMDK** - Command palette interface

### **Styling & Design**
- **Custom Fonts** - Google Fonts integration ("Nothing You Could Do", "Bitcount Prop Single")
- **Dark Mode** - Class-based dark mode with system preferences
- **Responsive Design** - Mobile-first approach with Tailwind breakpoints
- **Animation System** - Framer Motion for micro-interactions

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm, yarn, or pnpm

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creator-pulse.git
   cd creator-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
creator-pulse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Authentication pages
│   │   ├── post-editor/        # Content creation page
│   │   ├── settings/           # Settings page
│   │   └── style-board/        # Style learning page
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── landing/            # Landing page components
│   │   ├── layout/             # Layout components
│   │   ├── post-editor/        # Editor components
│   │   ├── settings/           # Settings components
│   │   ├── style-board/        # Style board components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utility functions
│   └── styles/                 # Global styles
├── public/                     # Static assets
└── ...config files
```

## 🎨 Key Components

### **Layout System**
- `NewAppLayout` - Main application layout with sidebar
- `Sidebar` - Collapsible navigation with user menu
- `ClientSideWrapper` - Hydration-safe component wrapper

### **Dashboard**
- `DashboardOverview` - Main dashboard with metrics and trending topics
- `AnalyticsTab` - Performance analytics with charts
- `DeliveryTab` - Content scheduling with calendar
- `EnhancedSourcesTab` - Content source management

### **Content Creation**
- `PostEditor` - Multi-platform content editor
- `AICoPilot` - AI-powered content assistance
- `TwitterPreview/LinkedInPreview/InstagramPreview` - Platform-specific previews

### **Style Learning**
- `StyleBoard` - Main style analysis interface
- `ContentUploader` - File upload and text input
- `WordCloud` - Vocabulary visualization
- `ToneAnalysis` - Writing style analysis

## 🔄 Navigation Flows

### **1. Trending Topic → Post Editor**
Click any trending topic to instantly start creating content about that topic.

### **2. New Draft → Post Editor**
Use the "+ New Draft" button for clean slate content creation.

### **3. Calendar → Post Editor**
Schedule content directly from the calendar with pre-set dates and platforms.

### **4. User Avatar → Settings**
Access settings and logout through the user avatar dropdown menu.

## 🎯 Features in Detail

### **AI Content Generation**
- Multiple tone options (Casual, Professional, Witty, Inspirational, Technical)
- Platform-specific content optimization
- Learning from user's writing style
- Regeneration and refinement options

### **Multi-Platform Support**
- **X (Twitter)**: Single posts, threads, character counting
- **LinkedIn**: Professional posts, articles, carousels
- **Instagram**: Captions, stories, first comments

### **Scheduling System**
- Visual calendar interface
- Multiple recurrence options (Daily, Weekly, Custom)
- Timezone support
- Bulk scheduling capabilities

### **Analytics Dashboard**
- Platform performance comparison
- Engagement metrics tracking
- Content performance insights
- ROI calculations

## 🎨 Design System

### **Color Palette**
- Primary Background: `#121212`
- Secondary Background: `#1E1E1E`
- Text Primary: `#F5F5F5`
- Text Secondary: `#A0A0A0`
- Accent: `#BEF264` (Lime Green)
- Muted: `#64748B` (Slate)
- Gradients: Purple/Pink combinations

### **Typography**
- Primary: Geist Sans
- Accent: "Nothing You Could Do" (Google Font)
- Display: "Bitcount Prop Single" (Google Font)

### **Components**
- Consistent border radius: `rounded-lg`, `rounded-xl`
- Hover states with smooth transitions
- Focus states for accessibility
- Loading states and skeletons

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker**
```bash
# Build Docker image
docker build -t creator-pulse .

# Run container
docker run -p 3000:3000 creator-pulse
```

### **Static Export**
```bash
# Build static export
npm run build
npm run export
```

## 📦 Scripts

```json
{
  "dev": "next dev",           // Development server
  "build": "next build",       // Production build
  "start": "next start",       // Production server
  "lint": "next lint",         // ESLint check
  "type-check": "tsc --noEmit" // TypeScript check
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI** for the excellent component library
- **Vercel** for Next.js and deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons

## 📞 Support

For support, email support@creatorpulse.com or join our Discord community.

---

**Made with ❤️ for content creators worldwide**

*CreatorPulse - Where AI meets creativity*