import { useEffect, useState, useRef } from "react";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Sun, Moon, CreditCard, Brain, MessageCircle } from "lucide-react";
import useLogin from "../../../hooks/useLogin";
import { userStore } from "../../../state/global";
import { useNavigate } from "react-router-dom";
import useGlobalSearch, { type GlobalSearchResult } from "../../../hooks/useGlobalSearch";
import CategoryDropdown from "../../lazy/CategoryDropdown";
import { getDefaultRouteForRole } from "../../../routes";
import { modernMedia } from "../../../assets/modernMedia";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isDark, setIsDark] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const { isLoading, isLogedIn } = useLogin();
  const navigate = useNavigate();
  const {
    results,
    isLoading: isSearchLoading,
    debouncedSearch,
  } = useGlobalSearch();

  const user = userStore((state) => state.user);
  const dashboardPath = getDefaultRouteForRole(user?.role);
  const profileImage = user?.profilePhoto;
  const profileInitial = user?.name?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the ref exists and the click is inside, it's NOT outside. 
      // If the ref doesn't exist, it can't be 'inside', so it's 'outside' by default.
      const isInsideDesktop = searchRef.current && searchRef.current.contains(event.target as Node);
      const isInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target as Node);
      
      if (!isInsideDesktop && !isInsideMobile) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim()) {
      setIsSearchOpen(true);
      debouncedSearch(value);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (item: GlobalSearchResult) => {
    if (item.courseId) {
      navigate(`/public/course/${item.courseId}`);
    } else if (item.type === 'course') {
        navigate(`/public/course/${item.id}`);
    }
    setSearchInput("");
    setIsSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 overflow-visible px-2 pt-2">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 overflow-visible">
        <div className="theme-glass border border-[var(--border)]/70 rounded-[calc(var(--radius)+14px)] flex justify-between items-center h-16 min-w-0 overflow-visible px-3">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div
              className="h-11 w-[130px] sm:w-[152px] cursor-pointer hover:scale-105 transition-transform duration-200 rounded-xl overflow-hidden border border-[var(--border)]/70 bg-[var(--card)] px-1"
              onClick={() => navigate("/")}
            >
              <img
                src={modernMedia.logo}
                alt="Learnify logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 flex-shrink min-w-0 overflow-visible">
            {/* Search Bar */}
            {/* Global Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${isSearchLoading ? 'text-[var(--primary)] animate-pulse' : 'text-[var(--muted-foreground)]'}`} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onFocus={() => searchInput && setIsSearchOpen(true)}
                className="block w-48 xl:w-80 2xl:w-96 pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-[calc(var(--radius)+7px)] bg-[var(--input)]/90 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 focus:border-[var(--primary)] transition-all duration-300 hover:border-[var(--primary)]/50"
                placeholder="Search courses, modules, and lessons..."
              />

              {/* Enhanced Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 mt-3 w-[500px] theme-card rounded-[calc(var(--radius)+12px)] z-50 max-h-[80vh] overflow-hidden animate-fade-up duration-200">
                  {isSearchLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center space-x-3 bg-[var(--muted)]/30 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-0"></div>
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce delay-300"></div>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-foreground)] font-medium">Searching everywhere...</p>
                    </div>
                  ) : (
                    <div className="max-h-[70vh] overflow-y-auto scrollbar-sm">
                      {/* Courses Section */}
                      {results.courses.length > 0 && (
                        <div className="p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Courses
                          </h4>
                          {results.courses.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                                  <Brain className="w-6 h-6" />
                                </div>
                              )}
                              <div className="flex-grow min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                                  {item.parentInfo || "Course"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skill Categories Section */}
                      {results.skillCategories && results.skillCategories.length > 0 && (
                        <div className="border-t border-[var(--border)] p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Modules
                          </h4>
                          {results.skillCategories.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]">Module</div>
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 flex items-center gap-1">
                                <span className="opacity-70">in</span> {item.courseName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Modules Section */}
                      {results.modules.length > 0 && (
                        <div className="border-t border-[var(--border)] p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            Modules
                          </h4>
                          {results.modules.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]">Module</div>
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 flex items-center gap-1">
                                <span className="opacity-70">in</span> {item.courseName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Expertise Section */}
                      {results.expertise.length > 0 && (
                         <div className="border-t border-[var(--border)] p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Domains
                          </h4>
                          {results.expertise.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]">Domain</div>
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 flex items-center gap-1">
                                <span className="opacity-70">in</span> {item.courseName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chapters Section */}
                      {results.chapters.length > 0 && (
                        <div className="border-t border-[var(--border)] p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Chapters
                          </h4>
                          {results.chapters.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]">Chapter</div>
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 flex items-center gap-1">
                                <span className="opacity-70">in</span> {item.courseName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lessons Section */}
                      {results.lessons.length > 0 && (
                        <div className="border-t border-[var(--border)] p-2">
                          <h4 className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                            Lessons
                          </h4>
                          {results.lessons.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleResultClick(item)}
                              className="group p-3 rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <div className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]">Lesson</div>
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 flex items-center gap-1">
                                <span className="opacity-70">in</span> {item.courseName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {results.courses.length === 0 &&
                       (!results.skillCategories || results.skillCategories.length === 0) &&
                       results.modules.length === 0 &&
                       results.expertise.length === 0 &&
                       results.chapters.length === 0 &&
                       results.lessons.length === 0 &&
                       searchInput && searchInput.trim().length >= 2 && (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
                          </div>
                          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">No matches found</h3>
                          <p className="text-xs text-[var(--muted-foreground)] max-w-[200px] mx-auto">
                            Try different keywords or check the spelling
                          </p>
                        </div>
                      )}
                      {/* Minimum characters hint */}
                      {searchInput && searchInput.trim().length < 2 && searchInput.trim().length > 0 && (
                        <div className="p-8 text-center">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Type at least 2 characters to search
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <CategoryDropdown />

            {/* Quizzes Link */}
            <button
              onClick={() => navigate("/quizzes/explore")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[calc(var(--radius)+6px)] text-sm font-medium transition-all duration-300 text-[var(--foreground)] hover:bg-[var(--muted)]/55 group"
            >
              <Brain className="h-4 w-4 text-[var(--primary)] transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-[var(--foreground)]">Quizzes</span>
            </button>

            {/* Pricing Link */}
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2.5 rounded-[calc(var(--radius)+6px)] text-sm font-medium transition-all duration-300 text-[var(--foreground)] hover:bg-[var(--muted)]/55"
            >
              <CreditCard className="h-4 w-4 text-[var(--primary)] transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-[var(--foreground)]">Pricing</span>
            </a>

            {/* Corporate Link */}
            <button
              onClick={() => navigate("/corporate")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[calc(var(--radius)+6px)] text-sm font-medium transition-all duration-300 text-[var(--foreground)] hover:bg-[var(--muted)]/55"
            >
              <MessageCircle className="h-4 w-4 text-[var(--primary)] transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-[var(--foreground)]">Corporate</span>
            </button>
          </div>

          {/* Right Section - Theme & Auth */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-[calc(var(--radius)+6px)] theme-panel hover:bg-[var(--muted)]/80 transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[var(--foreground)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--foreground)]" />
              )}
            </button>

            {!isLoading && !isLogedIn && (
              <div className="flex items-center space-x-2 pl-2 border-l border-[var(--border)]">
                <button
                  className="px-4 py-2 rounded-[calc(var(--radius)+6px)] text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/55 transition-all duration-300 whitespace-nowrap"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="theme-btn px-5 py-2 rounded-xl text-sm whitespace-nowrap"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </div>
            )}

            {!isLoading && isLogedIn && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-[calc(var(--radius)+8px)] theme-panel hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/75 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--muted)] flex items-center justify-center text-sm font-semibold text-[var(--foreground)]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user?.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileInitial
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Welcome back
                  </div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    Go to Dashboard
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[calc(var(--radius)+5px)] theme-panel hover:bg-[var(--muted)]/80 transition-all duration-300"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[var(--foreground)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--foreground)]" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-[calc(var(--radius)+5px)] text-[var(--foreground)] hover:bg-[var(--muted)]/75 transition-all duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden mt-2 theme-card border border-[var(--border)]/70 animate-fade-up duration-200 rounded-[calc(var(--radius)+12px)]">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {/* Mobile Search */}
            <div className="relative mb-3 mx-2" ref={mobileSearchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onFocus={() => searchInput && setIsSearchOpen(true)}
                className="block w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--input)]/90 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 transition-all duration-300"
                placeholder="Search courses..."
              />

              {/* Mobile Search Results */}
                  {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)] z-50 max-h-64 overflow-y-auto">
                  {isSearchLoading && (
                    <div className="p-4 text-center text-sm text-[var(--muted-foreground)]">
                      Searching...
                    </div>
                  )}

                  {!isSearchLoading && (
                    <div>
                      {/* Courses */}
                      {results.courses.length > 0 && (
                        <div className="p-2">
                           <h4 className="px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Courses</h4>
                           {results.courses.map((item) => (
                             <div
                               key={item.id}
                               onClick={() => handleResultClick(item)}
                               className="flex items-center gap-2 p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                             >
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</h3>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}

                       {/* Skill Categories (Modules) on Mobile */}
                       {results.skillCategories && results.skillCategories.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                           <h4 className="px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Modules</h4>
                           {results.skillCategories.map((item) => (
                             <div
                               key={item.id}
                               onClick={() => handleResultClick(item)}
                               className="p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                             >
                                <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</h3>
                                <p className="text-[10px] text-[var(--muted-foreground)]">in {item.courseName}</p>
                             </div>
                           ))}
                        </div>
                      )}

                       {/* Modules */}
                       {results.modules.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                           <h4 className="px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Expertise</h4>
                           {results.modules.map((item) => (
                             <div
                               key={item.id}
                               onClick={() => handleResultClick(item)}
                               className="p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                             >
                                <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</h3>
                                <p className="text-[10px] text-[var(--muted-foreground)]">in {item.courseName}</p>
                             </div>
                           ))}
                        </div>
                      )}

                      {/* Chapters */}
                      {results.chapters.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                           <h4 className="px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Chapters</h4>
                           {results.chapters.map((item) => (
                             <div
                               key={item.id}
                               onClick={() => handleResultClick(item)}
                               className="p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                             >
                                <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</h3>
                                <p className="text-[10px] text-[var(--muted-foreground)]">in {item.courseName}</p>
                             </div>
                           ))}
                        </div>
                      )}

                       {/* Lessons */}
                       {results.lessons.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                           <h4 className="px-2 py-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Lessons</h4>
                           {results.lessons.map((item) => (
                             <div
                               key={item.id}
                               onClick={() => handleResultClick(item)}
                               className="p-2 rounded hover:bg-[var(--muted)] cursor-pointer"
                             >
                                <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{item.title}</h3>
                                <p className="text-[10px] text-[var(--muted-foreground)]">in {item.courseName}</p>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!isSearchLoading && 
                   results.courses.length === 0 &&
                   (!results.skillCategories || results.skillCategories.length === 0) &&
                   results.modules.length === 0 &&
                   results.chapters.length === 0 &&
                   results.lessons.length === 0 &&
                   searchInput && searchInput.trim().length >= 2 && (
                    <div className="p-4 text-center text-sm text-[var(--muted-foreground)]">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <a
              href="#"
              className="block px-3 py-2 rounded-lg text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 transition-all duration-300"
            >
              Brand
            </a>

            <a
              href="#"
              className="block px-3 py-2 rounded-lg text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 transition-all duration-300"
            >
              Pricing
            </a>

            <button
              onClick={() => {
                navigate("/corporate");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 transition-all duration-300"
            >
              Corporate
            </button>

            <div className="border-t border-[var(--border)] pt-3 mt-3">
              {!isLoading && !isLogedIn ? (
                <>
                  <button
                    className="w-full px-3 py-2 rounded-lg text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 transition-all duration-300 mb-2"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                    className="w-full theme-btn text-base"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate(dashboardPath);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--muted)] flex items-center justify-center text-sm font-semibold text-[var(--foreground)]">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={user?.name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileInitial
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span>Go to Dashboard</span>
                    <span className="text-xs text-[var(--muted-foreground)] capitalize">
                      {user?.role?.toLowerCase() || "user"}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
