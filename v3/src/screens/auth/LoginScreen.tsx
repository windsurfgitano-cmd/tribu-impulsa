
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
    // Estado Standard Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, currentUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // Estado Dev Mode
    const [devMode, setDevMode] = useState(false);
    const [devPassword, setDevPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const result = await login(email, password);
        if (result.error) {
            setError(result.error);
        }
    };

    if (currentUser) {
        return (
            <div style={{ padding: 20 }}>
                <h2>✅ Bienvenido, {currentUser.email}</h2>
                <p>Has iniciado sesión exitosamente en la Arquitectura V3.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', padding: 20 }}>
            <h1>🔐 Login V3 Modular</h1>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ padding: 10, cursor: 'pointer', background: '#6161FF', color: 'white', border: 'none', borderRadius: 5 }}>Iniciar Sesión</button>
            </form>

            {error && <p style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</p>}

            {/* DEV MODE PIN SYSTEM */}
            <div style={{ marginTop: 20 }}>
                {!devMode ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input
                            type="password"
                            value={devPassword}
                            onChange={(e) => setDevPassword(e.target.value)}
                            placeholder="PIN"
                            style={{ width: 60, textAlign: 'center', padding: 5, borderRadius: 5, border: '1px solid #ddd' }}
                        />
                        <button
                            onClick={() => devPassword === '1234' && setDevMode(true)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            ⚙️
                        </button>
                    </div>
                ) : (
                    <div style={{ background: '#f0f0f0', padding: 10, borderRadius: 8, marginTop: 10, border: '1px dashed #ccc', width: 300 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>🔐 Modo Desarrollo</span>
                            <button onClick={() => setDevMode(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'red' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <button onClick={() => { setEmail('dafnafinkelstein@gmail.com'); setPassword('TRIBU2026'); }} style={{ textAlign: 'left', padding: 5, background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: 12 }}>👉 Dafna (By Turquía)</button>
                            <button onClick={() => { setEmail('doraluz@terraflorpaisajismo.cl'); setPassword('TRIBU2026'); }} style={{ textAlign: 'left', padding: 5, background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: 12 }}>👉 Doraluz (Terraflor)</button>
                            <button onClick={() => { setEmail('guille@elevatecreativo.com'); setPassword('TRIBU2026'); }} style={{ textAlign: 'left', padding: 5, background: 'white', border: '1px solid #eee', cursor: 'pointer', fontSize: 12 }}>👉 Guillermo (Elevate)</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, textAlign: 'center', fontSize: 10, color: '#999' }}>
                <p>Al iniciar sesión aceptas los <a href="#" style={{ color: '#666' }}>Términos y Condiciones</a></p>
                <p style={{ marginTop: 5 }}>Tribu Impulsa V3 © 2025</p>
            </div>
        </div>
    );
};
