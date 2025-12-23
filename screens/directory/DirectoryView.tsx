import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronRight } from 'lucide-react';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import { getAllUsers } from '../../services/databaseService';
import { generateMockMatches, getMyProfile } from '../../services/matchService';

export const DirectoryView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const allUsers = getAllUsers().filter(u => u.email !== 'admin@tribuimpulsa.cl');
  const myProfile = getMyProfile();

  // Obtener matches recomendados
  const matches = useMemo(() => {
    if (!myProfile) return [];
    return generateMockMatches(myProfile.category, myProfile.id).slice(0, 8);
  }, [myProfile]);

  const filteredUsers = allUsers.filter(user =>
    user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-32 min-h-screen bg-[#F5F7FB]">
      <header className="px-5 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <h1 className="text-xl font-bold text-[#181B34]">Red de Emprendedores</h1>
        <p className="text-sm text-[#7C8193]">{allUsers.length} emprendimientos activos</p>

        {/* Search with glass effect */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Buscar por nombre o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6161FF] pl-10"
          />
          <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8193]" />
        </div>
      </header>

      {/* Recomendados para ti - Al inicio */}
      {matches.length > 0 && !searchQuery && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#181B34]">⭐ Recomendados para ti</h2>
            <span className="text-xs text-[#7C8193]">{matches.length} matches</span>
          </div>

          <div className="space-y-2 mb-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl p-4 border border-[#6161FF]/20 hover:border-[#6161FF] transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={match.targetProfile.avatarUrl}
                    alt={match.targetProfile.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-[#6161FF]/30"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#181B34] truncate text-sm">{match.targetProfile.companyName}</h3>
                        <p className="text-xs text-[#7C8193] truncate">{match.targetProfile.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match.affinityScore > 90 ? 'bg-[#00CA72]/20 text-[#00CA72]' : 'bg-[#6161FF]/20 text-[#6161FF]'}`}>
                        {match.affinityScore}%
                      </span>
                    </div>
                    <p className="text-[0.6875rem] text-[#7C8193] mt-1 truncate">{match.reason}</p>

                    <button
                      onClick={() => navigate(`/profile/${match.targetProfile.id}`)}
                      className="mt-2 text-[0.625rem] font-semibold text-[#E91E63] bg-[#E91E63]/10 px-3 py-1 rounded-full hover:bg-[#E91E63]/20 transition-colors"
                    >
                      Ver perfil →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-[#E4E7EF] mb-4"></div>
          <h2 className="text-base font-semibold text-[#181B34] mb-3">Todos los emprendimientos</h2>
        </div>
      )}

      <div className={`px-4 ${matches.length > 0 && !searchQuery ? '' : 'py-4'} space-y-3`}>
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => navigate(`/profile/${user.id}`)}
            className="bg-white rounded-2xl p-4 border border-[#E4E7EF] hover:border-[#6161FF] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              {/* Avatar con borde de marca */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName || user.name || 'User')}&background=6161FF&color=fff&bold=true`}
                  alt={user.companyName || user.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* MARCA/EMPRESA PROMINENTE */}
                <h3 className="font-black text-base text-[#181B34] truncate leading-tight group-hover:text-[#6161FF] transition-colors">
                  {user.companyName || user.name}
                </h3>
                <p className="text-xs text-[#7C8193] truncate">por {user.name}</p>
                
                {/* Categoría y afinidad */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {user.category}
                  </span>
                  {user.affinity && (
                    <span className="text-[0.625rem] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
                      🎯 {user.affinity}
                    </span>
                  )}
                </div>
              </div>
              
              <ChevronRight size={20} className="text-[#B3B8C6] flex-shrink-0 group-hover:text-[#6161FF] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#7C8193]">No se encontraron emprendimientos</p>
          </div>
        )}
      </div>
    </div>
  );
};

