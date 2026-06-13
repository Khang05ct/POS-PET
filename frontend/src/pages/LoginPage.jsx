import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShoppingCart, Package, Headphones, Mail, Lock, ArrowRight, PawPrint } from 'lucide-react';
import bgImage from '../assets/login-bg.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-[#F4F7F6] font-sans">
      {/* 1. Background Image Container */}
      <div className="absolute inset-0 w-full lg:w-[60%] h-full z-0">
        <img src={bgImage} alt="Pets Background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/40 lg:bg-transparent"></div> {/* Darken on mobile for form readability */}
      </div>

      {/* 2. Complex Background Shapes (Hidden on Mobile) */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        
        {/* Right White Sweeping Curve Overlay */}
        <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="absolute right-0 top-0 w-[60%] h-full text-[#F4F7F6]" fill="currentColor">
          <path d="M50 0 L100 0 L100 100 L20 100 C60 60, 10 40, 50 0 Z" />
        </svg>

        {/* Bottom Left Dark Green Wave */}
        <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="absolute left-0 bottom-0 w-[55%] h-[35%]" fill="#1C7D54">
          <path d="M0 50 C30 80, 70 20, 100 70 L100 100 L0 100 Z" />
        </svg>

        {/* Gold Sweeping Line */}
        <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="absolute left-0 bottom-0 w-[70%] h-[40%]" fill="none" stroke="#D5B86A" strokeWidth="0.4" opacity="0.8">
          <path d="M0 50 C30 80, 70 10, 100 60" />
        </svg>

        {/* Right side abstract green blobs and decorations */}
        <div className="absolute -right-32 top-1/4 w-[40rem] h-[40rem] bg-[#229A62] rounded-full blur-[100px] opacity-10"></div>
        <div className="absolute -right-20 -bottom-20 w-[35rem] h-[35rem] bg-[#1C7D54] rounded-full opacity-90 blur-[2px]"></div>
        <div className="absolute right-20 top-10 w-[25rem] h-[25rem] bg-[#E5F3EC] rounded-full blur-[80px] opacity-60"></div>
        
        {/* Top Right Dots */}
        <div className="absolute right-16 top-12 grid grid-cols-5 gap-2.5 opacity-20">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          ))}
        </div>

        {/* Paw Print Watermark */}
        <div className="absolute right-12 top-24 opacity-[0.03] text-[#1C7D54] transform rotate-12">
          <PawPrint size={300} />
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT COLUMN: Feature Cards & Bottom Branding */}
        <div className="hidden lg:flex w-[55%] flex-col justify-between pt-24 pb-12 pl-12 xl:pl-20">
          
          {/* Floating Feature Cards */}
          <div className="space-y-4">
            {/* Card 1 */}
            <div className="bg-white/95 rounded-[20px] p-4 flex items-center gap-4 w-[290px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md border border-white/50">
              <div className="w-12 h-12 rounded-full border-2 border-[#E5F3EC] flex items-center justify-center text-[#1C7D54] bg-[#F2FAF6] flex-shrink-0">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-[14px]">Bảo mật cao</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Dữ liệu được mã hóa<br/>và bảo vệ tuyệt đối</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/95 rounded-[20px] p-4 flex items-center gap-4 w-[290px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md border border-white/50">
              <div className="w-12 h-12 rounded-full border-2 border-[#E5F3EC] flex items-center justify-center text-[#1C7D54] bg-[#F2FAF6] flex-shrink-0">
                <ShoppingCart size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-[14px]">Quản lý bán hàng</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Tối ưu quy trình<br/>bán hàng & thanh toán</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/95 rounded-[20px] p-4 flex items-center gap-4 w-[290px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md border border-white/50">
              <div className="w-12 h-12 rounded-full border-2 border-[#E5F3EC] flex items-center justify-center text-[#1C7D54] bg-[#F2FAF6] flex-shrink-0">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-[14px]">Theo dõi tồn kho</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Cập nhật tồn kho<br/>chính xác theo thời gian thực</p>
              </div>
            </div>
          </div>

          {/* Bottom Branding Logo */}
          <div className="flex items-center gap-4 text-white pl-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shadow-inner border border-white/20 backdrop-blur-sm">
               <PawPrint size={28} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-[20px] tracking-wide leading-tight">PetCare POS</h2>
              <p className="text-[12px] text-emerald-50 mt-0.5 opacity-90 font-medium">Giải pháp quản lý toàn diện cho cửa hàng thú cưng</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Login Card */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 xl:pr-24 z-20">
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] w-full max-w-[420px] p-10 relative overflow-hidden border border-gray-50">
            
            {/* Logo in Form */}
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-[#1C7D54] rounded-full flex items-center justify-center text-white shadow-sm">
                <PawPrint size={24} fill="currentColor" />
              </div>
              <span className="text-[24px] font-extrabold text-[#1C7D54]">PetCare POS</span>
            </div>

            {/* Header Text */}
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Chào mừng trở lại</h1>
              <h2 className="text-[15px] font-bold text-[#1C7D54] mt-2">Đăng nhập vào PetCare POS</h2>
              <p className="text-gray-500 text-[13px] mt-1.5 font-medium">Hệ thống quản lý cửa hàng thú cưng chuyên nghiệp</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center font-medium">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-gray-700">Địa chỉ Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-[14px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C7D54]/20 focus:border-[#1C7D54] transition-colors"
                    placeholder="admin@petcare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[12px] font-bold text-gray-700">Mật khẩu</label>
                  <a href="#" className="text-[11px] font-bold text-[#1C7D54] hover:text-[#146140] transition-colors">Quên mật khẩu?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#FAFAFA] border border-gray-200 rounded-[14px] text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C7D54]/20 focus:border-[#1C7D54] transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1 pb-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#1C7D54] focus:ring-[#1C7D54] border-gray-300 rounded cursor-pointer accent-[#1C7D54]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2.5 block text-[12px] font-semibold text-gray-600 cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-4 px-4 rounded-[14px] text-[15px] font-bold text-white bg-[#229A62] hover:bg-[#1C7D54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C7D54] transition-all shadow-[0_8px_20px_rgba(34,154,98,0.25)] mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-[1px] bg-gray-100"></div>
              <span className="relative bg-white px-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">hoặc</span>
            </div>

            {/* Support Link */}
            <div className="mt-6 flex justify-center">
              <a href="#" className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:text-[#1C7D54] transition-colors">
                <Headphones size={16} className="text-[#1C7D54]" strokeWidth={2.5} />
                <span>Cần hỗ trợ? <span className="text-[#1C7D54]">Liên hệ với chúng tôi</span></span>
              </a>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
