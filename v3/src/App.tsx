import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './navigation/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
