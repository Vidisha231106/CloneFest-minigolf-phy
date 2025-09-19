// src/levels.js
export const levels = [
  {
    id: 1,
    name: "Warm Up",
    description: "A straight shot to get you started",
    par: 2,
    difficulty: "Easy",
    start: [0, 0.12, 0],
    hole: { pos: [6, 0, 0], radius: 0.25 },
    walls: [
      { x: 0, z: -2.5, w: 12, d: 0.4, h: 0.5 }, // bottom
      { x: 0, z:  2.5, w: 12, d: 0.4, h: 0.5 }, // top
    ], // straight corridor, easy warmup
    tips: "Aim straight ahead with medium power for an easy par.",
    unlockRequirement: null, // always unlocked
  },
  {
    id: 2,
    name: "Corner Shot",
    description: "Navigate the diagonal to reach the opposite corner",
    par: 3,
    difficulty: "Easy",
    start: [-5, 0.12, -3],
    hole: { pos: [5, 0, 3], radius: 0.25 },
    walls: [
      { x: 0,  z: -4.5, w: 12, d: 0.4, h: 0.5 }, // bottom
      { x: 0,  z:  4.5, w: 12, d: 0.4, h: 0.5 }, // top
      { x: -6, z: 0,    w: 0.4, d: 10, h: 0.5 }, // left
      { x:  6, z: 0,    w: 0.4, d: 10, h: 0.5 }, // right
    ], // diagonal shot inside a box
    tips: "Try a direct diagonal shot, or bank off the walls for better angle control.",
    unlockRequirement: { levelId: 1, maxStrokes: 4 },
  },
  {
    id: 3,
    name: "The Alley",
    description: "Straight down the narrow lane like bowling",
    par: 3,
    difficulty: "Medium",
    start: [0, 0.12, -5],
    hole: { pos: [0, 0, 5], radius: 0.25 },
    walls: [
      { x: -3.5, z: 0, w: 0.4, d: 12, h: 0.5 }, // left wall
      { x:  3.5, z: 0, w: 0.4, d: 12, h: 0.5 }, // right wall
      { x: 0,    z: -6, w: 8,  d: 0.4, h: 0.5 }, // bottom cap
      { x: 0,    z:  6, w: 8,  d: 0.4, h: 0.5 }, // top cap
    ], // vertical lane, like bowling alley
    tips: "Keep it straight! Too much power and you'll bounce off the end wall.",
    unlockRequirement: { levelId: 2, maxStrokes: 5 },
  },
  {
    id: 4,
    name: "The Arena",
    description: "Wide open space with the hole across the field",
    par: 4,
    difficulty: "Medium",
    start: [-6, 0.12, 0],
    hole: { pos: [6, 0, 0], radius: 0.25 },
    walls: [
      { x: 0,  z: -3.5, w: 14, d: 0.4, h: 0.5 },
      { x: 0,  z:  3.5, w: 14, d: 0.4, h: 0.5 },
      { x: -7, z: 0,    w: 0.4, d: 7,  h: 0.5 },
      { x:  7, z: 0,    w: 0.4, d: 7,  h: 0.5 },
      // little gap in the middle makes it feel open
    ], // wide arena with hole opposite start
    tips: "Plenty of room to maneuver. Go for power or play it safe with positioning shots.",
    unlockRequirement: { levelId: 3, maxStrokes: 6 },
  },
  {
    id: 5,
    name: "Long Diagonal",
    description: "The longest shot yet - corner to corner precision",
    par: 5,
    difficulty: "Hard",
    start: [-5, 0.12, -5],
    hole: { pos: [5, 0, 5], radius: 0.25 },
    walls: [
      { x: 0,  z: -6, w: 14, d: 0.4, h: 0.5 }, // bottom
      { x: 0,  z:  6, w: 14, d: 0.4, h: 0.5 }, // top
      { x: -6, z: 0,  w: 0.4, d: 12, h: 0.5 }, // left
      { x:  6, z: 0,  w: 0.4, d: 12, h: 0.5 }, // right
      // square box, diagonal long shot
    ],
    tips: "Maximum distance shot. Use wall bounces strategically to set up the perfect approach.",
    unlockRequirement: { levelId: 4, maxStrokes: 7 },
  },
  {
    id: 6,
    name: "The Maze Entry",
    description: "Navigate through the narrow entrance",
    par: 4,
    difficulty: "Medium",
    start: [-6, 0.12, 0],
    hole: { pos: [6, 0, -3], radius: 0.25 },
    walls: [
      { x: 0,  z: -4, w: 14, d: 0.4, h: 0.5 }, // bottom
      { x: 0,  z:  4, w: 14, d: 0.4, h: 0.5 }, // top
      { x: -7, z: 0,  w: 0.4, d: 8,  h: 0.5 }, // left
      { x:  7, z: 0,  w: 0.4, d: 8,  h: 0.5 }, // right
      { x: 2,  z: 1,  w: 0.4, d: 4,  h: 0.5 }, // obstacle 1
      { x: -2, z: -1, w: 0.4, d: 4,  h: 0.5 }, // obstacle 2
    ],
    tips: "Thread the needle between obstacles. Angles are your friend here.",
    unlockRequirement: { levelId: 5, maxStrokes: 8 },
  },
  {
    id: 7,
    name: "S-Curve",
    description: "Follow the winding path to victory",
    par: 5,
    difficulty: "Hard",
    start: [-7, 0.12, -2],
    hole: { pos: [7, 0, 2], radius: 0.25 },
    walls: [
      { x: 0,  z: -3.5, w: 16, d: 0.4, h: 0.5 }, // bottom
      { x: 0,  z:  3.5, w: 16, d: 0.4, h: 0.5 }, // top
      { x: -8, z: 0,    w: 0.4, d: 7,  h: 0.5 }, // left
      { x:  8, z: 0,    w: 0.4, d: 7,  h: 0.5 }, // right
      { x: -3, z: 0.5,  w: 0.4, d: 5,  h: 0.5 }, // S-curve wall 1
      { x: 0,  z: -1.5, w: 0.4, d: 3,  h: 0.5 }, // S-curve wall 2
      { x: 3,  z: 0.5,  w: 0.4, d: 5,  h: 0.5 }, // S-curve wall 3
    ],
    tips: "Patience is key. Multiple precise shots will beat one powerful miss.",
    unlockRequirement: { levelId: 6, maxStrokes: 7 },
  },
  {
    id: 8,
    name: "The Gauntlet",
    description: "Dodge multiple obstacles in this challenging course",
    par: 6,
    difficulty: "Hard",
    start: [0, 0.12, -6],
    hole: { pos: [0, 0, 6], radius: 0.25 },
    walls: [
      { x: -4, z: 0,  w: 0.4, d: 14, h: 0.5 }, // left boundary
      { x:  4, z: 0,  w: 0.4, d: 14, h: 0.5 }, // right boundary
      { x:  0, z: -7, w: 8,  d: 0.4, h: 0.5 }, // bottom cap
      { x:  0, z:  7, w: 8,  d: 0.4, h: 0.5 }, // top cap
      { x: -2, z: -3, w: 0.4, d: 2,  h: 0.5 }, // obstacle 1
      { x:  2, z: -1, w: 0.4, d: 2,  h: 0.5 }, // obstacle 2
      { x: -2, z:  1, w: 0.4, d: 2,  h: 0.5 }, // obstacle 3
      { x:  2, z:  3, w: 0.4, d: 2,  h: 0.5 }, // obstacle 4
    ],
    tips: "Zigzag through the obstacles. Use the walls to help guide your shots.",
    unlockRequirement: { levelId: 7, maxStrokes: 9 },
  },
  {
    id: 9,
    name: "The Cross",
    description: "Navigate the crossroads to reach your destination",
    par: 4,
    difficulty: "Expert",
    start: [-6, 0.12, -6],
    hole: { pos: [6, 0, 6], radius: 0.25 },
    walls: [
      { x: 0,  z: -7, w: 14, d: 0.4, h: 0.5 }, // bottom
      { x: 0,  z:  7, w: 14, d: 0.4, h: 0.5 }, // top
      { x: -7, z: 0,  w: 0.4, d: 14, h: 0.5 }, // left
      { x:  7, z: 0,  w: 0.4, d: 14, h: 0.5 }, // right
      { x: 0,  z: 0,  w: 8,  d: 0.4, h: 0.5 }, // horizontal cross
      { x: 0,  z: 0,  w: 0.4, d: 8,  h: 0.5 }, // vertical cross
    ],
    tips: "The cross divides the course into four quadrants. Plan your route carefully!",
    unlockRequirement: { levelId: 8, maxStrokes: 10 },
  },
  {
    id: 10,
    name: "Master's Challenge",
    description: "The ultimate test of precision and skill",
    par: 7,
    difficulty: "Expert",
    start: [0, 0.12, -8],
    hole: { pos: [0, 0, 8], radius: 0.22 }, // slightly smaller hole for extra challenge
    walls: [
      { x: -5, z: 0,  w: 0.4, d: 18, h: 0.5 }, // left boundary
      { x:  5, z: 0,  w: 0.4, d: 18, h: 0.5 }, // right boundary
      { x:  0, z: -9, w: 10, d: 0.4, h: 0.5 }, // bottom cap
      { x:  0, z:  9, w: 10, d: 0.4, h: 0.5 }, // top cap
      // Complex maze structure
      { x: -3, z: -5, w: 0.4, d: 4,  h: 0.5 }, // maze wall 1
      { x:  3, z: -5, w: 0.4, d: 4,  h: 0.5 }, // maze wall 2
      { x:  0, z: -3, w: 4,  d: 0.4, h: 0.5 }, // maze wall 3
      { x: -2, z: -1, w: 0.4, d: 2,  h: 0.5 }, // maze wall 4
      { x:  2, z: -1, w: 0.4, d: 2,  h: 0.5 }, // maze wall 5
      { x:  0, z:  1, w: 6,  d: 0.4, h: 0.5 }, // maze wall 6
      { x: -3, z:  3, w: 0.4, d: 4,  h: 0.5 }, // maze wall 7
      { x:  3, z:  3, w: 0.4, d: 4,  h: 0.5 }, // maze wall 8
      { x:  0, z:  5, w: 4,  d: 0.4, h: 0.5 }, // maze wall 9
    ],
    tips: "The master's course requires perfect execution. Every shot counts!",
    unlockRequirement: { levelId: 9, maxStrokes: 8 },
  },
];

// Level categories for UI organization
export const levelCategories = {
  beginner: [1, 2, 3],
  intermediate: [4, 5, 6],
  advanced: [7, 8],
  expert: [9, 10]
};

// Difficulty settings that affect game mechanics
export const difficultySettings = {
  Easy: {
    friction: 1.2,
    holeRadius: 0.25,
    powerMultiplier: 1.0,
    aimAssist: true
  },
  Medium: {
    friction: 1.5,
    holeRadius: 0.25,
    powerMultiplier: 1.1,
    aimAssist: false
  },
  Hard: {
    friction: 1.8,
    holeRadius: 0.23,
    powerMultiplier: 1.2,
    aimAssist: false
  },
  Expert: {
    friction: 2.0,
    holeRadius: 0.22,
    powerMultiplier: 1.3,
    aimAssist: false
  }
};

// Achievement triggers based on level performance
export const levelAchievements = {
  1: { holeinone: "First Hole in One", under_par: "Getting Started" },
  2: { holeinone: "Corner Pocket", under_par: "Diagonal Master" },
  3: { holeinone: "Strike!", under_par: "Alley Cat" },
  4: { holeinone: "Arena Champion", under_par: "Wide Open" },
  5: { holeinone: "Long Shot Legend", under_par: "Distance Master" },
  6: { holeinone: "Maze Runner", under_par: "Obstacle Course" },
  7: { holeinone: "S-Curve Specialist", under_par: "Curve Appeal" },
  8: { holeinone: "Gauntlet Master", under_par: "Dodge This" },
  9: { holeinone: "Cross Roads", under_par: "Intersection Expert" },
  10: { holeinone: "Master of Masters", under_par: "Ultimate Precision" }
};

// Utility functions
export const getLevelById = (id) => levels.find(level => level.id === id);

export const getNextLevel = (currentId) => {
  const currentIndex = levels.findIndex(level => level.id === currentId);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

export const getPreviousLevel = (currentId) => {
  const currentIndex = levels.findIndex(level => level.id === currentId);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
};

export const isLevelUnlocked = (levelId, userProgress) => {
  const level = getLevelById(levelId);
  if (!level || !level.unlockRequirement) return true;
  
  const requiredLevel = level.unlockRequirement.levelId;
  const maxStrokes = level.unlockRequirement.maxStrokes;
  
  return userProgress[requiredLevel] && userProgress[requiredLevel] <= maxStrokes;
};

export const getUnlockedLevels = (userProgress) => {
  return levels.filter(level => isLevelUnlocked(level.id, userProgress));
};

export const calculateLevelStats = (levelId, allScores) => {
  const levelScores = allScores.filter(score => score.level_id === levelId);
  if (levelScores.length === 0) return null;
  
  const scores = levelScores.map(s => s.best_score).sort((a, b) => a - b);
  const level = getLevelById(levelId);
  
  return {
    totalPlayers: scores.length,
    averageScore: scores.reduce((a, b) => a + b) / scores.length,
    bestScore: scores[0],
    completionRate: levelScores.length, // Could be enhanced with attempt data
    difficulty: level.difficulty,
    par: level.par,
    underParPercentage: scores.filter(s => s < level.par).length / scores.length * 100
  };
};