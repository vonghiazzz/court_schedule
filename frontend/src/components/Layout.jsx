// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ZaloSupportWidget from './ZaloSupportWidget';

const getInitials = (name) => {
    if (!name) return "JD";
    const cleanName = name.replace(/@.*/, ''); // remove domain if email
    const parts = cleanName.trim().split(/[\s._-]+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
};

export default function Layout({ children, judgeName, onLogout, onChangePassword }) {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-background text-on-surface flex font-body-md relative overflow-x-hidden">
            
            {/* Mobile Frosted Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden transition-all duration-300"
                ></div>
            )}

            {/* Premium Sidebar Layout */}
            <aside className={`bg-judicial-navy h-screen fixed top-0 left-0 flex flex-col z-50 overflow-y-auto transition-all duration-300 ${
                sidebarOpen 
                    ? "w-64 p-4 border-r border-outline-variant translate-x-0 opacity-100 visible" 
                    : "w-64 -translate-x-full p-4 border-r border-outline-variant invisible opacity-0 md:w-0 md:p-0 md:border-none md:overflow-hidden md:opacity-0 md:invisible"
            }`}>
                
                {/* Sidebar Header / Logo */}
                <div className="mb-8 px-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm border border-slate-200/50">
                            <img 
                                alt="Vietnam Court Administration Logo" 
                                className="w-8 h-8 object-contain" 
                                src="/images/logoToaAn.jpg" 
                                onError={(e) => { e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBz_0sZJeQb0rTyfy4GK3u27JtAt0kqYDCFrxdOOr7Lg5PsjwSNSgQFeARptd9BzQ_cXUZmrisTIPVquU7zIe-XODa0oNCPCC93kXP9vMoMUyXveoLhlAcEpTbN3hQlXwLHUsNYaTQBxCpJI3qWONa9XY_07kLi40npERhS5XtuA9sGiPdRtSwbkq4-X3Q_J4BNy9Pn3ShYkpdStsARVNmQ1o9gB4RKU8d9tsKQ9uwVLfgo6naw5I2a"; }} 
                            />
                        </div>
                        <div>
                            <h1 className="font-headline-md text-[15px] font-extrabold text-white leading-tight m-0">Hệ thống xét xử</h1>
                            <p className="text-[9px] text-on-primary-container/70 uppercase tracking-widest font-semibold m-0">Tòa án Nhân dân</p>
                        </div>
                    </div>
                    {/* Close button for mobile screen drawer */}
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer flex items-center transition-colors"
                        title="Đóng menu"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                
                {/* Localized navigation with custom styles & micro-interactions */}
                <nav className="flex-1 space-y-1">
                    <Link 
                        to="/tong-quan"
                        className={`w-full flex items-center gap-4 px-3 py-2.5 transition-all duration-200 cursor-pointer text-left rounded-lg border-none no-underline ${
                            currentPath === '/tong-quan'
                                ? "text-white bg-white/10 border-l-4 border-l-gavel-gold border-t-0 border-r-0 border-b-0 font-bold"
                                : "text-on-primary-container/85 hover:text-white hover:bg-white/5 hover:translate-x-1"
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${currentPath === '/tong-quan' ? 'text-gavel-gold' : ''}`}>dashboard</span>
                        <span className="font-body-md text-sm font-medium">Tổng quan</span>
                    </Link>
                    <Link 
                        to="/thong-ke-phien-xu"
                        className={`w-full flex items-center gap-4 px-3 py-2.5 transition-all duration-200 cursor-pointer text-left rounded-lg border-none no-underline ${
                            currentPath === '/thong-ke-phien-xu'
                                ? "text-white bg-white/10 border-l-4 border-l-gavel-gold border-t-0 border-r-0 border-b-0 font-bold"
                                : "text-on-primary-container/85 hover:text-white hover:bg-white/5 hover:translate-x-1"
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${currentPath === '/thong-ke-phien-xu' ? 'text-gavel-gold' : ''}`}>analytics</span>
                        <span className="font-body-md text-sm font-medium">Thống kê phiên xử</span>
                    </Link>
                    <Link 
                        to="/lich-tham-phan"
                        className={`w-full flex items-center gap-4 px-3 py-2.5 transition-all duration-200 cursor-pointer text-left rounded-lg border-none no-underline ${
                            currentPath === '/lich-tham-phan'
                                ? "text-white bg-white/10 border-l-4 border-l-gavel-gold border-t-0 border-r-0 border-b-0 font-bold"
                                : "text-on-primary-container/85 hover:text-white hover:bg-white/5 hover:translate-x-1"
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${currentPath === '/lich-tham-phan' ? 'text-gavel-gold' : ''}`}>calendar_month</span>
                        <span className="font-body-md text-sm font-medium">Lịch xét xử</span>
                    </Link>
                    <Link 
                        to="/quan-ly-phien-toa"
                        className={`w-full flex items-center gap-4 px-3 py-2.5 transition-all duration-200 cursor-pointer text-left rounded-lg border-none no-underline ${
                            currentPath === '/quan-ly-phien-toa'
                                ? "text-white bg-white/10 border-l-4 border-l-gavel-gold border-t-0 border-r-0 border-b-0 font-bold"
                                : "text-on-primary-container/85 hover:text-white hover:bg-white/5 hover:translate-x-1"
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${currentPath === '/quan-ly-phien-toa' ? 'text-gavel-gold' : ''}`}>gavel</span>
                        <span className="font-body-md text-sm font-medium">Quản lý phiên tòa</span>
                    </Link>
                </nav>
                
                {/* Admin Contact Block in Sidebar */}
                <div className="mx-1 my-3 p-3 bg-white/10 rounded-xl border border-white/15 text-white/90">
                    <div className="flex items-center gap-2 text-gavel-gold font-bold text-xs">
                        <span className="material-symbols-outlined text-[16px]">support_agent</span>
                        Quản lý Web: Nghĩa
                    </div>
                    <p className="text-[11px] text-on-primary-container/80 mt-1 mb-2 leading-tight">
                        Gửi mọi yêu cầu & hỗ trợ qua Zalo
                    </p>
                    <a 
                        href="https://zalo.me/0582030018" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-gavel-gold hover:bg-yellow-600 text-judicial-navy font-bold text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 no-underline transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        Zalo: 0582030018
                    </a>
                </div>

                {/* Bottom User Operations Section */}
                <div className="mt-auto pt-3 border-t border-on-primary-container/10 space-y-1">
                    <div 
                        onClick={onChangePassword}
                        className="text-on-primary-container/80 hover:text-on-primary px-4 py-2 cursor-pointer flex items-center gap-3 hover:bg-white/5 hover:translate-x-1 transition-all duration-200 rounded-lg text-sm"
                        title="Cấu hình tài khoản"
                    >
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Cấu hình tài khoản</span>
                    </div>
                    <div 
                        onClick={onLogout}
                        className="text-red-300 hover:text-red-100 px-4 py-2 cursor-pointer flex items-center gap-3 hover:bg-red-500/10 hover:translate-x-1 transition-all duration-200 rounded-lg text-sm font-semibold"
                        title="Đăng xuất khỏi hệ thống"
                    >
                        <span className="material-symbols-outlined text-[20px] text-red-300">logout</span>
                        <span>Đăng xuất</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`min-h-screen flex flex-col flex-1 relative transition-all duration-300 ${
                sidebarOpen ? "md:pl-64" : "md:pl-0"
            }`}>
                
                {/* Header (TopNavBar) */}
                <header className="bg-surface-container-lowest flex justify-between items-center w-full h-16 px-4 md:px-10 border-b border-seal-silver shadow-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {/* Hamburger menu button to toggle sidebar */}
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-judicial-navy border-none bg-transparent cursor-pointer flex items-center transition-colors"
                            title="Đóng / Mở menu điều hướng"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-6">
                            <span className="font-title-lg text-title-lg text-judicial-navy font-bold">Hệ thống xét xử</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-outline">
                            <a 
                                href="https://zalo.me/0582030018"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-semibold text-xs no-underline border border-blue-200 transition-colors"
                                title="Liên hệ Zalo Quản lý: Nghĩa (0582030018)"
                            >
                                <span className="material-symbols-outlined text-[16px] text-blue-600">chat</span>
                                Zalo: 0582030018 (Nghĩa)
                            </a>
                            <button className="material-symbols-outlined hover:text-judicial-navy border-none bg-transparent cursor-pointer" title="Tìm kiếm">search</button>
                            <button className="material-symbols-outlined hover:text-judicial-navy border-none bg-transparent cursor-pointer" title="Thông báo">notifications</button>
                            <button className="material-symbols-outlined hover:text-judicial-navy border-none bg-transparent cursor-pointer" title="Lịch sử">history</button>
                        </div>
                        <div className="h-8 w-px bg-seal-silver"></div>
                        
                        {/* User profile with dropdown */}
                        <div className="relative">
                            <div 
                                className="flex items-center gap-3 cursor-pointer select-none"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            >
                                <span className="hidden sm:inline text-sm font-semibold text-judicial-navy">{judgeName}</span>
                                <div className="w-8 h-8 rounded-full bg-gavel-gold flex items-center justify-center text-judicial-navy font-bold text-xs shadow-sm ring-2 ring-gavel-gold/25">
                                    {getInitials(judgeName)}
                                </div>
                            </div>
                            
                            {profileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-seal-silver rounded-lg shadow-lg py-1 z-20">
                                        <a 
                                            href="https://zalo.me/0582030018"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 no-underline font-semibold"
                                        >
                                            <span className="material-symbols-outlined text-sm text-blue-600">support_agent</span>
                                            Hỗ trợ Zalo: 0582030018
                                        </a>
                                        <button 
                                            onClick={() => { setProfileDropdownOpen(false); onChangePassword(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">lock</span>
                                            Đổi mật khẩu
                                        </button>
                                        <button 
                                            onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100 border-x-0 border-b-0 bg-transparent cursor-pointer font-medium"
                                        >
                                            <span className="material-symbols-outlined text-sm text-red-600">logout</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Shell */}
                <div className="flex-1 flex flex-col">
                    {children}
                </div>

                {/* Footer Branding */}
                <footer className="mt-auto py-6 px-4 md:px-10 bg-surface-container-low border-t border-seal-silver">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-judicial-navy rounded flex items-center justify-center text-on-primary">
                                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                                </div>
                                <span className="text-caption font-bold text-judicial-navy">TÒA ÁN NHÂN DÂN TỐI CAO VIỆT NAM © 2026</span>
                            </div>
                            <span className="hidden md:inline text-gray-300">|</span>
                            <div className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap justify-center">
                                <span>Quản lý web: <strong className="text-judicial-navy font-bold">Nghĩa</strong></span>
                                <span>•</span>
                                <span>Zalo hỗ trợ & nhận yêu cầu: <a href="https://zalo.me/0582030018" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">0582030018</a></span>
                            </div>
                        </div>
                        <div className="flex gap-6 text-caption text-outline">
                            <a className="hover:text-judicial-navy transition-colors no-underline" href="#terms">Điều khoản sử dụng</a>
                            <a className="hover:text-judicial-navy transition-colors" href="#privacy">Chính sách bảo mật</a>
                            <a className="hover:text-judicial-navy transition-colors" href="https://zalo.me/0582030018" target="_blank" rel="noopener noreferrer">Gửi yêu cầu hỗ trợ</a>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Global Zalo Floating Widget */}
            <ZaloSupportWidget />
        </div>
    );
}

