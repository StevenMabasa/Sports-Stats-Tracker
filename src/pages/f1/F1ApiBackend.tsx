import { createContext, useContext, useState, useEffect, useCallback} from 'react';
import type{  ReactNode  } from 'react';

// ==================== TYPE DEFINITIONS ====================

interface Driver {
  id: string;
  full_name: string;
  given_name: string;
  family_name: string;
  code: string;
  current_team_name: string | null;
  image_url: string | null;
  team_color: string | null;
  country_code: string;
  driver_number: number;
  date_of_birth: string;
}

interface Constructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  is_active: boolean;
}

interface ConstructorStats {
  constructorId: number;
  constructorName: string;
  nationality: string;
  isActive: boolean;
  stats: {
    points: number;
    wins: number;
    podiums: number;
    position: number;
  };
}

interface Race {
  id: number;
  season_id: number;
  circuit_id: number;
  round: number;
  name: string;
  date: string;
  time: string | null;
  season: {
    id: number;
    year: number;
  };
  circuit: {
    id: number;
    name: string;
    location: string;
    country_code: string;
    map_url: string;
  };
}

interface RaceResult {
  session_id: number;
  driver_id: number;
  driver_code: string;
  driver_name: string;
  constructor_id: number;
  constructor_name: string;
  position: number;
  points: string;
  grid: number;
  time_ms: string | null;
  status: string;
  fastest_lap_rank: number | null;
  points_for_fastest_lap: string;
}

interface FeaturedDriver {
  id: string;
  fullName: string;
  driverNumber: number;
  countryCode: string;
  teamName: string;
  seasonPoints: number;
  seasonWins: number;
  seasonPoles: number;
  position: number;
  careerStats: {
    wins: number;
    podiums: number;
    poles: number;
  };
  recentForm: Array<{
    position: number;
    raceName: string;
    countryCode: string;
  }>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// ==================== API SERVICE ====================

const API_BASE_URL = 'https://raceiq-api.onrender.com/api';
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const apiCache = new ApiCache();

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      // Use CORS proxy for production, direct for development
      const proxyUrl = url.startsWith('http') 
        ? `https://corsproxy.io/?${encodeURIComponent(url)}`
        : url;
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          'accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw new Error('Max retries reached');
}

async function cachedFetch<T>(
  endpoint: string,
  cacheKey: string,
  cacheDuration: number = CACHE_DURATION.MEDIUM
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const url = `${API_BASE_URL}${endpoint}`;
  const data = await fetchWithRetry<T>(url);

  // Store in cache
  apiCache.set(cacheKey, data, cacheDuration);

  return data;
}

// ==================== API FUNCTIONS ====================

export const F1Api = {
  async getDrivers(): Promise<Driver[]> {
    return cachedFetch<Driver[]>(
      '/drivers',
      'drivers:all',
      CACHE_DURATION.LONG
    );
  },

  async getDriver(id: string): Promise<Driver> {
    return cachedFetch<Driver>(
      `/drivers/${id}`,
      `driver:${id}`,
      CACHE_DURATION.LONG
    );
  },

  async getActiveConstructors(): Promise<Constructor[]> {
    return cachedFetch<Constructor[]>(
      '/constructors/active',
      'constructors:active',
      CACHE_DURATION.MEDIUM
    );
  },

  async getConstructorStats(year: number = 2024): Promise<{ seasonYear: number; constructors: ConstructorStats[] }> {
    return cachedFetch(
      `/constructors/stats/bulk?year=${year}&includeHistorical=false`,
      `constructors:stats:${year}`,
      CACHE_DURATION.SHORT
    );
  },

  async getRaces(year?: number): Promise<Race[]> {
    const endpoint = year ? `/races?year=${year}` : '/races';
    const cacheKey = year ? `races:${year}` : 'races:all';
    
    return cachedFetch<Race[]>(
      endpoint,
      cacheKey,
      CACHE_DURATION.MEDIUM
    );
  },

  async getRaceResults(raceId: number): Promise<RaceResult[]> {
    return cachedFetch<RaceResult[]>(
      `/race-results?raceId=${raceId}`,
      `race-results:${raceId}`,
      CACHE_DURATION.LONG
    );
  },

  async getFeaturedDriver(): Promise<FeaturedDriver> {
    return cachedFetch<FeaturedDriver>(
      '/standings/featured-driver',
      'featured-driver',
      CACHE_DURATION.SHORT
    );
  },

  clearCache(): void {
    apiCache.clear();
  },

  invalidateCache(pattern: string): void {
    apiCache.delete(pattern);
  }
};

// ==================== REACT CONTEXT ====================

interface F1DataContextType {
  drivers: Driver[] | null;
  constructors: Constructor[] | null;
  constructorStats: ConstructorStats[] | null;
  races: Race[] | null;
  featuredDriver: FeaturedDriver | null;
  loading: {
    drivers: boolean;
    constructors: boolean;
    constructorStats: boolean;
    races: boolean;
    featuredDriver: boolean;
  };
  errors: {
    drivers: Error | null;
    constructors: Error | null;
    constructorStats: Error | null;
    races: Error | null;
    featuredDriver: Error | null;
  };
  refetch: {
    drivers: () => Promise<void>;
    constructors: () => Promise<void>;
    constructorStats: (year?: number) => Promise<void>;
    races: (year?: number) => Promise<void>;
    featuredDriver: () => Promise<void>;
  };
}

const F1DataContext = createContext<F1DataContextType | undefined>(undefined);

export const F1DataProvider = ({ children }: { children: ReactNode }) => {
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [constructors, setConstructors] = useState<Constructor[] | null>(null);
  const [constructorStats, setConstructorStats] = useState<ConstructorStats[] | null>(null);
  const [races, setRaces] = useState<Race[] | null>(null);
  const [featuredDriver, setFeaturedDriver] = useState<FeaturedDriver | null>(null);

  const [loading, setLoading] = useState({
    drivers: false,
    constructors: false,
    constructorStats: false,
    races: false,
    featuredDriver: false,
  });

  const [errors, setErrors] = useState<F1DataContextType['errors']>({
    drivers: null,
    constructors: null,
    constructorStats: null,
    races: null,
    featuredDriver: null,
  });

  const fetchDrivers = useCallback(async () => {
    setLoading(prev => ({ ...prev, drivers: true }));
    setErrors(prev => ({ ...prev, drivers: null }));
    try {
      const data = await F1Api.getDrivers();
      setDrivers(data);
    } catch (error) {
      setErrors(prev => ({ ...prev, drivers: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, drivers: false }));
    }
  }, []);

  const fetchConstructors = useCallback(async () => {
    setLoading(prev => ({ ...prev, constructors: true }));
    setErrors(prev => ({ ...prev, constructors: null }));
    try {
      const data = await F1Api.getActiveConstructors();
      setConstructors(data);
    } catch (error) {
      setErrors(prev => ({ ...prev, constructors: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, constructors: false }));
    }
  }, []);

  const fetchConstructorStats = useCallback(async (year: number = 2024) => {
    setLoading(prev => ({ ...prev, constructorStats: true }));
    setErrors(prev => ({ ...prev, constructorStats: null }));
    try {
      const data = await F1Api.getConstructorStats(year);
      setConstructorStats(data.constructors.filter(c => c.isActive && c.stats.position > 0));
    } catch (error) {
      setErrors(prev => ({ ...prev, constructorStats: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, constructorStats: false }));
    }
  }, []);

  const fetchRaces = useCallback(async (year?: number) => {
    setLoading(prev => ({ ...prev, races: true }));
    setErrors(prev => ({ ...prev, races: null }));
    try {
      const data = await F1Api.getRaces(year);
      setRaces(data);
    } catch (error) {
      setErrors(prev => ({ ...prev, races: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, races: false }));
    }
  }, []);

  const fetchFeaturedDriver = useCallback(async () => {
    setLoading(prev => ({ ...prev, featuredDriver: true }));
    setErrors(prev => ({ ...prev, featuredDriver: null }));
    try {
      const data = await F1Api.getFeaturedDriver();
      setFeaturedDriver(data);
    } catch (error) {
      setErrors(prev => ({ ...prev, featuredDriver: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, featuredDriver: false }));
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetchDrivers();
    fetchConstructors();
    fetchConstructorStats(currentYear);
    fetchRaces(currentYear);
    fetchFeaturedDriver();
  }, []);

  return (
    <F1DataContext.Provider
      value={{
        drivers,
        constructors,
        constructorStats,
        races,
        featuredDriver,
        loading,
        errors,
        refetch: {
          drivers: fetchDrivers,
          constructors: fetchConstructors,
          constructorStats: fetchConstructorStats,
          races: fetchRaces,
          featuredDriver: fetchFeaturedDriver,
        },
      }}
    >
      {children}
    </F1DataContext.Provider>
  );
};

export const useF1Data = () => {
  const context = useContext(F1DataContext);
  if (!context) {
    throw new Error('useF1Data must be used within F1DataProvider');
  }
  return context;
};

// ==================== CUSTOM HOOKS ====================

export const useDrivers = () => {
  const { drivers, loading, errors, refetch } = useF1Data();
  return {
    drivers,
    loading: loading.drivers,
    error: errors.drivers,
    refetch: refetch.drivers,
  };
};

export const useConstructors = () => {
  const { constructors, constructorStats, loading, errors, refetch } = useF1Data();
  return {
    constructors,
    constructorStats,
    loading: loading.constructors || loading.constructorStats,
    error: errors.constructors || errors.constructorStats,
    refetch: refetch.constructors,
    refetchStats: refetch.constructorStats,
  };
};

export const useRaces = (year?: number) => {
  const { races, loading, errors, refetch } = useF1Data();
  const [filteredRaces, setFilteredRaces] = useState<Race[] | null>(null);

  useEffect(() => {
    if (races) {
      if (year) {
        setFilteredRaces(races.filter(r => r.season.year === year));
      } else {
        setFilteredRaces(races);
      }
    }
  }, [races, year]);

  return {
    races: filteredRaces,
    loading: loading.races,
    error: errors.races,
    refetch: () => refetch.races(year),
  };
};

export const useRaceResults = (raceId: number | null) => {
  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchResults = useCallback(async () => {
    if (!raceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await F1Api.getRaceResults(raceId);
      setResults(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { results, loading, error, refetch: fetchResults };
};

export const useFeaturedDriver = () => {
  const { featuredDriver, loading, errors, refetch } = useF1Data();
  return {
    featuredDriver,
    loading: loading.featuredDriver,
    error: errors.featuredDriver,
    refetch: refetch.featuredDriver,
  };
};