import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BEATS as CATALOG_BEATS, PRODUCERS } from '../data/catalog';
import {
  AppView,
  Beat,
  CartItem,
  CurrencyCode,
  LicenseTierId,
  MoodTag,
  Producer,
  PurchasedLicense,
  UserProfile,
  UserRole,
} from '../types/klave';
import { audioEngine, StemChannel } from '../utils/audioSynth';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  getDocs,
  doc,
  getDoc,
  User,
} from '../lib/firebase';
import { transformFirestoreBeat, RawFirestoreBeat } from '../utils/beatAdapter';
import { AuthModal } from '../components/modals/AuthModal';

interface ToastState {
  id: number;
  message: string;
  tone?: 'info' | 'success';
}

interface AppContextValue {
  view: AppView;
  selectedProducerId: string;
  navigate: (view: AppView, producerId?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  compactMode: boolean;
  setCompactMode: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;

  // Real Auth + Role
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signOutUser: () => Promise<void>;

  followedProducers: string[];
  toggleFollowProducer: (producerId: string) => void;
  savedBeatIds: string[];
  toggleSaveBeat: (beatId: string) => void;

  // Catalog Beats (Firestore + Curated)
  beats: Beat[];
  refreshBeats: () => Promise<void>;

  currentBeat: Beat | null;
  isPlaying: boolean;
  elapsedSec: number;
  volume: number;
  activeStems: Record<StemChannel, boolean>;
  toggleStem: (channel: StemChannel) => void;
  playBeat: (beat: Beat) => void;
  togglePlay: () => void;
  seekTo: (sec: number) => void;
  setVolume: (vol: number) => void;
  nextBeat: () => void;
  prevBeat: () => void;

  licenseModalBeat: Beat | null;
  openLicenseModal: (beat: Beat) => void;
  closeLicenseModal: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  neroOpen: boolean;
  setNeroOpen: (open: boolean) => void;
  neroInitialMood: MoodTag | null;
  openNeroWithMood: (mood: MoodTag | null) => void;
  trustModalOpen: boolean;
  setTrustModalOpen: (open: boolean) => void;

  cart: CartItem[];
  addToCart: (beatId: string, tierId: LicenseTierId) => void;
  removeFromCart: (beatId: string) => void;
  clearCart: () => void;
  cartSubtotalUsd: number;
  bundleDiscountUsd: number;
  cartTotalUsd: number;
  purchasedLicenses: PurchasedLicense[];
  completeCheckout: () => void;

  toast: ToastState | null;
  showToast: (message: string, tone?: 'info' | 'success') => void;
  getProducer: (id: string) => Producer | undefined;
}

const globalForCtx = globalThis as unknown as {
  __KLAVE_APP_CTX__?: React.Context<AppContextValue | null>;
};

const AppContext =
  globalForCtx.__KLAVE_APP_CTX__ ??
  (globalForCtx.__KLAVE_APP_CTX__ = createContext<AppContextValue | null>(null));

const STORAGE_KEY = 'klave_redesign_state_v2';

interface PersistedPrefs {
  theme: 'dark' | 'light';
  currency: CurrencyCode;
  compactMode: boolean;
  reduceMotion: boolean;
  role: UserRole;
  cart: CartItem[];
  savedBeatIds: string[];
  followedProducers: string[];
  purchasedLicenses: PurchasedLicense[];
}

function loadPersisted(): Partial<PersistedPrefs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedPrefs>) : {};
  } catch {
    return {};
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadPersisted(), []);

  const [view, setView] = useState<AppView>('discover');
  const [selectedProducerId, setSelectedProducerId] = useState<string>(PRODUCERS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [theme, setTheme] = useState<'dark' | 'light'>(initial.theme ?? 'dark');
  const [currency, setCurrency] = useState<CurrencyCode>(initial.currency ?? 'USD');
  const [compactMode, setCompactMode] = useState<boolean>(initial.compactMode ?? false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(initial.reduceMotion ?? false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>(initial.role ?? 'artist');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Beats Catalog State
  const [beats, setBeats] = useState<Beat[]>(CATALOG_BEATS);

  const [followedProducers, setFollowedProducers] = useState<string[]>(
    initial.followedProducers ?? ['soundsbykannon', 'northhh']
  );
  const [savedBeatIds, setSavedBeatIds] = useState<string[]>(
    initial.savedBeatIds ?? ['you-gettt', 'save-me']
  );

  const [currentBeat, setCurrentBeat] = useState<Beat | null>(CATALOG_BEATS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.75);
  const [activeStems, setActiveStems] = useState<Record<StemChannel, boolean>>({
    drums: true,
    bass: true,
    melody: true,
    hats: true,
  });

  const [licenseModalBeat, setLicenseModalBeat] = useState<Beat | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [neroOpen, setNeroOpen] = useState<boolean>(false);
  const [neroInitialMood, setNeroInitialMood] = useState<MoodTag | null>(null);
  const [trustModalOpen, setTrustModalOpen] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>(initial.cart ?? []);
  const [purchasedLicenses, setPurchasedLicenses] = useState<PurchasedLicense[]>(
    initial.purchasedLicenses ?? []
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as Partial<UserProfile>;
            const profile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: data.displayName || user.displayName || 'Producer',
              photoURL: data.photoURL || user.photoURL,
              role: (data.role as 'producer' | 'artist') || 'artist',
              tier: data.tier || 'free',
              admin: data.admin ?? false,
              referredBy: data.referredBy,
              referralCount: data.referralCount || 0,
              referralEarnings: data.referralEarnings || 0,
            };
            setUserProfile(profile);
            setRole(profile.role);
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Producer',
              photoURL: user.photoURL,
              role: 'artist',
              tier: 'free',
            });
          }
        } catch (e) {
          console.warn('Could not load user profile doc from firestore', e);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch live beats from Firestore
  const refreshBeats = async () => {
    try {
      const snap = await getDocs(collection(db, 'beats'));
      if (!snap.empty) {
        const firestoreBeats: Beat[] = snap.docs.map((d) =>
          transformFirestoreBeat(d.data() as RawFirestoreBeat, d.id)
        );
        // Merge with catalog beats, avoiding duplicate IDs
        const existingIds = new Set(firestoreBeats.map((b) => b.id));
        const filteredCatalog = CATALOG_BEATS.filter((b) => !existingIds.has(b.id));
        setBeats([...firestoreBeats, ...filteredCatalog]);
      }
    } catch (e) {
      console.warn('Firestore beats load fallback to static catalog', e);
    }
  };

  useEffect(() => {
    refreshBeats();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    const payload: PersistedPrefs = {
      theme,
      currency,
      compactMode,
      reduceMotion,
      role,
      cart,
      savedBeatIds,
      followedProducers,
      purchasedLicenses,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [
    theme,
    currency,
    compactMode,
    reduceMotion,
    role,
    cart,
    savedBeatIds,
    followedProducers,
    purchasedLicenses,
  ]);

  useEffect(() => {
    audioEngine.setOnProgress((sec, ended) => {
      setElapsedSec(sec);
      if (ended) {
        setIsPlaying(false);
      }
    });
    return () => audioEngine.stop();
  }, []);

  const showToast = (message: string, tone: 'info' | 'success' = 'info') => {
    const id = Date.now();
    setToast({ id, message, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
    setRole('guest');
    showToast('Signed out of KLAVE', 'info');
  };

  const navigate = (nextView: AppView, producerId?: string) => {
    if (producerId) {
      setSelectedProducerId(producerId);
    }
    setView(nextView);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const toggleStem = (channel: StemChannel) => {
    setActiveStems((prev) => {
      const next = { ...prev, [channel]: !prev[channel] };
      // Prevent muting all 4 stems at once
      if (!next.drums && !next.bass && !next.melody && !next.hats) {
        next[channel] = true;
      }
      audioEngine.setStemsState(next);
      return next;
    });
  };

  const playBeat = (beat: Beat) => {
    if (currentBeat?.id === beat.id) {
      if (isPlaying) {
        audioEngine.pause();
        setIsPlaying(false);
      } else {
        const offset = elapsedSec >= 30 ? 0 : elapsedSec;
        if (elapsedSec >= 30) setElapsedSec(0);
        audioEngine.start(beat, offset);
        setIsPlaying(true);
      }
      return;
    }

    setCurrentBeat(beat);
    setElapsedSec(0);
    audioEngine.start(beat, 0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentBeat) {
      playBeat(beats[0] || CATALOG_BEATS[0]);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      const startAt = elapsedSec >= 30 ? 0 : elapsedSec;
      if (elapsedSec >= 30) setElapsedSec(0);
      audioEngine.start(currentBeat, startAt);
      setIsPlaying(true);
    }
  };

  const seekTo = (sec: number) => {
    if (!currentBeat) return;
    audioEngine.seek(currentBeat, sec);
    setElapsedSec(sec);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
  };

  const nextBeat = () => {
    if (!currentBeat) {
      playBeat(beats[0] || CATALOG_BEATS[0]);
      return;
    }
    const idx = beats.findIndex((b) => b.id === currentBeat.id);
    const next = beats[(idx + 1) % beats.length];
    playBeat(next);
  };

  const prevBeat = () => {
    if (!currentBeat) {
      playBeat(beats[0] || CATALOG_BEATS[0]);
      return;
    }
    const idx = beats.findIndex((b) => b.id === currentBeat.id);
    const prev = beats[(idx - 1 + beats.length) % beats.length];
    playBeat(prev);
  };

  const addToCart = (beatId: string, tierId: LicenseTierId) => {
    const beat = beats.find((b) => b.id === beatId);
    if (!beat) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.beatId === beatId);
      if (existing) {
        return prev.map((item) => (item.beatId === beatId ? { ...item, tierId } : item));
      }
      return [...prev, { beatId, tierId }];
    });
    showToast(`Added "${beat.title}" (${beat.licenses[tierId].shortLabel}) to cart`, 'success');
  };

  const removeFromCart = (beatId: string) => {
    setCart((prev) => prev.filter((item) => item.beatId !== beatId));
  };

  const clearCart = () => setCart([]);

  const cartSubtotalUsd = useMemo(() => {
    return cart.reduce((sum, item) => {
      const beat = beats.find((b) => b.id === item.beatId);
      return sum + (beat ? beat.licenses[item.tierId].priceUsd : 0);
    }, 0);
  }, [cart, beats]);

  const bundleDiscountUsd = useMemo(() => {
    return cart.length >= 2 ? Math.round(cartSubtotalUsd * 0.15) : 0;
  }, [cart.length, cartSubtotalUsd]);

  const cartTotalUsd = Math.max(0, cartSubtotalUsd - bundleDiscountUsd);

  const completeCheckout = () => {
    if (cart.length === 0) return;
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const newLicenses: PurchasedLicense[] = cart
      .map((item) => {
        const beat = beats.find((b) => b.id === item.beatId);
        if (!beat) return null;
        return {
          id: `${beat.id}-${Date.now()}`,
          beatTitle: beat.title,
          producerName: beat.producerName,
          tierName: beat.licenses[item.tierId].name,
          priceUsd: beat.licenses[item.tierId].priceUsd,
          purchasedAt: now,
          stemCount: beat.licenses[item.tierId].stemsIncluded ? beat.stemCount : 0,
        };
      })
      .filter((x): x is PurchasedLicense => x !== null);

    setPurchasedLicenses((prev) => [...newLicenses, ...prev]);
    setCart([]);
    showToast('Licenses and stem archives unlocked in Profile.', 'success');
  };

  const toggleFollowProducer = (producerId: string) => {
    setFollowedProducers((prev) =>
      prev.includes(producerId) ? prev.filter((id) => id !== producerId) : [...prev, producerId]
    );
  };

  const toggleSaveBeat = (beatId: string) => {
    const added = !savedBeatIds.includes(beatId);
    setSavedBeatIds((prev) => (added ? [...prev, beatId] : prev.filter((id) => id !== beatId)));
    showToast(added ? 'Saved to crate' : 'Removed from crate');
  };

  const openNeroWithMood = (mood: MoodTag | null) => {
    setNeroInitialMood(mood);
    setNeroOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        view,
        selectedProducerId,
        navigate,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
        currency,
        setCurrency,
        compactMode,
        setCompactMode,
        reduceMotion,
        setReduceMotion,

        currentUser,
        userProfile,
        role,
        setRole,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signOutUser,

        followedProducers,
        toggleFollowProducer,
        savedBeatIds,
        toggleSaveBeat,

        beats,
        refreshBeats,

        currentBeat,
        isPlaying,
        elapsedSec,
        volume,
        activeStems,
        toggleStem,
        playBeat,
        togglePlay,
        seekTo,
        setVolume,
        nextBeat,
        prevBeat,
        licenseModalBeat,
        openLicenseModal: (beat) => setLicenseModalBeat(beat),
        closeLicenseModal: () => setLicenseModalBeat(null),
        cartOpen,
        setCartOpen,
        neroOpen,
        setNeroOpen,
        neroInitialMood,
        openNeroWithMood,
        trustModalOpen,
        setTrustModalOpen,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartSubtotalUsd,
        bundleDiscountUsd,
        cartTotalUsd,
        purchasedLicenses,
        completeCheckout,
        toast,
        showToast,
        getProducer: (id) => PRODUCERS.find((p) => p.id === id),
      }}
    >
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
