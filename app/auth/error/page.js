export default function AuthErrorPage() {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-200 p-8 rounded-lg shadow-lg">
          <h1>Auth Error</h1>
          <p>Error logging in. Check your credential again.</p>
        </div>
      </div>
    );
  }
  