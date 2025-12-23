import React, { useState } from 'react';
import {
  Save,
  RefreshCw,
  Users,
  BarChart3
} from 'lucide-react';


const AdminSettingsTab = () => {
  // Cargar configuraciÃ³n guardada
  const savedConfig = JSON.parse(localStorage.getItem('tribu_admin_config') || '{}');

  const [config, setConfig] = useState({
    membershipPrice: savedConfig.membershipPrice || 20000,
    matchesPerUser: savedConfig.matchesPerUser || 10,
    whatsappSupport: savedConfig.whatsappSupport || '+56951776005',
    appName: savedConfig.appName || 'Tribu Impulsa',
    mercadopagoMode: savedConfig.mercadopagoMode || 'sandbox'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Guardar en localStorage
    localStorage.setItem('tribu_admin_config', JSON.stringify(config));

    // Sincronizar con Firebase usando funciÃ³n centralizada
    const synced = await syncAdminConfig(config);

    if (synced) {
      setSaveMessage('âœ… ConfiguraciÃ³n guardada y sincronizada con Firebase');
    } else {
      setSaveMessage('âœ… Guardado localmente (Firebase no disponible)');
    }

    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#181B34]">ConfiguraciÃ³n</h1>

      {/* ConfiguraciÃ³n de MembresÃ­a */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <CreditCard size={20} className="text-[#6161FF]" /> MembresÃ­a y Pagos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Precio mensual (CLP)</label>
            <input
              type="number"
              value={config.membershipPrice}
              onChange={(e) => setConfig({ ...config, membershipPrice: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
            />
            <p className="text-xs text-[#7C8193] mt-1">Este precio se mostrarÃ¡ en la pantalla de pago</p>
          </div>
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Modo MercadoPago</label>
            <select
              value={config.mercadopagoMode}
              onChange={(e) => setConfig({ ...config, mercadopagoMode: e.target.value })}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
            >
              <option value="sandbox">ðŸ§ª Sandbox (Pruebas)</option>
              <option value="production">ðŸš€ ProducciÃ³n (Real)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ConfiguraciÃ³n del Algoritmo */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <Users size={20} className="text-[#00CA72]" /> Algoritmo de Matching
        </h3>
        <div>
          <label className="block text-sm text-[#434343] mb-1 font-medium">Matches por usuario (10+10)</label>
          <input
            type="number"
            value={config.matchesPerUser}
            onChange={(e) => setConfig({ ...config, matchesPerUser: parseInt(e.target.value) || 10 })}
            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
          />
          <p className="text-xs text-[#7C8193] mt-1">CuÃ¡ntas cuentas se asignan para compartir y recibir</p>
        </div>
      </div>

      {/* ConfiguraciÃ³n de Soporte */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <HelpCircle size={20} className="text-[#A78BFA]" /> Soporte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">WhatsApp soporte</label>
            <input
              type="text"
              value={config.whatsappSupport}
              onChange={(e) => setConfig({ ...config, whatsappSupport: e.target.value })}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
              placeholder="+56912345678"
            />
            <p className="text-xs text-[#7C8193] mt-1">NÃºmero que aparece en el botÃ³n de WhatsApp</p>
          </div>
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Nombre de la App</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
            />
          </div>
        </div>
      </div>

      {/* BotÃ³n guardar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white px-6 py-3 rounded-lg hover:opacity-90 font-semibold transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} /> Guardar Cambios
            </>
          )}
        </button>
        {saveMessage && (
          <span className={`text-sm font-medium ${saveMessage.includes('âœ…') ? 'text-[#00CA72]' : 'text-[#FB275D]'}`}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Info de sincronizaciÃ³n */}
      <div className="bg-[#F5F7FB] rounded-xl p-4 border border-[#E4E7EF]">
        <p className="text-xs text-[#7C8193]">
          <strong>Persistencia:</strong> Los cambios se guardan en localStorage y se sincronizan con Firebase.
          La configuraciÃ³n se aplica inmediatamente en toda la aplicaciÃ³n.
        </p>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
