// Enhanced Star Wars models based on Bright Data MCP scraping
// Data sourced from Wookieepedia and other Star Wars databases

// ===== STARSHIP MODELS =====

export interface StarshipTechnicalSpecs {
  // Dimensions (from Wookieepedia data)
  lengthMeters: number;      // Millennium Falcon: 34.75m, X-Wing: 12.5m
  widthMeters: number;       // Millennium Falcon: 25.61m, X-Wing: 11.76m (closed)
  heightMeters: number;      // Millennium Falcon: 7.8m, X-Wing: 2.4m

  // Performance specs (from Bright Data scraping)
  maxSpeedKmh: number;       // Atmospheric speed
  hyperdriveClass: number;   // Millennium Falcon: 0.5, X-Wing: 1.0
  mgltRating: number;        // Space speed rating

  // Capacity specifications
  crewMin: number;           // Minimum crew required
  crewOptimal: number;       // Optimal crew size
  crewMax: number;           // Maximum crew capacity
  passengerCapacity: number; // Additional passengers
  cargoTons: number;         // Cargo capacity in metric tons

  // Combat and systems
  shieldStrength: number;    // Shield power rating
  hullIntegrity: number;     // Hull durability
  powerOutput: number;       // Reactor output
  sensorRange: number;       // Sensor detection range
}

export interface StarshipPhysicsConfig {
  // Physics properties for 3D simulation
  mass: number;              // in metric tons
  linearDamping: number;     // 0.0 - 1.0
  angularDamping: number;    // 0.0 - 1.0

  // Collision shape configuration
  collisionShape: 'box' | 'sphere' | 'hull';
  collisionScale: number;    // scale factor for collision mesh

  // Material properties
  friction: number;          // surface friction
  restitution: number;       // bounciness

  // Flight characteristics
  thrustForce: number;       // forward thrust
  maneuverForce: number;     // turning force
  maxVelocity: number;       // speed limit
  agility: number;           // maneuverability rating 1-10
}

export interface Model3DConfig {
  modelPath: string;         // Path to 3D model file (.glb/.gltf)
  texturePath: string;       // Path to texture files
  scale: number;             // Model scale factor
  rotationX: number;         // Initial X rotation
  rotationY: number;         // Initial Y rotation
  rotationZ: number;         // Initial Z rotation
  animationName: string;     // Default animation name
  hasAnimations: boolean;    // Whether model has animations
}

export interface GameplayStats {
  // Combat stats
  attackPower: number;       // Base attack damage
  defense: number;           // Damage reduction
  speed: number;             // Movement speed rating
  agility: number;           // Dodge/maneuver rating
  accuracy: number;          // Weapon accuracy bonus

  // Game progression
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;       // Required level to unlock
  upgradeCost: number;       // Cost to upgrade
  maxLevel: number;          // Maximum upgrade level

  // Special abilities
  specialAbilities: string[]; // List of special abilities
  faction: 'rebel' | 'empire' | 'neutral';
}

export interface WeaponSystem {
  id: number;
  starshipId: number;        // Foreign key
  name: string;              // e.g., "Quad Laser Cannon"
  type: 'laser' | 'ion' | 'missile' | 'torpedo';
  damage: number;            // Base damage per shot
  range: number;             // Maximum effective range
  rateOfFire: number;        // Shots per minute
  accuracy: number;          // Accuracy rating 1-100
  position: 'front' | 'rear' | 'turret' | 'wing';
}

export interface EnhancedStarship {
  id: number;
  url: string;
  name: string;
  model: string;
  manufacturer: string;
  costInCredits: string;
  length: string;
  maxAtmospheringSpeed: string;
  crew: string;
  passengers: string;
  cargoCapacity: string;
  consumables: string;
  hyperdriveRating: string;
  mglt: string;
  starshipClass: string;
  created: string;
  updated: string;

  // Enhanced data from Bright Data MCP
  technicalSpecs?: StarshipTechnicalSpecs;
  physicsConfig?: StarshipPhysicsConfig;
  model3DConfig?: Model3DConfig;
  gameplayStats?: GameplayStats;
  weaponSystems?: WeaponSystem[];

  // Relationships
  pilots?: any[];
  films?: any[];
}

// ===== PLANET MODELS =====

export interface PlanetSpecs {
  // Physical characteristics (from Tatooine, Coruscant, Hoth data)
  diameterKm: number;        // Tatooine: 10,465 km
  rotationHours: number;     // Tatooine: 23 hours
  orbitalDays: number;       // Tatooine: 304 days
  gravityFactor: number;     // 1.0 = standard gravity

  // Atmospheric data
  atmosphereType: 'breathable' | 'toxic' | 'none';
  temperature: 'hot' | 'cold' | 'temperate' | 'extreme';
  humidity: 'arid' | 'humid' | 'moderate';

  // Star system
  starCount: number;         // Tatooine: 2 (binary system)
  starType: string;          // "main_sequence", "red_giant", etc.
  moonCount: number;         // Number of natural satellites

  // Population and civilization
  populationCount: number;   // Actual population number
  techLevel: 'primitive' | 'standard' | 'advanced';
  governmentType: 'none' | 'tribal' | 'republic' | 'empire';
}

export interface Environment3D {
  // Skybox and lighting
  skyboxTexture: string;     // Path to skybox texture
  ambientColor: string;      // Hex color for ambient light
  sunColor: string;          // Hex color for directional light
  sunIntensity: number;      // Light intensity 0.0-2.0

  // Terrain configuration
  terrainType: 'desert' | 'ice' | 'forest' | 'city' | 'ocean';
  terrainTexture: string;    // Path to terrain texture
  terrainScale: number;      // Terrain size multiplier
  terrainHeight: number;     // Maximum terrain height

  // Weather and effects
  weatherType: 'clear' | 'storm' | 'fog' | 'snow';
  particleEffects: string[]; // ["sand", "snow", "rain", "ash"]
  fogDensity: number;        // Fog density 0.0-1.0
  fogColor: string;          // Hex color for fog

  // Audio environment
  ambientSound: string;      // Path to ambient audio file
  musicTrack: string;        // Path to background music
}

export interface PlanetGameplay {
  // Exploration mechanics
  explorationDifficulty: number; // 1-10 difficulty rating
  resourceTypes: string[];       // ["crystals", "metals", "energy"]
  resourceAbundance: 'scarce' | 'moderate' | 'abundant';

  // Hazards and challenges
  environmentalHazards: string[];  // ["sandstorm", "extreme_cold", "radiation"]
  hostileCreatures: string[];     // ["tusken_raiders", "wampa", "sarlacc"]
  imperialPresence: 'none' | 'light' | 'moderate' | 'heavy';

  // Missions and quests
  availableMissions: string[];    // Mission types available
  unlockRequirements: string[];   // Requirements to access planet
  completionRewards: string[];    // Rewards for planet completion

  // Strategic value
  strategicImportance: number;    // 1-10 importance rating
  factionControl: 'rebel' | 'empire' | 'neutral' | 'contested';
  tradeRouteValue: number;        // Economic importance 1-10
}

export interface EnhancedPlanet {
  id: number;
  url: string;
  name: string;
  rotationPeriod: string;
  orbitalPeriod: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surfaceWater: string;
  population: string;
  created: string;
  updated: string;

  // Enhanced data from Bright Data MCP
  planetSpecs?: PlanetSpecs;
  environment3D?: Environment3D;
  gameplayData?: PlanetGameplay;

  // Relationships
  residents?: any[];
  films?: any[];
}

// ===== BRIGHT DATA INTEGRATION CONSTANTS =====

export const BRIGHT_DATA_STARSHIPS = {
  MILLENNIUM_FALCON: 'millennium-falcon',
  X_WING: 'x-wing',
  TIE_FIGHTER: 'tie-fighter',
  STAR_DESTROYER: 'star-destroyer'
} as const;

export const BRIGHT_DATA_PLANETS = {
  TATOOINE: 'tatooine',
  HOTH: 'hoth',
  CORUSCANT: 'coruscant',
  ENDOR: 'endor'
} as const;

export const FACTION_COLORS = {
  rebel: '#FF6B35',
  empire: '#2C3E50',
  neutral: '#95A5A6'
} as const;

export const RARITY_COLORS = {
  common: '#95A5A6',
  rare: '#3498DB',
  epic: '#9B59B6',
  legendary: '#F39C12'
} as const;
