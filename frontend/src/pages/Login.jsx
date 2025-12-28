import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function Login() {
  const navigate = useNavigate();

  const handleAuthSuccess = (response) => {
    console.log('Login successful, navigating to home...');
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <AuthForm 
        initialMode="login" 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default Login; 