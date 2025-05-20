import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UserCircle, Shield } from 'lucide-react';

interface UserOption {
  id: string;
  name: string;
  role: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');

  const userOptions: UserOption[] = mockUsers.map(user => ({
    id: user.id,
    name: user.name,
    role: user.role.replace('_', ' ')
  }));

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser);
      navigate('/');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} className="text-red-500" />;
      case 'base commander':
        return <Shield size={16} className="text-olive-500" />;
      case 'logistics officer':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <UserCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <Shield size={48} className="text-navy-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-navy-800">Military Asset Management</h1>
          <p className="text-gray-600 mt-2">Sign in to access the system</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <div className="space-y-2">
            {userOptions.map((user) => (
              <label 
                key={user.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedUser === user.id 
                    ? 'border-navy-500 bg-navy-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="user"
                  value={user.id}
                  checked={selectedUser === user.id}
                  onChange={() => setSelectedUser(user.id)}
                  className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300"
                />
                <div className="ml-3 flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleLogin}
          disabled={!selectedUser}
        >
          Sign In
        </Button>
      </Card>
    </div>
  );
};

export default Login;