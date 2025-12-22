
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Gift, Star, ExternalLink, MessageCircle } from 'lucide-react';

const ALIANZAS_BENEFICIOS = [
    {
        id: 'santander',
        nombre: 'Santander Open Academy',
        descripcion: 'Cursos gratuitos de desarrollo profesional y empresarial',
        tipo: 'Educación',
        descuento: 'GRATIS',
        color: 'from-[#EC0000] to-[#CC0000]',
        logo: '🎓',
        url: 'https://www.santanderopenacademy.com/',
        destacado: true
    },
    {
        id: 'lovework',
        nombre: 'Lovework',
        descripcion: 'Formalización y regularización empresarial. Asesoría para emprendedores.',
        tipo: 'Legal / Empresarial',
        descuento: '20% OFF',
        color: 'from-[#E91E63] to-[#C2185B]',
        logo: '💼',
        url: 'https://lovework.cl/',
        destacado: true
    },
    {
        id: 'soledad-mulati',
        nombre: 'Soledad Mulati',
        descripcion: 'Asesoría legal preferencial para miembros de Tribu Impulsa',
        tipo: 'Legal',
        descuento: '15% OFF',
        color: 'from-[#6161FF] to-[#4A4AE0]',
        logo: '⚖️',
        url: null,
        contacto: '+56 9 1234 5678'
    },
    {
        id: 'restaurantes',
        nombre: 'Red de Restaurantes',
        descripcion: 'Descuentos en restaurantes y cafeterías aliadas a la comunidad',
        tipo: 'Gastronomía',
        descuento: '10-15% OFF',
        color: 'from-[#FF9500] to-[#FF6B00]',
        logo: '🍽️',
        url: null,
        proximamente: true
    },
    {
        id: 'cowork',
        nombre: 'Espacios Cowork',
        descripcion: 'Acceso preferencial a espacios de trabajo compartido',
        tipo: 'Espacios',
        descuento: '25% OFF',
        color: 'from-[#00CA72] to-[#00A85D]',
        logo: '🏢',
        url: null,
        proximamente: true
    },
    {
        id: 'bienestar',
        nombre: 'Club de Bienestar',
        descripcion: 'Yoga, pilates, meditación y más con descuentos exclusivos',
        tipo: 'Bienestar',
        descuento: '20% OFF',
        color: 'from-[#A78BFA] to-[#8B5CF6]',
        logo: '🧘',
        url: null,
        proximamente: true
    }
];

export const BenefitsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [filtroActivo, setFiltroActivo] = useState('todos');

    const categorias = ['todos', 'Educación', 'Legal', 'Gastronomía', 'Espacios', 'Bienestar'];

    // Imágenes stock para cada alianza
    const alianzaImages: Record<string, string> = {
        'santander': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
        'lovework': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
        'soledad-mulati': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
        'restaurantes': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        'cowork': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
        'bienestar': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    };

    const handleLinkClick = (alianza: typeof ALIANZAS_BENEFICIOS[0]) => {
        // Analytics simulado
        console.log(`Click en alianza: ${alianza.id} por usuario ${currentUser?.uid}`);

        if (alianza.url) {
            window.open(alianza.url, '_blank');
        }
    };

    const alianzasFiltradas = filtroActivo === 'todos'
        ? ALIANZAS_BENEFICIOS
        : ALIANZAS_BENEFICIOS.filter(a => a.tipo.includes(filtroActivo));

    const alianzasDestacadas = ALIANZAS_BENEFICIOS.filter(a => a.destacado);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#FAF5FF] to-[#FDF4FF] pb-32">
            {/* Hero Header Premium */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6161FF] via-[#8B5CF6] to-[#C026D3]" />
                {/* Pattern SVG */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 18c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z' stroke='%23fff' stroke-opacity='.1'/%3E%3C/g%3E%3C/svg%3E")`
                }} />
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#A855F7]/20 rounded-full blur-3xl -ml-30 -mb-30" />

                <div className="relative px-4 pt-12 pb-8">
                    <div className="max-w-5xl mx-auto">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Volver al dashboard</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Gift size={40} className="text-[#6161FF]" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white">Club de Beneficios</h1>
                                    <p className="text-white/80 mt-1">Alianzas exclusivas para miembros de la Tribu</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 hidden md:flex">
                                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
                                    <p className="text-white/60 text-xs">Alianzas activas</p>
                                    <p className="text-white font-black text-2xl">{ALIANZAS_BENEFICIOS.filter(a => !a.proximamente).length}</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
                                    <p className="text-white/60 text-xs">Próximamente</p>
                                    <p className="text-white font-black text-2xl">{ALIANZAS_BENEFICIOS.filter(a => a.proximamente).length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-4">
                {/* Filtros por categoría */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFiltroActivo(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filtroActivo === cat
                                    ? 'bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white shadow-lg'
                                    : 'text-[#666] hover:bg-gray-100'
                                    }`}
                            >
                                {cat === 'todos' ? '✨ Todos' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Destacados */}
                {filtroActivo === 'todos' && alianzasDestacadas.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-[#181B34] mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-[#f59e0b]" />
                            Destacados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alianzasDestacadas.map((alianza) => (
                                <div
                                    key={alianza.id}
                                    className="group relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    {/* Imagen de fondo */}
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={alianzaImages[alianza.id]}
                                            alt={alianza.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                        {/* Badge destacado */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="px-3 py-1 bg-[#f59e0b] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                                <Star className="w-3 h-3" /> DESTACADO
                                            </span>
                                        </div>

                                        {/* Descuento */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-3 py-1.5 bg-white text-[#181B34] text-sm font-black rounded-full shadow-lg">
                                                {alianza.descuento}
                                            </span>
                                        </div>

                                        {/* Info sobre imagen */}
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="text-white/80 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                                {alianza.tipo}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-[#181B34] mb-1 group-hover:text-[#6161FF] transition-colors">
                                            {alianza.nombre}
                                        </h3>
                                        <p className="text-sm text-[#666] mb-4 line-clamp-2">
                                            {alianza.descripcion}
                                        </p>

                                        {alianza.url ? (
                                            <button
                                                onClick={() => handleLinkClick(alianza)}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink size={16} />
                                                Ir al sitio
                                            </button>
                                        ) : alianza.contacto ? (
                                            <a
                                                href={`https://wa.me/${alianza.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy miembro de Tribu Impulsa y me interesa el beneficio de ${alianza.nombre}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle size={16} />
                                                Contactar por WhatsApp
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grid de todas las alianzas */}
                <div>
                    <h2 className="text-xl font-bold text-[#181B34] mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-[#6161FF]" />
                        {filtroActivo === 'todos' ? 'Todas las alianzas' : filtroActivo}
                        <span className="text-sm font-normal text-[#666] bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                            {alianzasFiltradas.length}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alianzasFiltradas.map((alianza) => (
                            <div
                                key={alianza.id}
                                className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${alianza.proximamente ? 'opacity-60' : ''}`}
                            >
                                {/* Imagen */}
                                <div className="relative h-32 overflow-hidden">
                                    <img
                                        src={alianzaImages[alianza.id]}
                                        alt={alianza.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    {/* Tags */}
                                    <div className="absolute top-3 left-3">
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-white/90 text-[#666]">
                                            {alianza.tipo}
                                        </span>
                                    </div>

                                    {alianza.proximamente && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                            <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold text-[#666]">
                                                🔜 Próximamente
                                            </span>
                                        </div>
                                    )}

                                    {/* Descuento */}
                                    <div className="absolute bottom-3 right-3">
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${alianza.descuento === 'GRATIS'
                                            ? 'bg-[#00CA72] text-white'
                                            : 'bg-white text-[#181B34]'
                                            }`}>
                                            {alianza.descuento}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4">
                                    <h3 className="font-bold text-[#181B34] mb-1 group-hover:text-[#6161FF] transition-colors line-clamp-1">
                                        {alianza.nombre}
                                    </h3>
                                    <p className="text-sm text-[#666] mb-4 line-clamp-2">
                                        {alianza.descripcion}
                                    </p>

                                    {alianza.proximamente ? (
                                        <div className="w-full py-2.5 rounded-xl bg-gray-100 text-[#666] text-sm text-center font-medium">
                                            Avisaremos cuando esté disponible
                                        </div>
                                    ) : alianza.url ? (
                                        <button
                                            onClick={() => handleLinkClick(alianza)}
                                            className="w-full py-2.5 rounded-xl bg-[#181B34] text-white font-semibold text-sm hover:bg-[#6161FF] transition-all flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={14} />
                                            Acceder al beneficio
                                        </button>
                                    ) : alianza.contacto ? (
                                        <a
                                            href={`https://wa.me/${alianza.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy miembro de Tribu Impulsa y me interesa el beneficio de ${alianza.nombre}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={14} />
                                            Contactar
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
