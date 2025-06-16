import AuthTabs from '../components/AuthTabs'

export default function AuthPage() {
  return (
   
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-login.jpg')] bg-cover bg-center">
      
      
      <div className="backdrop-blur-sm bg-white/70 p-6 rounded-xl shadow-xl">
        <AuthTabs />
      </div>
    </div>
  )
}
