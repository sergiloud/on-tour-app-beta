import React from 'react';
import { LANGUAGES, useI18n } from '../lib/i18n';

interface LanguageSelectorProps {
    className?: string;
    showLabel?: boolean;
}

/**
 * LanguageSelector - Dropdown component for switching languages
 *
 * @example
 * // In Settings page
 * <LanguageSelector showLabel={true} className="w-full" />
 *
 * // In navbar (compact)
 * <LanguageSelector showLabel={false} />
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    className = '',
    showLabel = true
}) => {
    const { lang, setLang, t } = useI18n();

    return (
        <div className={className}>
            {showLabel && (
                <label className="block text-sm font-medium mb-2 opacity-70">
                    {t('common.language')}
                </label>
            )}
            <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-white hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
                {LANGUAGES.map((language) => (
                    <option
                        key={language.code}
                        value={language.code}
                        className="bg-gray-900 text-slate-900 dark:text-white"
                    >
                        {language.flag} {language.nativeName}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * CompactLanguageSelector - Minimal button-style language selector
 * Useful for navigation bars or compact spaces
 */
export const CompactLanguageSelector: React.FC<{ className?: string }> = ({
    className = ''
}) => {
    const { lang, setLang } = useI18n();
    const currentLang = LANGUAGES.find(l => l.code === lang);

    return (
        <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className={`bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-white hover:bg-slate-200 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
            aria-label="Select language"
        >
            {LANGUAGES.map((language) => (
                <option
                    key={language.code}
                    value={language.code}
                    className="bg-gray-900 text-slate-900 dark:text-white"
                >
                    {language.flag} {language.code.toUpperCase()}
                </option>
            ))}
        </select>
    );
};

/**
 * LanguageSelectorMenu - Dropdown menu style selector
 * Good for settings panels or modals
 */
export const LanguageSelectorMenu: React.FC<{ className?: string }> = ({
    className = ''
}) => {
    const { lang, setLang } = useI18n();

    return (
        <div className={`space-y-1 ${className}`}>
            {LANGUAGES.map((language) => (
                <button
                    key={language.code}
                    onClick={() => setLang(language.code)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${lang === language.code
                            ? 'bg-blue-500/20 text-blue-300 font-medium'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-white/70'
                        }`}
                >
                    <span className="mr-2">{language.flag}</span>
                    {language.nativeName}
                    {lang === language.code && (
                        <span className="ml-2 text-xs">✓</span>
                    )}
                </button>
            ))}
        </div>
    );
};
