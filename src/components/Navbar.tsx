'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: '대시보드', href: '/dashboard' },
    { name: '검색광고', href: '/search-ads' },
    { name: '쇼핑광고', href: '/shopping-ads' },
    { 
      name: '배너광고', 
      href: '/banner-ads',
      hasDropdown: true,
      dropdownItems: [
        { name: '매체 결과 데이터', href: '/banner-ads/media-results' },
        { name: 'AI 배너광고', href: '/banner-ads/ai-banner' }
      ]
    },
    { name: '영상광고', href: '/video-ads' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* 서비스 제목 - 완전 좌측 정렬 */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              AI 배너
            </Link>
          </div>

          {/* 페이지 목록 - 중앙 영역, 균등 분할 */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative" ref={item.hasDropdown ? dropdownRef : undefined}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200 whitespace-nowrap min-w-[120px] justify-center"
                      >
                        {item.name}
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-center whitespace-nowrap"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200 whitespace-nowrap min-w-[120px] flex justify-center"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 유저 접속정보 - 완전 우측 정렬 */}
          <div className="flex items-center flex-shrink-0" ref={userDropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                계정
                <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => {
                      // 계정 정보 로직
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    계정 정보
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => {
                      // 로그아웃 로직
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
                  >
                    {item.name}
                    <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="pl-4 space-y-1">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}