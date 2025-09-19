# 🏌️‍♀️Minigolf Mania

A 3D web-based minigolf game built with Three.js, featuring comprehensive accessibility support, cloud save functionality, and modern UI enhancements.

## 🎮Features

### ⛳Core Gameplay
- **3D Physics-Based Golf**: Realistic ball physics with friction, collision detection, and momentum
- **Multiple Levels**: Progressively challenging courses with different obstacles and layouts
- **Precision Aiming**: Mouse/touch controls with power adjustment and trajectory preview
- **Scoring System**: Par-based scoring with stroke counting and personal best tracking

### 🖥️Enhanced UI Systems
- **Interactive Tutorial**: Step-by-step guided tutorial for new players with contextual hints
- **Enhanced HUD**: Real-time game statistics, session tracking, and achievement system
- **Level Selection**: Visual course previews with difficulty indicators and progress tracking
- **Global Leaderboards**: Compare scores with other players worldwide
- **Settings Panel**: Comprehensive graphics, audio, and accessibility options

### ♿Accessibility Features
- **Screen Reader Support**: Full ARIA labeling and live region announcements
- **Keyboard Navigation**: Complete keyboard controls with customizable shortcuts
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Colorblind Support**: Alternative color schemes and pattern-based indicators
- **Text Scaling**: Adjustable font sizes from small to extra-large
- **Reduced Motion**: Respect for users' motion preferences
- **Focus Management**: Proper tab order and focus indicators

### ☁️Cloud Integration
- **User Authentication**: OAuth login via Google and GitHub
- **Cloud Save**: Automatic score syncing across devices

### 📱Mobile Optimization
- **Responsive Design**: Adaptive layouts for all screen sizes
- **Touch Controls**: Optimized touch input with gesture support
- **Mobile UI**: Touch-friendly control panels and navigation
- **Performance Scaling**: Automatic quality adjustment for mobile devices

## 🛠️Technology Stack

- **Frontend**: Vanilla JavaScript ES6+
- **3D Engine**: Three.js with WebGL rendering
- **Physics**: Custom physics engine with collision detection
- **Authentication**: Supabase OAuth integration
- **Database**: Supabase PostgreSQL for score storage
- **Styling**: CSS3 with modern features and animations

## 📂File Structure

```
src/
├── main.js                     # Main game logic and initialization
├── physics.js                  # Ball physics and collision system
├── wireAim.js                  # Aiming controls and input handling
├── ui.js                       # Basic UI update functions
├── levels.js                   # Level definitions and configurations
├── auth.js                     # Authentication UI and handlers
├── supabase.js                 # Database integration and API calls
├── enhancedScoring.js          # Advanced scoring and statistics
├── tutorial.js                 # Interactive tutorial system
├── settings.js                 # Settings panel and preferences
├── leaderboard.js              # Global leaderboards and rankings
├── levelSelector.js            # Level selection interface
├── mobileUI.js                 # Mobile-specific enhancements
├── accessibilityFeatures.js   # Comprehensive accessibility support
├── trajectoryVisualizer.js     # Shot trajectory preview system
├── uiIntegration.js           # UI system integration manager
└── style.css                  # Global styles and themes
```

## 🚀Getting Started

### Prerequisites
- Node.js 16+ (for development server)
- Modern web browser with WebGL support
- Supabase account (for cloud features)

### Environment Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Vidisha231106/CloneFest-minigolf-phy.git
cd CloneFest-minigolf-phy
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file with your Supabase credentials:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server:**
```bash
npm run dev
```

### Database Setup

Create the following tables in your Supabase database:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User scores table
CREATE TABLE user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  best_score INTEGER NOT NULL,
  total_attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);
```

## 🎮Controls

### Desktop Controls
- **Mouse**: Click and drag to aim shots
- **Shift + Mouse**: Enhanced aiming mode
- **Scroll Wheel**: Zoom camera in/out
- **Right Click + Drag**: Pan camera
- **Left Click + Drag**: Orbit camera

### Keyboard Shortcuts
- **R**: Reset ball position
- **N**: Next hole
- **F**: Toggle camera following
- **H or F1**: Open tutorial
- **S**: Open settings
- **L**: Open level selector
- **B**: Open leaderboards
- **A**: Open accessibility panel
- **G**: Announce game state (accessibility)
- **Escape**: Close open panels

### Touch Controls (Mobile)
- **Touch + Drag**: Aim and shoot
- **Pinch**: Zoom camera
- **Two-finger drag**: Pan camera
- **Double tap**: Reset camera position

## 👥 Contributors

ImageGallery was developed as a team effort by the following contributors:
| Name | GitHub |
|------|-------------------|
| Prapti Belekeri | [praptibelekeri](https://github.com/praptibelekeri) |
| Samanvitha L | [Samanvitha97](https://github.com/Samanvitha97) |
| Tanisha R | [Tanisha-27-12](https://github.com/Tanisha-27-12)|
| Vidisha Dewan | [Vidisha231106](https://github.com/Vidisha231106) |

---

