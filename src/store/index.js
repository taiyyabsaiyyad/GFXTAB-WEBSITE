import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/supabase.js'
import { notify } from '@/components/ui/Toast.jsx'

// ---- UI Store ----
export const useUIStore = create((set) => ({
  sidebarExpanded: false,
  activeModal: null,
  toasts: [],
  splashDone: false,
  onboardingDone: false,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setSplashDone: (v) => set({ splashDone: v }),
  setOnboardingDone: (v) => set({ onboardingDone: v }),
}))

// ---- Upload Store ----
export const useUploadStore = create((set) => ({
  // States: idle | hovering | uploading | processing | complete | error
  uploadState: 'idle',
  file: null,
  fileUrl: null,
  uploadProgress: 0,
  processingStep: 0,
  processingSteps: [
    'Detecting image type...',
    'Extracting color palette...',
    'Removing background...',
    'Analyzing composition...',
    'Finding best products...',
  ],
  analysisResult: null,
  error: null,

  setUploadState: (state) => set({ uploadState: state }),
  setFile: (file, url) => set({ file, fileUrl: url }),
  setUploadProgress: (p) => set({ uploadProgress: p }),
  setProcessingStep: (step) => set({ processingStep: step }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setError: (error) => set({ error, uploadState: 'error' }),
  reset: () => set({
    uploadState: 'idle',
    file: null,
    fileUrl: null,
    uploadProgress: 0,
    processingStep: 0,
    analysisResult: null,
    error: null,
  }),
}))

// ---- Editor Store ----
export const useEditorStore = create((set, get) => ({
  canvasRef: null,
  artwork: null,       // { url, width, height, x, y, scale, rotation, opacity, blendMode }
  product: null,       // { id, name, category, colorVariant, template }
  history: [],         // undo stack (max 50)
  historyIndex: -1,
  activeLayer: 'artwork',
  snapEnabled: true,
  showGrid: false,
  viewAngle: 'front',  // front | back | side

  generatedPreviewUrl: null,
  setCanvasRef: (ref) => set({ canvasRef: ref }),
  setArtwork: (artwork) => set({ artwork }),
  setProduct: (product) => set({ product }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  setGeneratedPreviewUrl: (url) => set({ generatedPreviewUrl: url }),

  updateArtwork: (patch) => set((s) => ({
    artwork: s.artwork ? { ...s.artwork, ...patch } : null
  })),

  pushHistory: () => {
    const { artwork, history, historyIndex } = get()
    if (!artwork) return
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ ...artwork })
    set({
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49),
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ artwork: { ...history[newIndex] }, historyIndex: newIndex })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ artwork: { ...history[newIndex] }, historyIndex: newIndex })
  },

  reset: () => set({
    artwork: null,
    product: null,
    history: [],
    historyIndex: -1,
    activeLayer: 'artwork',
    viewAngle: 'front',
    generatedPreviewUrl: null,
  }),
}))

// ---- Project Store ----
export const useProjectStore = create(persist(
  (set, get) => ({
    projects: [],
    activeProjectId: null,

    fetchProjects: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw error
          set({ projects: data || [] })
        } catch (e) {
          console.error('Error fetching projects:', e)
        }
      }
    },

    addProject: async (project) => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) return

          const { data, error } = await supabase
            .from('projects')
            .insert({
              name: project.name,
              mockup_id: project.mockupId,
              artwork_url: project.artworkUrl,
              canvas_state: project.canvasState,
              user_id: userId
            })
            .select()
            .single()

          if (error) throw error
          set((s) => ({ projects: [data, ...s.projects] }))
          return data
        } catch (e) {
          console.error('Error adding project:', e)
        }
      } else {
        const newProj = {
          id: Date.now().toString(),
          name: project.name,
          mockup_id: project.mockupId,
          artwork_url: project.artworkUrl,
          canvas_state: project.canvasState,
          created_at: new Date().toISOString()
        }
        set((s) => ({ projects: [newProj, ...s.projects] }))
        return newProj
      }
    },

    updateProject: async (id, patch) => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('projects')
            .update({
              name: patch.name,
              canvas_state: patch.canvasState
            })
            .eq('id', id)

          if (error) throw error
          set((s) => ({
            projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p)
          }))
        } catch (e) {
          console.error('Error updating project:', e)
        }
      } else {
        set((s) => ({
          projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p)
        }))
      }
    },

    deleteProject: async (id) => {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

          if (error) throw error
          set((s) => ({ projects: s.projects.filter(p => p.id !== id) }))
        } catch (e) {
          console.error('Error deleting project:', e)
        }
      } else {
        set((s) => ({ projects: s.projects.filter(p => p.id !== id) }))
      }
    },

    setActiveProject: (id) => set({ activeProjectId: id }),

    getProject: (id) => get().projects.find(p => p.id === id),
  }),
  { name: 'gfxtab-projects' }
))

// ---- Brand Store ----
export const useBrandStore = create(persist(
  (set, get) => ({
    brands: [],
    activeBrandId: null,

    addBrand: (brand) => set((s) => ({
      brands: [{ id: Date.now().toString(), createdAt: new Date().toISOString(), ...brand }, ...s.brands]
    })),

    updateBrand: (id, patch) => set((s) => ({
      brands: s.brands.map(b => b.id === id ? { ...b, ...patch } : b)
    })),

    deleteBrand: (id) => set((s) => ({
      brands: s.brands.filter(b => b.id !== id)
    })),

    setActiveBrand: (id) => set({ activeBrandId: id }),

    getActiveBrand: () => {
      const { brands, activeBrandId } = get()
      return brands.find(b => b.id === activeBrandId) || brands[0] || null
    },
  }),
  { name: 'gfxtab-brands' }
))

// ---- Auth Store ----
export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    credits: 50,
    isUpgradeModalOpen: false,

    setUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
    login: (user) => set({ user, isAuthenticated: true }),
    logout: async () => {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      set({ user: null, isAuthenticated: false })
    },
    setUser: (user) => set({ user }),
    useCredit: () => set((s) => ({ credits: Math.max(0, s.credits - 10) })),
    addCredits: (n) => set((s) => ({ credits: s.credits + n })),

    syncSession: async () => {
      if (!isSupabaseConfigured) return

      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url,
            plan: 'pro'
          },
          isAuthenticated: true
        })
      }

      // Listen for updates
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url,
              plan: 'pro'
            },
            isAuthenticated: true
          })
        } else {
          set({ user: null, isAuthenticated: false })
        }
      })
    }
  }),
  { name: 'gfxtab-auth' }
))

// ---- Download Store ----
export const useDownloadStore = create(persist(
  (set, get) => ({
    downloads: [],

    fetchDownloads: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('downloads')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw error
          set({ downloads: data || [] })
        } catch (e) {
          console.error('Error fetching downloads:', e)
        }
      }
    },

    addDownload: async (download) => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) return

          const { data, error } = await supabase
            .from('downloads')
            .insert({
              user_id: userId,
              asset_id: download.assetId,
              asset_name: download.assetName,
              preview_url: download.previewUrl
            })
            .select()
            .single()

          if (error) throw error
          set((s) => ({ downloads: [data, ...s.downloads] }))
          return data
        } catch (e) {
          console.error('Error adding download:', e)
        }
      } else {
        const newDl = {
          id: Date.now().toString(),
          asset_id: download.assetId,
          asset_name: download.assetName,
          preview_url: download.previewUrl,
          created_at: new Date().toISOString()
        }
        set((s) => ({ downloads: [newDl, ...s.downloads] }))
        return newDl
      }
    }
  }),
  { name: 'gfxtab-downloads' }
))

// ---- Collection Store ----
export const useCollectionStore = create(persist(
  (set, get) => ({
    favorites: [],
    collections: [],

    toggleFavorite: (assetId) => set((s) => {
      const isFav = s.favorites.includes(assetId)
      const newFavs = isFav ? s.favorites.filter(id => id !== assetId) : [...s.favorites, assetId]
      notify.success(isFav ? 'Removed from Favorites' : 'Saved to Favorites')
      return { favorites: newFavs }
    }),

    createCollection: (name, description = '') => set((s) => {
      const newColl = {
        id: Date.now().toString(),
        name,
        description,
        assets: []
      }
      notify.success(`Collection "${name}" created!`)
      return { collections: [newColl, ...s.collections] }
    }),

    addToCollection: (collectionId, assetId) => set((s) => {
      const updated = s.collections.map(c => {
        if (c.id === collectionId) {
          if (c.assets.includes(assetId)) {
            notify.info('Already in collection')
            return c
          }
          notify.success(`Added to ${c.name}`)
          return { ...c, assets: [...c.assets, assetId] }
        }
        return c
      })
      return { collections: updated }
    }),

    removeFromCollection: (collectionId, assetId) => set((s) => {
      const updated = s.collections.map(c => {
        if (c.id === collectionId) {
          notify.info(`Removed from ${c.name}`)
          return { ...c, assets: c.assets.filter(id => id !== assetId) }
        }
        return c
      })
      return { collections: updated }
    })
  }),
  { name: 'gfxtab-collections' }
))

// ---- Marketplace Store (For Custom Uploads / AI Additions) ----
export const useMarketplaceStore = create(persist(
  (set) => ({
    customAssets: [],
    addCustomAsset: (asset) => set((s) => ({ customAssets: [asset, ...s.customAssets] })),
  }),
  { name: 'gfxtab-marketplace-custom' }
))

