
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { CatalogScreen } from '../screens/app/CatalogScreen';
import { ActivityScreen } from '../screens/app/ActivityScreen';
import { AcademiaScreen } from '../screens/app/AcademiaScreen';
import { BenefitsScreen } from '../screens/app/BenefitsScreen';
import { ChecklistScreen } from '../screens/app/ChecklistScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { MainLayout } from '../components/layout/MainLayout';
import { WhatsAppFloat } from '../components/ui/WhatsAppFloat';
import { SurveyScreen } from '../screens/auth/SurveyScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PaymentScreen } from '../screens/app/PaymentScreen';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center text-white">Starting V3...</div>;
    return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <div></div>;
    return !currentUser ? <>{children}</> : <Navigate to="/" />;
};


// Wrapper specifically to inject global floating elements like WhatsApp
const MainLayoutWrapper: React.FC = () => {
    // Inject WhatsApp logic here
    return (
        <>
            <MainLayout />
            <WhatsAppFloat />
        </>
    );
};

const ProtectedLayout: React.FC = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = React.useState<any>(null);
    const [checking, setChecking] = React.useState(true);

    React.useEffect(() => {
        const check = async () => {
            if (currentUser?.email) {
                const { UserService } = await import('../services/api/users');
                const user = await UserService.getUserByEmail(currentUser.email);
                setProfile(user);
            }
            setChecking(false);
        };
        check();
    }, [currentUser]);

    if (checking) return <div className="p-10 text-white text-center">Verificando perfil...</div>;

    // Si no ha completado encuesta, forzar desvío
    if (profile && !profile.surveyCompleted) {
        return <Navigate to="/survey" replace />;
    }

    // Si la membresía expiró
    if (profile && profile.status === 'expired') {
        return <Navigate to="/payment" replace />;
    }

    return <MainLayoutWrapper />;
};

export const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginScreen />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterScreen />
                    </PublicRoute>
                } />

                {/* Protected Survey Route (No check for completion to avoid loop) */}
                <Route path="/survey" element={
                    <PrivateRoute>
                        <SurveyScreen />
                    </PrivateRoute>
                } />

                {/* Protected Payment Route */}
                <Route path="/payment" element={
                    <PrivateRoute>
                        <PaymentScreen />
                    </PrivateRoute>
                } />

                {/* Main App Routes (Wrapped in ProtectedLayout) */}
                <Route path="/" element={
                    <PrivateRoute>
                        <ProtectedLayout />
                    </PrivateRoute>
                }>
                    <Route index element={<DashboardScreen />} />
                    <Route path="profile" element={<ProfileScreen />} />
                    <Route path="catalog" element={<CatalogScreen />} />
                    <Route path="academy" element={<AcademiaScreen />} />
                    <Route path="benefits" element={<BenefitsScreen />} />
                    <Route path="activity" element={<ActivityScreen />} />
                    <Route path="checklist" element={<ChecklistScreen />} />
                </Route>

                {/* Admin Route */}
                <Route path="/admin" element={<AdminScreen />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};
