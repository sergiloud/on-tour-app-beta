/**
 * App Shell Skeleton
 *
 * Top-level skeleton shown during initial app load
 */

import React from 'react';

export const AppShellSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <div className="border-b border-border animate-pulse">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="h-8 w-32 bg-muted rounded" />

                    {/* Navigation */}
                    <div className="hidden md:flex space-x-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 w-20 bg-muted rounded" />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="h-9 w-9 bg-muted rounded-full" />
                        <div className="h-9 w-24 bg-muted rounded" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="space-y-6">
                    {/* Page Title */}
                    <div className="h-8 w-64 bg-muted rounded" />

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-muted rounded-lg" />
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="h-96 bg-muted rounded-lg" />
                </div>
            </div>
        </div>
    );
};

/**
 * Dashboard Skeleton
 *
 * Skeleton for main dashboard page
 */
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-4 w-64 bg-muted rounded" />
                </div>
                <div className="h-10 w-32 bg-muted rounded" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-10 w-32 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                </div>
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="h-6 w-40 bg-muted rounded" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-full bg-muted rounded" />
                                <div className="h-3 w-2/3 bg-muted rounded" />
                            </div>
                            <div className="h-4 w-16 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Finance Skeleton
 *
 * Skeleton for finance page
 */
export const FinanceSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="flex space-x-3">
                    <div className="h-10 w-32 bg-muted rounded" />
                    <div className="h-10 w-32 bg-muted rounded" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-8 w-8 bg-muted rounded" />
                        </div>
                        <div className="h-12 w-full bg-muted rounded" />
                        <div className="h-16 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* Main Chart */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-8 w-16 bg-muted rounded" />
                        ))}
                    </div>
                </div>
                <div className="h-80 bg-muted rounded" />
            </div>

            {/* Transactions Table */}
            <div className="bg-card border border-border rounded-lg">
                <div className="p-6 border-b border-border">
                    <div className="h-6 w-40 bg-muted rounded" />
                </div>
                <div className="p-6 space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-muted rounded flex-shrink-0" />
                            <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Shows Skeleton
 *
 * Skeleton for shows page (table layout)
 */
export const ShowsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-muted rounded" />
                    <div className="h-4 w-48 bg-muted rounded" />
                </div>
                <div className="flex space-x-3">
                    <div className="h-10 w-32 bg-muted rounded" />
                    <div className="h-10 w-24 bg-muted rounded" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
                <div className="h-10 w-64 bg-muted rounded" />
                <div className="h-10 w-32 bg-muted rounded" />
                <div className="h-10 w-32 bg-muted rounded" />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="border-b border-border p-4">
                    <div className="grid grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-4 bg-muted rounded" />
                        ))}
                    </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="grid grid-cols-6 gap-4 items-center">
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-8 w-8 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Travel Skeleton
 *
 * Skeleton for travel planner page
 */
export const TravelSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-10 w-32 bg-muted rounded" />
            </div>

            {/* Map Section */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-96 bg-muted rounded-lg" />
            </div>

            {/* Trip Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="h-12 w-12 bg-muted rounded flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-3 w-3/4 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Mission Control Skeleton
 *
 * Skeleton for mission control page
 */
export const MissionSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted rounded" />
                    <div className="h-4 w-80 bg-muted rounded" />
                </div>
                <div className="h-10 w-32 bg-muted rounded" />
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-6 w-6 bg-muted rounded-full" />
                        </div>
                        <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <div className="h-6 w-32 bg-muted rounded" />
                        <div className="h-64 bg-muted rounded" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <div className="h-6 w-24 bg-muted rounded" />
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-16 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Settings Skeleton
 *
 * Skeleton for settings page
 */
export const SettingsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="h-8 w-32 bg-muted rounded" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded" />
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <div className="h-6 w-48 bg-muted rounded" />
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-32 bg-muted rounded" />
                                    <div className="h-10 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
