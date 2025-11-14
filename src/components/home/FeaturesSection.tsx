import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { OptimizedImage, getBlurDataURL } from '../common/OptimizedImage';

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    benefit: string;
    visual?: string;
}

const features: Feature[] = [
    {
        id: 'settlement',
        title: t('features.settlement.title'),
        description: t('features.settlement.description'),
        benefit: t('features.settlement.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=Settlement+Automatico',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'offline',
        title: t('features.offline.title'),
        description: t('features.offline.description'),
        benefit: t('features.offline.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=Offline+First',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-.992 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'ai',
        title: t('features.ai.title'),
        description: t('features.ai.description'),
        benefit: t('features.ai.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=IA+Proactiva',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'esign',
        title: t('features.esign.title'),
        description: t('features.esign.description'),
        benefit: t('features.esign.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=E-Signature',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'inbox',
        title: t('features.inbox.title'),
        description: t('features.inbox.description'),
        benefit: t('features.inbox.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=Inbox+Smart',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
        )
    },
    {
        id: 'travel',
        title: t('features.travel.title'),
        description: t('features.travel.description'),
        benefit: t('features.travel.benefit'),
        visual: 'https://placehold.co/400x300/0f0f23/bfff00?text=Travel+Smart',
        icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
        )
    }
];

export const FeaturesSection: React.FC = () => {
    return (
        <section className="w-full py-24 px-6" id="features">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="section-title mb-6 text-glow">
                        {t('features.title')}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-white/70 max-w-3xl mx-auto">
                        {t('features.subtitle')}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="glass rounded-2xl overflow-hidden hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all duration-300 group cursor-pointer animate-slide-up hover-lift"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Visual Image */}
                            {feature.visual && (
                                <div className="relative h-48 bg-gradient-to-br from-accent-500/20 to-accent-500/5 overflow-hidden">
                                    <OptimizedImage
                                        src={feature.visual}
                                        alt={feature.title}
                                        className="w-full h-full opacity-90 group-hover:scale-110 transition-transform duration-500"
                                        objectFit="cover"
                                        blurDataURL={getBlurDataURL(feature.visual)}
                                        height={192}
                                    />
                                    {/* Icon Overlay */}
                                    <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-ink-900/80 backdrop-blur-sm flex items-center justify-center text-accent-400 border border-accent-500/30">
                                        {feature.icon}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                                {/* Title */}
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-accent-400 transition-colors">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-500 dark:text-white/70 text-sm leading-relaxed mb-4">
                                    {feature.description}
                                </p>

                                {/* Benefit Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20">
                                    <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs font-medium text-accent-300">
                                        {feature.benefit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
                    <Link
                        to="/register"
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        Ver todas las features
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};
