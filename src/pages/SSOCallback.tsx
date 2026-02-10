import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const SSOCallback = () => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: '#fcf9fe' }}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-serif text-2xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)',
          }}
        >
          M
        </div>
        <p style={{ color: '#8a7a85', fontSize: '15px' }}>
          Signing you in...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
};

export default SSOCallback;
