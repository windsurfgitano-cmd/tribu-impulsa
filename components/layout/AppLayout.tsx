import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Gift,
  Activity,
  Handshake,
  X,
  CheckCircle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { getCurrentUser } from '../../services/databaseService';
import { getMyProfile } from '../../services/matchService';
import { clearStoredSession } from '../../utils/storage';
import { LoginScreen } from '../../screens/auth';
import { RegisterScreen } from '../../screens/auth';
import { SurveyScreen } from '../../screens/survey';
import { SearchingScreen } from '../../screens/loading';
import { MembershipScreen } from '../../screens/membership';
import { Dashboard } from '../../screens/dashboard';
import { TribeAssignmentsView } from '../../screens/tribe';
import { MyProfileView, ProfileDetail } from '../../screens/profile';
import { ActivityView } from '../../screens/activity';
import { DirectoryView } from '../../screens/directory';
import { ClubBienestarView } from '../../screens/benefits';
import { AdminSettingsTab } from '../../screens/admin';
import { MemberRoute } from '../routing';
import { PaymentResult } from '../PaymentResult';
import { WhatsAppFloat } from '../WhatsAppFloat';
import { ProfileReminderBanner } from '../common';
import { AcademiaView } from '../academia/AcademiaView';

// Wrapper for AcademiaView to use with React Router
const AcademiaViewWrapper = () => {
  const navigate = useNavigate();
  return <AcademiaView onNavigateBack={() => navigate('/dashboard')} />;
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Memoizar para evitar recalcular en cada render
  const currentUser = useMemo(() => getCurrentUser(), [location.pathname]);
  const myProfile = useMemo(() => getMyProfile(), [location.pathname]);
  
  const [showMenu, setShowMenu] = useState(false);
  const [navGlobalProgress, setNavGlobalProgress] = useState({ current: 0, target: 1000 });

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('tribu_font_size');
    return saved === 'small' || saved === 'medium' || saved === 'large' ? saved : 'small';
  });
  
  // Cargar progreso global para el bloqueo de Mi Tribu
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { getFirestoreInstance } = await import('../../services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (!db) return;
        
        const statsRef = doc(db, 'system_stats', 'global');
        const snapshot = await getDoc(statsRef);
        const data = snapshot.data() || {};
        setNavGlobalProgress({
          current: data.profilesCompleted || 0,
          target: data.profilesTarget || 1000
        });
      } catch (error) {
        console.error('Error cargando progreso:', error);
      }
    };
    loadProgress();
  }, []);

  useEffect(() => {
    const sizes = {
      small: '16px',
      medium: '20px',
      large: '24px'
    };
    document.documentElement.style.fontSize = sizes[fontSize];
    document.documentElement.style.setProperty('--base-font-size', sizes[fontSize]);
    localStorage.setItem('tribu_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  // Verificar membresÃ­a para mostrar candados en navegaciÃ³n
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!currentUser) {
        setIsMember(false);
        return;
      }
      
      // Verificar localStorage (incluir trial!)
      const status = localStorage.getItem(`membership_status_${currentUser.id}`);
      if (status === 'miembro' || status === 'admin' || status === 'trial') {
        setIsMember(true);
        return;
      }
      
      // Si no estÃ¡ en localStorage, verificar Firebase
      try {
        const membershipData = await fetchMembershipFromCloud(currentUser.id);
        if (membershipData) {
          syncMembershipToLocalCache(currentUser.id, membershipData);
          const isActive = membershipData.status === 'miembro' || membershipData.status === 'admin' || (
            membershipData.status === 'trial' &&
            membershipData.expiresAt &&
            new Date(membershipData.expiresAt) > new Date()
          );
          setIsMember(isActive);
        }
      } catch (err) {
        console.log('Error verificando membresÃ­a:', err);
      }
    };
    
    checkMemberStatus();
  }, [currentUser, location.pathname]);

  // Hide nav on login, register, survey, admin, membership and complete-profile pages
  const hiddenNavRoutes = ['/', '/register', '/survey', '/admin', '/membership', '/searching', '/complete-profile'];
  const showNav = !hiddenNavRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.includes('/dashboard');
  const isActivity = location.pathname.includes('/activity');
  const isProfile = location.pathname.includes('/my-profile');
  const isTribe = location.pathname.includes('/tribe');
  const isDirectory = location.pathname.includes('/directory');
  const isBeneficios = location.pathname.includes('/beneficios');

  // FunciÃ³n para navegar con verificaciÃ³n de membresÃ­a
  const navigateWithCheck = (path: string, requiresMembership: boolean) => {
    // Bloquear acceso a Mi Tribu hasta 1000 perfiles
    if (path === '/tribe' && navGlobalProgress.current < navGlobalProgress.target) {
      alert('Â¡Mi Tribu se desbloquearÃ¡ cuando lleguemos a 1000 perfiles completos!');
      return;
    }
    
    if (requiresMembership && !isMember) {
      navigate('/membership');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen w-full text-[#181B34] font-sans bg-[#F5F7FB]">
      {/* Menú Hamburguesa Overlay */}
      {showNav && showMenu && (
        <div className="fixed inset-0 z-[10000]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-slideIn">
            <div className="p-6 bg-gradient-to-r from-[#6161FF] to-[#00CA72]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Menú</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={myProfile.avatarUrl}
                  alt="Me"
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                />
                <div>
                  <p className="text-white font-semibold">{myProfile.name}</p>
                  <p className="text-white/70 text-sm">{myProfile.companyName}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-[#7C8193] uppercase tracking-wide px-3 mb-2">Alianzas</p>

              <button
                onClick={() => {}}
                disabled
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 cursor-not-allowed opacity-60"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                  <span className="text-lg">ðŸŽ“</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-500">Santander Academia</p>
                  <p className="text-xs text-gray-400">PrÃ³ximamente</p>
                </div>
              </button>

              <div className="border-t border-[#E4E7EF] my-3" />

              <button
                onClick={() => { setShowMenu(false); navigateWithCheck('/beneficios', true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00CA72]/10 flex items-center justify-center">
                  <Gift size={20} className="text-[#00CA72]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#181B34]">Club de Bienestar</p>
                  <p className="text-xs text-[#7C8193]">Descuentos y beneficios exclusivos</p>
                </div>
                <ChevronRight size={16} className="text-[#7C8193]" />
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/searching" element={<SearchingScreen />} />
          <Route path="/survey" element={<SurveyScreen />} />
          <Route path="/membership" element={<MembershipScreen />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          {/* Rutas PROTEGIDAS - solo para MIEMBROS */}
          <Route path="/dashboard" element={<MemberRoute><Dashboard /></MemberRoute>} />
          <Route path="/tribe" element={<MemberRoute><TribeAssignmentsView /></MemberRoute>} />
          <Route path="/directory" element={<MemberRoute><DirectoryView /></MemberRoute>} />
          <Route path="/profile/:id" element={<MemberRoute><ProfileDetail /></MemberRoute>} />
          {/* Rutas LIBRES - para todos */}
          <Route path="/activity" element={<ActivityView />} />
          <Route path="/my-profile" element={<MyProfileView fontSize={fontSize} setFontSize={setFontSize} />} />
          <Route path="/admin" element={<AdminSettingsTab />} />
          <Route path="/academia" element={<AcademiaViewWrapper />} />
          <Route path="/beneficios" element={<MemberRoute><ClubBienestarView /></MemberRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl bg-white/80 border-t border-white/30"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            height: 'calc(70px + env(safe-area-inset-bottom, 0px))',
            zIndex: 9999,
            boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <div className="h-[70px] px-2 flex justify-around items-center max-w-md mx-auto">
            {/* Menú Hamburguesa */}
            <button
              onClick={() => setShowMenu(true)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors relative ${showMenu ? 'text-[#6161FF]' : 'text-[#7C8193] hover:text-[#181B34]'
                }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={showMenu ? 2.5 : 1.8} strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="text-[0.625rem] mt-1 font-medium">Menú</span>
            </button>

            {/* Inicio - BLOQUEADO para invitados */}
            <button
              onClick={() => navigateWithCheck('/dashboard', true)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors relative ${isDashboard ? 'text-[#6161FF]' :
                !isMember ? 'text-[#B3B8C6]' : 'text-[#7C8193] hover:text-[#181B34]'
                }`}
            >
              <Home size={22} strokeWidth={isDashboard ? 2.5 : 1.8} />
              <span className="text-[0.625rem] mt-1 font-medium">Inicio</span>
              {!isMember && <Lock size={10} className="absolute top-1 right-1 text-[#FB275D]" />}
            </button>

            {/* Checklist / Mi Tribu - BLOQUEADO para invitados */}
            <button
              onClick={() => navigateWithCheck('/tribe', true)}
              className="flex flex-col items-center justify-center -mt-4 relative"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg ${!isMember ? 'bg-[#7C8193]/60' : 'bg-[#E91E63]/90'
                }`}
                style={{
                  boxShadow: !isMember
                    ? '0 4px 16px rgba(124, 129, 147, 0.2)'
                    : '0 8px 32px rgba(233, 30, 99, 0.35), inset 0 1px 1px rgba(255,255,255,0.3)'
                }}
              >
                {!isMember ? <Lock size={24} className="text-white" /> : <CheckCircle size={26} className="text-white" strokeWidth={2} />}
              </div>
              <span className={`text-[0.625rem] mt-1 font-semibold ${!isMember ? 'text-[#7C8193]' : 'text-[#E91E63]'
                }`}>Mi Tribu</span>
            </button>

            {/* Beneficios - BLOQUEADO para invitados */}
            <button
              onClick={() => navigateWithCheck('/beneficios', true)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors relative ${isBeneficios ? 'text-[#6161FF]' :
                !isMember ? 'text-[#B3B8C6]' : 'text-[#7C8193] hover:text-[#181B34]'
                }`}
            >
              <Gift size={22} strokeWidth={isBeneficios ? 2.5 : 1.8} />
              <span className="text-[0.625rem] mt-1 font-medium">Beneficios</span>
              {!isMember && <Lock size={10} className="absolute top-1 right-1 text-[#FB275D]" />}
            </button>

            {/* ConfiguraciÃ³n/Perfil - LIBRE para todos */}
            <button
              onClick={() => navigate('/my-profile')}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isProfile ? 'text-[#6161FF]' : 'text-[#7C8193] hover:text-[#181B34]'}`}
            >
              <Settings size={22} strokeWidth={isProfile ? 2.5 : 1.8} />
              <span className="text-[0.625rem] mt-1 font-medium">Ajustes</span>
            </button>
          </div>
        </nav>
      )}

      {showNav && <WhatsAppFloat />}
    </div>
  );
};

export default AppLayout;
