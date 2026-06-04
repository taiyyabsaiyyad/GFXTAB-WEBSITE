import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Play, Eye, ExternalLink, Activity, FolderGit2, Star, Target } from 'lucide-react'
import { GlassCard } from '@/components/ui/Card.jsx'
import { GlowButton, GhostButton } from '@/components/ui/Button.jsx'
import { notify } from '@/components/ui/Toast.jsx'
import { trackEvent } from '@/utils/tracker.js'

const CATEGORIES = [
  'All Projects', 'Branding', 'Logo Design', 'Social Media', 'Website Design', 
  'UI/UX', 'Motion Graphics', 'Video Editing', 'Campaign Design', 
  'Editorial Design', 'Packaging Design', 'Case Studies'
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All Projects')
  const [selectedProject, setSelectedProject] = useState(null)
  
  // Hero Slider State
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      const [projRes, statsRes] = await Promise.all([
        fetch('http://localhost:4000/portfolio/projects'),
        fetch('http://localhost:4000/portfolio/stats')
      ])
      
      const projData = await projRes.json()
      const statsData = await statsRes.json()

      if (projData.success) setProjects(projData.projects)
      if (statsData.success) setStats(statsData.stats)
    } catch (err) {
      console.error(err)
      notify.error('Failed to load portfolio ecosystem.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-slide Hero
  useEffect(() => {
    if (projects.length === 0 || selectedProject) return
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(projects.length, 5))
    }, 6000)
    return () => clearInterval(timer)
  }, [projects, selectedProject])

  const filteredProjects = activeCategory === 'All Projects' 
    ? projects 
    : projects.filter(p => p.category === activeCategory)

  // Featured Projects for Hero Slider
  const featuredProjects = projects.slice(0, 5)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spin" style={{ width: 40, height: 40, border: '3px solid var(--lime)', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    )
  }

  // --- Render Detail Modal (Case Study) ---
  if (selectedProject) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          style={{ paddingBottom: 'var(--space-16)' }}
        >
          {/* Back Button */}
          <button 
            onClick={() => setSelectedProject(null)}
            style={{ 
              background: 'var(--void-3)', border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)', padding: '10px 16px', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-sm)', fontWeight: 600
            }}
            className="hover-card"
          >
            <ChevronLeft size={16} /> Back to Portfolio
          </button>

          {/* Hero Banner */}
          <div style={{ 
            width: '100%', height: '50vh', minHeight: 400, borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', position: 'relative', marginBottom: 'var(--space-8)'
          }}>
            <img src={`${import.meta.env.BASE_URL}assets/IMG/${selectedProject.coverImage}`} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #090910, transparent)' }} />
            
            <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
              <span style={{ color: 'var(--lime)', fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {selectedProject.category}
              </span>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, marginTop: 8, fontFamily: 'var(--font-display)' }}>
                {selectedProject.title}
              </h1>
            </div>
          </div>

          {/* Case Study Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
            <GlassCard style={{ padding: 24 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</span>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selectedProject.client}</div>
            </GlassCard>
            <GlassCard style={{ padding: 24 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Year</span>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selectedProject.year}</div>
            </GlassCard>
            <GlassCard style={{ padding: 24 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools Used</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {selectedProject.tools.map(t => (
                  <span key={t} style={{ background: 'var(--void-3)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--lime)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>
            <GlassCard style={{ padding: 24 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Behance</span>
              <div style={{ marginTop: 8 }}>
                <a href={selectedProject.behanceUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
                  View Full Case Study <ExternalLink size={14} color="var(--lime)" />
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Overview */}
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Project Overview</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6 }}>{selectedProject.overview}</p>
          </div>

          {/* Gallery - Masonry / Grid depending on type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedProject.type === 'masonry' ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr',
            gap: 'var(--space-6)'
          }}>
            {selectedProject.gallery.map((media, idx) => (
              <GlassCard key={idx} style={{ overflow: 'hidden', padding: 0, border: 'none', borderRadius: 'var(--radius-lg)' }}>
                {media.type === 'image' ? (
                  <img src={`${import.meta.env.BASE_URL}assets/IMG/${media.url}`} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Gallery Item" />
                ) : null}
              </GlassCard>
            ))}
          </div>

          {/* Impact Stats */}
          {selectedProject.stats && selectedProject.stats.length > 0 && (
            <div style={{ marginTop: 'var(--space-16)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>Project Impact</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                {selectedProject.stats.map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    )
  }

  // --- Main Portfolio View ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Portfolio Stats Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <GlassCard style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderGit2 color="var(--lime)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.totalProjects}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</div>
            </div>
          </GlassCard>
          
          <GlassCard style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star color="var(--lime)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.yearsExperience}+</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Years Experience</div>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target color="var(--lime)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.brandIdentities}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Identities</div>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity color="var(--lime)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.globalClients}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Clients</div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Featured Hero Slider */}
      {featuredProjects.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: 450, borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}assets/IMG/${featuredProjects[heroIndex].coverImage}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #090910 10%, rgba(9,9,16,0.6) 50%, transparent)' }} />
              
              <div style={{ position: 'absolute', bottom: 60, left: 60, maxWidth: 600 }}>
                <span style={{ 
                  background: 'var(--lime)', color: '#000', padding: '4px 12px', 
                  borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' 
                }}>
                  {featuredProjects[heroIndex].category}
                </span>
                <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, marginTop: 16, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                  {featuredProjects[heroIndex].title}
                </h1>
                <p style={{ color: '#d4d4d8', fontSize: 16, marginTop: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featuredProjects[heroIndex].overview}
                </p>
                <div style={{ marginTop: 24 }}>
                  <GlowButton onClick={() => setSelectedProject(featuredProjects[heroIndex])}>
                    View Case Study <ArrowRight size={16} />
                  </GlowButton>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <div style={{ position: 'absolute', bottom: 30, right: 40, display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setHeroIndex(prev => prev === 0 ? featuredProjects.length - 1 : prev - 1)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setHeroIndex(prev => (prev + 1) % featuredProjects.length)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Categories Filter Tabs */}
      <div style={{ 
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, 
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--lime)' : 'var(--void-3)',
              color: activeCategory === cat ? '#000' : 'var(--text-secondary)',
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: 'var(--text-sm)', border: '1px solid',
              borderColor: activeCategory === cat ? 'var(--lime)' : 'var(--glass-border)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid Projects */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: 'var(--space-6)' 
      }}>
        <AnimatePresence>
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setSelectedProject(project)}
            >
              <GlassCard 
                className="hover-card group" 
                style={{ 
                  padding: 0, overflow: 'hidden', cursor: 'pointer', 
                  display: 'flex', flexDirection: 'column', height: '100%',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Image Wrapper */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}assets/IMG/${project.coverImage}`} 
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'cover', 
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }}
                    className="group-hover-zoom"
                    alt={project.title}
                  />
                  {/* Hover Overlay */}
                  <div 
                    className="group-hover-overlay"
                    style={{ 
                      position: 'absolute', inset: 0, background: 'rgba(9,9,16,0.5)', 
                      opacity: 0, transition: 'opacity 0.3s', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center' 
                    }}
                  >
                    <div style={{ 
                      background: 'var(--lime)', color: '#000', width: 50, height: 50, 
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transform: 'translateY(20px)', transition: 'all 0.3s', className: 'group-hover-icon'
                    }}>
                      <Eye size={24} />
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: 'var(--lime)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {project.category}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{project.year}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                    {project.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.overview}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  )
}

// Add CSS to index.css or a style tag for hover effects
// .group:hover .group-hover-zoom { transform: scale(1.05); }
// .group:hover .group-hover-overlay { opacity: 1; }
// .group:hover .group-hover-icon { transform: translateY(0); }
// .group:hover { border-color: rgba(200, 255, 0, 0.5) !important; box-shadow: 0 10px 40px -10px rgba(200, 255, 0, 0.2); }
