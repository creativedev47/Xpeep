import { useTheme } from 'context/ThemeContext';

export const Logo = ({ className = 'h-20' }: { className?: string }) => {
    const { theme } = useTheme();

    const logoSrc = theme === 'light' ? '/logo-black.png' : '/logo-white.png';

    return (
        <img
            src={logoSrc}
            alt="Xpeep Logo"
            className={`w-auto object-contain ${className}`}
        />
    );
};
