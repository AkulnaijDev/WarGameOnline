import AuthTabs from '../components/AuthTabs'

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl border border-white/10 max-w-md w-full">
                <AuthTabs />
            </div>
        </div>
    )
}
