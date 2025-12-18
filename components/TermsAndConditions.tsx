import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, Shield, Users, Lock, Mail } from 'lucide-react';

// Contenido de los Términos y Condiciones
const TERMS_CONTENT = `
TÉRMINOS Y CONDICIONES DE USO
TRIBU IMPULSA

Última actualización: Diciembre 2025

Al registrarte y utilizar Tribu Impulsa, declaras que has leído, entendido y aceptado los siguientes términos y condiciones:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ACEPTACIÓN DE TÉRMINOS

1.1. Al crear una cuenta en Tribu Impulsa, aceptas estos Términos y Condiciones en su totalidad.
1.2. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la plataforma.
1.3. Tribu Impulsa se reserva el derecho de modificar estos términos, notificando a los usuarios con anticipación razonable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. DESCRIPCIÓN DEL SERVICIO

2.1. Tribu Impulsa es una plataforma de networking y colaboración empresarial que conecta emprendedores mediante un algoritmo de matching inteligente.
2.2. El servicio incluye:
   • Algoritmo Tribal 10+10: Conexión mensual con emprendedores complementarios
   • Club de Beneficios: Descuentos y ofertas exclusivas de empresas aliadas
   • Academia Santander: Acceso a capacitaciones y recursos educativos
   • Herramientas de networking y colaboración

2.3. La disponibilidad de funcionalidades puede variar según el plan de membresía.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. MEMBRESÍA Y PAGOS

3.1. PLANES DISPONIBLES:
   • Plan Mensual: $19.990 CLP/mes
   • Plan Semestral: $99.990 CLP (equivalente a 6 meses, pagas 5)
   • Plan Anual: $179.990 CLP (equivalente a 12 meses, pagas 9)

3.2. Los pagos se procesan a través de MercadoPago de forma segura.
3.3. Los precios pueden estar sujetos a cambios, los cuales serán notificados con anticipación.
3.4. No se realizan reembolsos por períodos no utilizados, salvo en casos excepcionales evaluados individualmente.

3.5. PROMOCIÓN BETA PÚBLICA (válida hasta 31 de diciembre de 2025):
   • Usuarios registrados antes del 1 de enero de 2026 reciben 1 mes gratis del Círculo Emprendedor.
   • Esta promoción no es acumulable con otras ofertas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. PROTECCIÓN DE DATOS PERSONALES

4.1. Tribu Impulsa cumple con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.

4.2. DATOS QUE RECOPILAMOS:
   • Información de perfil: nombre, empresa, correo electrónico, teléfono
   • Preferencias de negocio: rubro, afinidad, zona geográfica, facturación
   • Datos de uso: interacciones, matches, actividad en la plataforma

4.3. USO DE LOS DATOS:
   • Operar el algoritmo de matching
   • Personalizar la experiencia del usuario
   • Enviar comunicaciones relevantes sobre la plataforma
   • Mejorar continuamente el servicio

4.4. COMPARTICIÓN DE DATOS:
   • NO vendemos ni cedemos datos personales a terceros
   • Las empresas aliadas solo acceden a información mínima necesaria para activar beneficios
   • Podemos compartir datos anonimizados para análisis estadísticos

4.5. DERECHOS DEL USUARIO:
   • Acceder a tus datos personales
   • Solicitar rectificación de información incorrecta
   • Solicitar eliminación de tu cuenta y datos
   • Oponerte al tratamiento de datos para fines específicos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. COMUNICACIONES Y CONTACTO

5.1. Al aceptar estos términos, autorizas a Tribu Impulsa a contactarte mediante:
   • Correo electrónico
   • WhatsApp o mensajería
   • Notificaciones push en la aplicación

5.2. Las comunicaciones pueden incluir:
   • Notificaciones sobre tu Tribu mensual
   • Actualizaciones de la plataforma
   • Ofertas y beneficios exclusivos
   • Recordatorios de actividades pendientes

5.3. Puedes gestionar tus preferencias de comunicación en la configuración de tu perfil.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. CÓDIGO DE CONDUCTA

6.1. Los usuarios de Tribu Impulsa se comprometen a:
   • Proporcionar información veraz y actualizada
   • Mantener un trato respetuoso con otros miembros
   • Cumplir con los compromisos del Algoritmo 10+10
   • No utilizar la plataforma para spam, ventas agresivas o fraude

6.2. PROHIBICIONES:
   • Crear múltiples cuentas para una misma persona o empresa
   • Compartir credenciales de acceso
   • Extraer o recopilar datos de otros usuarios
   • Publicar contenido ofensivo, ilegal o inapropiado

6.3. El incumplimiento puede resultar en suspensión o cancelación de la cuenta.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. EMPRESAS ALIADAS Y BENEFICIOS

7.1. Tribu Impulsa colabora con empresas aliadas que ofrecen beneficios exclusivos.
7.2. Los beneficios están sujetos a disponibilidad y condiciones de cada aliado.
7.3. Tribu Impulsa no es responsable de:
   • La calidad de productos o servicios de terceros
   • Transacciones comerciales entre usuarios y aliados
   • Cambios en las condiciones de beneficios por parte de aliados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. PROPIEDAD INTELECTUAL

8.1. Todo el contenido de Tribu Impulsa (marca, logo, diseño, algoritmos, textos) es propiedad de Tribu Impulsa SpA.
8.2. Los usuarios no pueden reproducir, distribuir o modificar el contenido sin autorización.
8.3. El contenido generado por usuarios dentro de la plataforma sigue siendo propiedad del usuario, otorgando a Tribu Impulsa una licencia de uso para operar el servicio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. LIMITACIÓN DE RESPONSABILIDAD

9.1. Tribu Impulsa no garantiza:
   • Resultados comerciales específicos derivados del networking
   • Disponibilidad ininterrumpida del servicio
   • Compatibilidad con todos los dispositivos

9.2. La plataforma se ofrece "tal cual" y el usuario asume el riesgo de su uso.
9.3. En ningún caso Tribu Impulsa será responsable por daños indirectos, incidentales o consecuentes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. CANCELACIÓN Y TERMINACIÓN

10.1. El usuario puede cancelar su cuenta en cualquier momento desde la configuración de perfil.
10.2. Tribu Impulsa puede suspender o cancelar cuentas que incumplan estos términos.
10.3. Al cancelar, los datos personales serán eliminados dentro de 30 días, salvo obligación legal de retenerlos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. LEY APLICABLE Y JURISDICCIÓN

11.1. Estos términos se rigen por las leyes de la República de Chile.
11.2. Cualquier controversia será sometida a los tribunales ordinarios de justicia de Santiago de Chile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12. CONTACTO

Para consultas sobre estos términos o el tratamiento de tus datos:

📧 contacto@tribuimpulsa.cl
📧 privacidad@tribuimpulsa.cl
🌐 www.tribuimpulsa.cl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Al hacer clic en "Acepto", confirmas que has leído y aceptado estos Términos y Condiciones en su totalidad.

© 2025 Tribu Impulsa SpA. Todos los derechos reservados.
`;

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept,
  showAcceptButton = false 
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([TERMS_CONTENT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Terminos_y_Condiciones_Tribu_Impulsa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6161FF] via-[#8B5CF6] to-[#C026D3] p-4 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Términos y Condiciones</h2>
                <p className="text-white/80 text-xs">Tribu Impulsa - Diciembre 2025</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Key Points Summary */}
        <div className="p-4 bg-gradient-to-r from-[#6161FF]/5 to-[#C026D3]/5 border-b border-[#E4E7EF] flex-shrink-0">
          <h3 className="text-sm font-bold text-[#181B34] mb-2">Puntos Clave:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-[#434343]">
              <Shield size={14} className="text-[#6161FF]" />
              <span>Protección de datos garantizada</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#434343]">
              <Users size={14} className="text-[#00CA72]" />
              <span>Networking seguro y verificado</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#434343]">
              <Lock size={14} className="text-[#8B5CF6]" />
              <span>Pagos seguros con MercadoPago</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#434343]">
              <Mail size={14} className="text-[#C026D3]" />
              <span>Comunicaciones relevantes</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
        >
          <pre className="whitespace-pre-wrap font-sans text-sm text-[#434343] leading-relaxed">
            {TERMS_CONTENT}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E7EF] flex-shrink-0 space-y-3">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Download size={16} />
            Descargar documento completo
          </button>

          {/* Accept button (if shown) */}
          {showAcceptButton && onAccept && (
            <button
              onClick={onAccept}
              disabled={!hasScrolledToBottom}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all ${
                hasScrolledToBottom
                  ? 'bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={18} />
              {hasScrolledToBottom ? 'Acepto los Términos y Condiciones' : 'Lee el documento completo para continuar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Checkbox component for registration
interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onChange, error }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`flex items-start gap-3 p-3 rounded-xl border ${error ? 'border-[#FB275D] bg-[#FB275D]/5' : 'border-[#E4E7EF] bg-white'}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded border-[#E4E7EF] text-[#6161FF] focus:ring-[#6161FF] mt-0.5 flex-shrink-0"
        />
        <div className="text-sm text-[#434343]">
          <span>Acepto los </span>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-[#6161FF] font-semibold underline hover:text-[#8B5CF6]"
          >
            Términos y Condiciones
          </button>
          <span> de Tribu Impulsa y autorizo que me contacten para información relevante sobre la plataforma.</span>
        </div>
      </div>
      {error && (
        <p className="text-xs text-[#FB275D] mt-1">Debes aceptar los términos y condiciones para continuar</p>
      )}

      <TermsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default TermsModal;
