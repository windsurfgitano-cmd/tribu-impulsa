
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Lock, CreditCard, LogOut } from 'lucide-react';

export const PaymentScreen: React.FC = () => {
    const { logout } = useAuth();

    const handlePayment = () => {
        // TODO: Integrate MercadoPago
        window.open('https://link.mercadopago.cl/', '_blank');
        alert('En desarrollo: Simulación de pago exitosa. Contacta a soporte para reactivar.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <GlassCard className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
                        <Lock size={40} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-white">Tu periodo de prueba finalizó</h1>
                        <p className="text-white/60 mt-2">
                            Para seguir impulsando tu negocio con Tribu, suscríbete a nuestro plan mensual.
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-blue-300 font-bold uppercase tracking-wider">Plan Impulsa</p>
                        <p className="text-3xl font-bold text-white mt-1">$29.990 <span className="text-sm font-normal text-white/50">/mes</span></p>
                        <ul className="text-left text-sm text-white/70 mt-4 space-y-2">
                            <li>✅ Acceso a Tribu 10+10</li>
                            <li>✅ Academia Santander</li>
                            <li>✅ Reportes Mensuales</li>
                        </ul>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <CreditCard size={20} /> Suscribirse Ahora
                    </button>

                    <button
                        onClick={logout}
                        className="text-white/40 text-sm hover:text-white flex items-center justify-center gap-2 mx-auto"
                    >
                        <LogOut size={14} /> Cerrar Sesión
                    </button>
                </GlassCard>
            </div>
        </div>
    );
};
