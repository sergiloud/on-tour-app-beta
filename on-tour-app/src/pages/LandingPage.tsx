import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    MapPin,
    DollarSign,
    Calendar,
    TrendingUp,
    Zap,
    CheckCircle,
    ArrowRight,
    BarChart3,
    Globe2,
    Shield,
    FileSpreadsheet,
    XCircle,
    AlertTriangle,
    Clock,
    Search,
    Mic2,
    Users,
    Building2,
    Clipboard
} from 'lucide-react';
import { PricingTable } from '../components/home/PricingTable';
import { t } from '../lib/i18n';

// Transformation Showcase Component
const TransformationShowcase: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Transform values for the transition - slower, more gradual
    const excelOpacity = useTransform(scrollYProgress, [0.15, 0.55], [1, 0]);
    const dashboardOpacity = useTransform(scrollYProgress, [0.45, 0.85], [0, 1]);
    const scale = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.98, 1, 0.98]);

    return (
        <div ref={containerRef} className="relative min-h-[150vh]">
            {/* Sticky container */}
            <div className="sticky top-24 max-w-5xl mx-auto">
                <motion.div style={{ scale }} className="relative">
                    {/* Excel View */}
                    <motion.div
                        style={{ opacity: excelOpacity }}
                        className="absolute inset-0 w-full"
                    >
                        <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-white shadow-2xl">
                            {/* Barra de título estilo Excel - Gris claro */}
                            <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 px-3 py-1.5 flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <FileSpreadsheet className="w-4 h-4 text-green-600 ml-2" />
                                <span className="text-xs font-medium text-gray-800">Tour_Planning_FINAL_v23_ACTUAL.xlsx - Excel</span>
                                <div className="ml-auto flex gap-1 text-xs text-gray-600">
                                    <button className="px-2 py-0.5 hover:bg-gray-300 rounded">−</button>
                                    <button className="px-2 py-0.5 hover:bg-gray-300 rounded">□</button>
                                    <button className="px-2 py-0.5 hover:bg-gray-300 rounded">✕</button>
                                </div>
                            </div>

                            {/* Excel Menu and Toolbar */}
                            <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-3 py-1 flex items-center gap-4 text-white text-xs">
                                <div className="flex gap-3">
                                    <span className="hover:underline cursor-pointer">File</span>
                                    <span className="hover:underline cursor-pointer">Home</span>
                                    <span className="hover:underline cursor-pointer font-semibold border-b-2 border-white">Insert</span>
                                    <span className="hover:underline cursor-pointer">Page Layout</span>
                                    <span className="hover:underline cursor-pointer">Formulas</span>
                                    <span className="hover:underline cursor-pointer">Data</span>
                                </div>
                            </div>

                            {/* Barra de herramientas */}
                            <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center gap-2 text-xs">
                                <div className="flex gap-1">
                                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700">💾</button>
                                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700">↶</button>
                                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-gray-700">↷</button>
                                </div>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <div className="flex items-center gap-1 text-gray-700">
                                    <span className="px-2">Arial</span>
                                    <select className="border border-gray-300 rounded px-1 py-0.5 text-xs">
                                        <option>11</option>
                                    </select>
                                </div>
                                <div className="ml-auto flex items-center gap-2 text-red-500 animate-pulse">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-semibold">3 errors detected</span>
                                </div>
                            </div>

                            {/* Formula Bar */}
                            <div className="bg-white border-b border-gray-300 px-3 py-1.5 flex items-center gap-2 text-xs">
                                <span className="font-semibold text-gray-700 w-12">A1</span>
                                <div className="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-500 font-mono">
                                    =VLOOKUP(B2,'Contracts'!$A$2:$D$50,3,FALSE)
                                </div>
                                <XCircle className="w-4 h-4 text-red-500" />
                            </div>

                            {/* Excel Content */}
                            <div className="bg-white">
                                {/* Tabs de hojas */}
                                <div className="border-b border-gray-300 bg-gray-100 flex items-center gap-0 text-xs">
                                    <button className="px-2 py-1 text-gray-500">◀</button>
                                    <button className="px-2 py-1 text-gray-500">▶</button>
                                    <div className="px-4 py-2 bg-white border-t-2 border-green-600 font-medium text-gray-800">Shows</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer">Venues</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer">Contracts</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer">Payments</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer">Travel</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer opacity-50">OLD_DATA</div>
                                    <div className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer opacity-50">DO_NOT_DELETE</div>
                                </div>

                                {/* Excel Grid */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                        {/* Column Headers */}
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="w-8 border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1"></th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[80px]">A</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[120px]">B</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[100px]">C</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[90px]">D</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[80px]">E</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[80px]">F</th>
                                                <th className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2 min-w-[150px]">G</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-mono">
                                            {/* Row 1 - Headers */}
                                            <tr>
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">1</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Date</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Venue</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">City</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Fee</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Contract?</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Paid?</td>
                                                <td className="border border-gray-300 px-2 py-1 bg-blue-100 font-semibold text-gray-800">Notes</td>
                                            </tr>
                                            {/* Row 2 - ERROR */}
                                            <tr className="bg-red-50 hover:bg-red-100">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">2</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-red-600 font-bold">#REF!</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Madison Square Garden</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">NYC</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-red-600 font-bold">#VALUE!</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600">???</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600">maybe</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-red-600 text-[10px]">WHERE IS THE CONTRACT??</td>
                                            </tr>
                                            {/* Row 3 */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">3</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">15/03/2024</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-400"></td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Paris</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">$5000</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Y</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-400"></td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600 text-[10px]">check with Sarah about deposit</td>
                                            </tr>
                                            {/* Row 4 - WARNING */}
                                            <tr className="bg-yellow-50 hover:bg-yellow-100">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">4</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">20/03/24</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Blue Note Jazz Club</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">NYC</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-orange-600 font-semibold">PENDING CALC</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">sent</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-red-600 font-bold">OVERDUE!</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-red-600 text-[10px]">!!!URGENT - call venue!!!</td>
                                            </tr>
                                            {/* Row 5 */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">5</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">2024-04-01</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Teatro Apollo</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Madrid</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">€4500</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-400"></td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-400"></td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600 text-[10px]">need to convert EUR to USD manually</td>
                                            </tr>
                                            {/* Row 6 */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">6</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Mar 28</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-800">Paradiso</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-400"></td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600">7k?</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600">maybe</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600">no</td>
                                                <td className="border border-gray-300 px-2 py-1.5 text-gray-600 text-[10px]">waiting for confirmation email</td>
                                            </tr>
                                            {/* Row 7 - Empty row for spacing */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="border border-gray-300 bg-gray-200 text-gray-600 font-semibold text-center py-1 px-2">7</td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                                <td className="border border-gray-300 px-2 py-1.5"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Status bar estilo Excel */}
                            <div className="bg-gradient-to-b from-blue-600 to-blue-700 border-t border-blue-800 px-3 py-1 flex items-center justify-between text-xs text-white">
                                <div className="flex items-center gap-4">
                                    <span>Listo</span>
                                    <div className="w-px h-3 bg-white/30"></div>
                                    <span>Hoja1 de 7</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-red-500 px-2 py-0.5 rounded animate-pulse">
                                        <XCircle className="w-3 h-3" />
                                        <span className="font-semibold">3 errores</span>
                                    </div>
                                    <div className="w-px h-3 bg-white/30"></div>
                                    <span>Promedio: $8,125</span>
                                    <div className="w-px h-3 bg-white/30"></div>
                                    <span>Suma: $48,750</span>
                                    <div className="w-px h-3 bg-white/30"></div>
                                    <span className="opacity-75">100%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* OnTour Dashboard View */}
                    <motion.div
                        style={{ opacity: dashboardOpacity }}
                        className="relative w-full"
                    >
                        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm shadow-2xl shadow-accent-500/10">
                            {/* Dashboard Header */}
                            <div className="border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                                        <div>
                                            <h3 className="text-lg font-semibold tracking-tight">Tour Dashboard</h3>
                                            <p className="text-xs opacity-60">Everything organized, in one place</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs opacity-60">All systems ready</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6 space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-accent-500" />
                                            <span className="text-xs opacity-60">Next 30 days</span>
                                        </div>
                                        <div className="text-3xl font-bold tracking-tight">12</div>
                                        <div className="text-xs opacity-60 mt-1">shows booked</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-accent-500" />
                                            <span className="text-xs opacity-60">Revenue</span>
                                        </div>
                                        <div className="text-3xl font-bold tracking-tight text-accent-500">$45k</div>
                                        <div className="text-xs opacity-60 mt-1">projected</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-xs opacity-60">Confirmed</span>
                                        </div>
                                        <div className="text-3xl font-bold tracking-tight text-green-500">9</div>
                                        <div className="text-xs opacity-60 mt-1">of 12 shows</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-accent-500" />
                                            <span className="text-xs opacity-60">Avg per show</span>
                                        </div>
                                        <div className="text-3xl font-bold tracking-tight">$3.8k</div>
                                        <div className="text-xs opacity-60 mt-1">average fee</div>
                                    </div>
                                </div>

                                {/* Show List */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <div>
                                                <div className="font-medium">Madison Square Garden</div>
                                                <div className="text-xs opacity-60">Mar 15, 2024 • New York City, USA</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold text-accent-500">$15,000</div>
                                            <div className="badge-soft">Confirmed</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <div>
                                                <div className="font-medium">Blue Note Jazz Club</div>
                                                <div className="text-xs opacity-60">Mar 20, 2024 • New York City, USA</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold text-accent-500">$8,500</div>
                                            <div className="badge-soft">Paid</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <div>
                                                <div className="font-medium">Teatro Apollo</div>
                                                <div className="text-xs opacity-60">Apr 1, 2024 • Madrid, Spain</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold">$5,850</div>
                                            <div className="badge-soft">Pending</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <div>
                                                <div className="font-medium">Paradiso</div>
                                                <div className="text-xs opacity-60">Mar 28, 2024 • Amsterdam, Netherlands</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold text-accent-500">$7,000</div>
                                            <div className="badge-soft">Confirmed</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Actions */}
                                <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-accent-500" />
                                        <span className="font-semibold text-accent-500">Smart Actions</span>
                                        <span className="ml-auto text-xs opacity-60">All handled automatically</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <span className="opacity-90">All contracts organized and linked to shows</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <span className="opacity-90">Currency automatically converted to USD</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <span className="opacity-90">Payment reminders sent, no overdue items</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <span className="opacity-90">Tour route optimized for minimal travel costs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// Mini Animation Components for Features
const FinanceAnimation: React.FC = () => {
    return (
        <div className="h-24 flex items-end justify-center gap-1">
            {[60, 85, 45, 95, 70].map((height, i) => (
                <motion.div
                    key={i}
                    className="w-8 rounded-t bg-gradient-to-t from-accent-500 to-blue-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                        duration: 1,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2,
                        repeatType: "reverse"
                    }}
                />
            ))}
        </div>
    );
};

const MapAnimation: React.FC = () => {
    const markers = [
        { x: 20, y: 30 },
        { x: 50, y: 20 },
        { x: 80, y: 40 },
        { x: 35, y: 60 },
        { x: 65, y: 70 }
    ];

    return (
        <div className="h-24 relative bg-slate-800/50 rounded-lg overflow-hidden">
            {/* Animated route line */}
            <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <motion.path
                    d="M 20,30 Q 35,25 50,20 T 80,40 Q 70,55 65,70"
                    stroke="rgba(191,255,0,0.3)"
                    strokeWidth="1"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
            </motion.svg>
            {/* Markers */}
            {markers.map((pos, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-accent-500"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        delay: i * 0.3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        duration: 0.3
                    }}
                >
                    <motion.div
                        className="absolute inset-0 rounded-full bg-accent-500"
                        animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

const ActionsAnimation: React.FC = () => {
    const priorities = [
        { color: 'from-red-500 to-red-600', height: '70%' },
        { color: 'from-amber-500 to-amber-600', height: '50%' },
        { color: 'from-blue-500 to-blue-600', height: '30%' }
    ];

    return (
        <div className="h-24 space-y-2">
            {priorities.map((item, i) => (
                <motion.div
                    key={i}
                    className={`h-6 rounded bg-gradient-to-r ${item.color} flex items-center px-2`}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: item.height, opacity: 1 }}
                    transition={{
                        duration: 0.6,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                >
                    <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
            ))}
        </div>
    );
};

// Live Dashboard Preview Component with REAL dynamic updates
const LiveDashboardPreview: React.FC = () => {
    const [showsCount, setShowsCount] = React.useState(12);
    const [revenue, setRevenue] = React.useState(45);
    const [newShowVisible, setNewShowVisible] = React.useState(false);
    const [tooltip, setTooltip] = React.useState<string | null>(null);

    // Update stats every 3 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setShowsCount(prev => prev + 1);
            setRevenue(prev => prev + Math.floor(Math.random() * 3) + 2);
            setNewShowVisible(true);
            setTooltip('New show confirmed!');

            setTimeout(() => {
                setNewShowVisible(false);
                setTooltip(null);
            }, 2000);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full rounded-xl glass border border-white/10 p-6 overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h3 className="text-lg font-semibold">Tour Dashboard</h3>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs opacity-60">Live</span>
                </div>
            </div>

            {/* Stats with LIVE updates */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-accent-500" />
                        <span className="text-xs opacity-60">Next 30 days</span>
                    </div>
                    <motion.div
                        key={showsCount}
                        initial={{ scale: 1.2, color: 'rgb(191, 255, 0)' }}
                        animate={{ scale: 1, color: 'rgb(255, 255, 255)' }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-bold tracking-tight"
                    >
                        {showsCount}
                    </motion.div>
                    <div className="text-xs opacity-60">shows booked</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-accent-500" />
                        <span className="text-xs opacity-60">Revenue</span>
                    </div>
                    <motion.div
                        key={revenue}
                        initial={{ scale: 1.2, color: 'rgb(191, 255, 0)' }}
                        animate={{ scale: 1, color: 'rgb(191, 255, 0)' }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-bold tracking-tight text-accent-500"
                    >
                        €{revenue}k
                    </motion.div>
                    <div className="text-xs opacity-60">projected</div>
                </div>
            </div>

            {/* Show List with NEW badge */}
            <div className="space-y-2 relative">
                {/* New show appearing */}
                {newShowVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent-500/20 border-2 border-accent-500"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-green-500"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                            />
                            <div>
                                <div className="text-sm font-medium">Amsterdam, NL</div>
                                <div className="text-xs opacity-60">Just added</div>
                            </div>
                        </div>
                        <div className="badge-soft bg-accent-500 text-black font-semibold px-2 py-1">NEW</div>
                    </motion.div>
                )}

                {/* Existing shows */}
                {[
                    { city: 'Berlin, DE', date: 'Mar 15', status: 'Confirmed', color: 'bg-green-500' },
                    { city: 'Paris, FR', date: 'Mar 20', status: 'Pending', color: 'bg-blue-500' }
                ].map((show, i) => (
                    <div
                        key={show.city}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${show.color}`} />
                            <div>
                                <div className="text-sm font-medium">{show.city}</div>
                                <div className="text-xs opacity-60">{show.date}, 2024</div>
                            </div>
                        </div>
                        <div className="badge-soft">{show.status}</div>
                    </div>
                ))}
            </div>

            {/* Floating tooltip */}
            {tooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-20 right-6 bg-accent-500 text-black text-xs font-medium px-3 py-2 rounded-lg shadow-xl"
                >
                    {tooltip}
                </motion.div>
            )}
        </div>
    );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ end, suffix = '', duration = 2 }) => {
    const [count, setCount] = React.useState(0);
    const [hasAnimated, setHasAnimated] = React.useState(false);
    const ref = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const increment = end / (duration * 60); // 60 fps
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 1000 / 60);
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [end, duration, hasAnimated]);

    return (
        <div ref={ref} className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-accent-500 to-blue-400 bg-clip-text text-transparent">
                {count.toLocaleString()}{suffix}
            </span>
        </div>
    );
};

// Interactive Comparison Slider Component
const InteractiveComparisonSlider: React.FC = () => {
    const [sliderPosition, setSliderPosition] = React.useState(50);
    const [isDragging, setIsDragging] = React.useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDrag = (_: any, info: any) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        const containerWidth = containerRef.current.offsetWidth;
        const newPosition = ((info.point.x - containerRef.current.getBoundingClientRect().left) / containerWidth) * 100;
        setSliderPosition(Math.max(0, Math.min(100, newPosition)));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-6xl mx-auto h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 cursor-ew-resize group"
            style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Excel View (Before) - Full background - ULTRA REALISTIC */}
            <div className="absolute inset-0 w-full h-full">
                <div className="w-full h-full bg-slate-200 p-4 overflow-hidden">
                    <div className="w-full h-full rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col">
                        {/* macOS Window Title Bar */}
                        <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-300 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" />
                                </div>
                                <span className="text-xs text-gray-700 font-medium ml-2">Tour_Planning_FINAL_v23_ACTUAL.xlsx - Excel</span>
                            </div>
                        </div>

                        {/* Excel Menu Bar */}
                        <div className="bg-white border-b border-gray-200 px-3 py-1">
                            <div className="flex gap-4 text-xs text-gray-700">
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">File</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer font-medium">Home</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Insert</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Page Layout</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Formulas</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Data</span>
                                <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Review</span>
                            </div>
                        </div>

                        {/* Excel Ribbon - Home Tab */}
                        <div className="bg-gradient-to-b from-blue-50 to-blue-100 border-b border-gray-300 px-2 py-2">
                            <div className="flex items-center gap-4 text-[10px]">
                                {/* Clipboard group */}
                                <div className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-blue-200/50 rounded cursor-pointer">
                                    <Clipboard className="w-4 h-4 text-gray-700" />
                                    <span className="text-gray-700">Paste</span>
                                </div>
                                <div className="w-px h-8 bg-gray-300" />
                                {/* Font group */}
                                <div className="flex items-center gap-1">
                                    <select className="text-[10px] border border-gray-300 rounded px-1 py-0.5 bg-white">
                                        <option>Arial</option>
                                    </select>
                                    <select className="text-[10px] border border-gray-300 rounded px-1 py-0.5 bg-white w-12">
                                        <option>11</option>
                                    </select>
                                    <button className="px-1 py-0.5 hover:bg-blue-200/50 rounded font-bold">B</button>
                                    <button className="px-1 py-0.5 hover:bg-blue-200/50 rounded italic">I</button>
                                    <button className="px-1 py-0.5 hover:bg-blue-200/50 rounded underline">U</button>
                                </div>
                                <div className="w-px h-8 bg-gray-300" />
                                {/* Alignment */}
                                <div className="flex items-center gap-1">
                                    <button className="px-1.5 py-0.5 hover:bg-blue-200/50 rounded">≡</button>
                                    <button className="px-1.5 py-0.5 hover:bg-blue-200/50 rounded">=</button>
                                </div>
                            </div>
                        </div>

                        {/* Formula Bar */}
                        <div className="bg-white border-b border-gray-300 px-2 py-1.5 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">A1</span>
                                <div className="flex gap-0.5">
                                    <button className="text-xs text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded">✕</button>
                                    <button className="text-xs text-green-600 hover:bg-green-50 px-1.5 py-0.5 rounded">✓</button>
                                </div>
                            </div>
                            <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5">
                                <span className="text-xs text-gray-900 font-mono">=VLOOKUP(B2,'Contracts'!$A$2:$D$50,3,FALSE)</span>
                            </div>
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>

                        {/* Excel Grid with Column Headers */}
                        <div className="flex-1 overflow-hidden bg-white">
                            {/* Column Headers (A, B, C, etc) */}
                            <div className="flex border-b border-gray-300">
                                <div className="w-10 h-5 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-600"></div>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((col) => (
                                    <div key={col} className="flex-1 min-w-[90px] h-5 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-600">
                                        {col}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Content */}
                            <div className="overflow-auto h-full">
                                {/* Header Row */}
                                <div className="flex border-b border-gray-300">
                                    <div className="w-10 h-7 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-600">1</div>
                                    {['Date', 'Venue', 'City', 'Fee', 'Contract?', 'Paid?', 'Notes', ''].map((header, i) => (
                                        <div key={i} className="flex-1 min-w-[90px] h-7 bg-blue-500 text-white border-r border-blue-400 px-2 flex items-center text-[10px] font-semibold">
                                            {header}
                                        </div>
                                    ))}
                                </div>

                                {/* Data Rows with Errors */}
                                {[
                                    { rowNum: '2', cells: ['#REF!', 'Madison Square Garden', 'New York', '#VALUE!', 'maybe?', 'idk', 'OVERDUE!', ''], bgRow: 'bg-white', errorRow: true },
                                    { rowNum: '3', cells: ['03/15/24', 'Blue Note', '', '$8,500', 'YES', 'PENDING', 'check email', ''], bgRow: 'bg-white', errorRow: false },
                                    { rowNum: '4', cells: ['', 'Teatro Apollo', 'Madrid', '€7,200', '', 'NO', 'WHERE IS CONTRACT??', ''], bgRow: 'bg-yellow-50', errorRow: true },
                                    { rowNum: '5', cells: ['3/25', 'Razzmatazz', 'Barcelona', '', 'x', '', 'call agent', ''], bgRow: 'bg-white', errorRow: false },
                                    { rowNum: '6', cells: ['#DIV/0!', 'Olympia', 'Paris', '€9,500', 'YES', 'YES', '', ''], bgRow: 'bg-white', errorRow: true },
                                    { rowNum: '7', cells: ['04/01/2024', 'Berghain', 'Berlin', '$12,000', '', '', 'URGENT!!!', ''], bgRow: 'bg-red-50', errorRow: true },
                                    { rowNum: '8', cells: ['4/5', '', 'Amsterdam', '#N/A', 'maybe', '???', 'lost email thread', ''], bgRow: 'bg-white', errorRow: true },
                                ].map((row, rowIdx) => (
                                    <div key={row.rowNum} className={`flex border-b border-gray-300 ${row.bgRow}`}>
                                        <div className="w-10 h-7 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-[9px] font-medium text-gray-600">
                                            {row.rowNum}
                                        </div>
                                        {row.cells.map((cell, cellIdx) => (
                                            <div
                                                key={cellIdx}
                                                className={`flex-1 min-w-[90px] h-7 border-r border-gray-300 px-2 flex items-center text-[10px] ${cell.startsWith('#') ? 'text-red-600 font-bold bg-red-50' :
                                                    cell.includes('OVERDUE') || cell.includes('URGENT') || cell.includes('WHERE') ? 'text-red-700 font-bold' :
                                                        cell.includes('PENDING') || cell.includes('???') || cell.includes('maybe') ? 'text-orange-600' :
                                                            'text-gray-900'
                                                    }`}
                                            >
                                                {cell}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sheet Tabs */}
                        <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-300 px-2 py-1 flex items-center gap-2 overflow-x-auto">
                            <div className="flex gap-1 text-[9px]">
                                <button className="px-2 py-1 bg-white border border-gray-300 border-t-2 border-t-green-500 rounded-t font-medium text-gray-900">Shows</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-600">Venues</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-600">Contracts</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-600">Payments</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-600">Travel</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-400 text-[8px]">OLD_DATA</button>
                                <button className="px-2 py-1 hover:bg-white/50 text-gray-400 text-[8px]">DO_NOT_DELETE</button>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white px-3 py-1 flex items-center justify-between text-[9px]">
                            <div className="flex items-center gap-4">
                                <span>Ready</span>
                                <span className="opacity-70">Sheet 1 of 7</span>
                                <span className="bg-red-500 px-2 py-0.5 rounded-full font-medium">7 errors</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-70">
                                <span>Average: $8,125</span>
                                <span>Sum: $48,750</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OnTour View (After) - Clipped by slider */}
            <motion.div
                className="absolute inset-0 w-full h-full"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                    <div className="w-full h-full rounded-xl glass border border-white/10 p-6 overflow-hidden">
                        {/* OnTour Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Tour Dashboard</h3>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="opacity-60">All systems ready</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-2xl font-bold">12</div>
                                <div className="text-xs opacity-60">Shows</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-2xl font-bold text-accent-500">€45k</div>
                                <div className="text-xs opacity-60">Revenue</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-2xl font-bold text-green-500">9</div>
                                <div className="text-xs opacity-60">Confirmed</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-2xl font-bold">$3.8k</div>
                                <div className="text-xs opacity-60">Avg/show</div>
                            </div>
                        </div>

                        {/* Show List */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div>
                                        <div className="text-sm font-medium">Madison Square Garden</div>
                                        <div className="text-xs opacity-60">Mar 15, 2024 • New York</div>
                                    </div>
                                </div>
                                <div className="badge-soft">Confirmed</div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div>
                                        <div className="text-sm font-medium">Blue Note</div>
                                        <div className="text-xs opacity-60">Mar 20, 2024 • New York</div>
                                    </div>
                                </div>
                                <div className="badge-soft">Confirmed</div>
                            </div>
                        </div>

                        {/* Smart Actions */}
                        <div className="mt-6 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-accent-500" />
                                <span className="text-sm font-medium">All contracts uploaded</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent-500" />
                                <span className="text-sm font-medium">All payments tracked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Slider Handle */}
            <motion.div
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-10"
                style={{
                    left: `${sliderPosition}%`,
                    background: 'linear-gradient(to bottom, rgba(191, 255, 0, 0.8), rgba(59, 130, 246, 0.8))'
                }}
                animate={{
                    boxShadow: isDragging
                        ? '0 0 20px rgba(191, 255, 0, 0.6)'
                        : '0 0 10px rgba(191, 255, 0, 0.3)'
                }}
                transition={{ duration: 0.2 }}
            >
                {/* Enhanced Handle Grip */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    style={{
                        background: 'linear-gradient(135deg, #bfff00 0%, #3b82f6 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(0, 0, 0, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.3)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                >
                    {/* Arrows */}
                    <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-black">
                            <path d="M8 6L3 1L3 11L8 6Z" fill="currentColor" />
                        </svg>
                        <div className="w-0.5 h-6 bg-black/30 rounded-full" />
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-black">
                            <path d="M4 6L9 11L9 1L4 6Z" fill="currentColor" />
                        </svg>
                    </div>
                </motion.div>

                {/* Floating label - always visible above handle */}
                {!isDragging && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.8, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -top-14 left-1/2 -translate-x-1/2 text-xs font-semibold bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-full whitespace-nowrap border border-white/20 shadow-lg"
                    >
                        Drag to compare
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    // Feature cards with styled illustrations (matching app aesthetic)
    const features = [
        {
            icon: MapPin,
            title: 'Your tour route, optimized',
            shortDesc: 'See routes, gaps, travel time instantly',
            bullets: [
                'See if Berlin→Paris→Madrid makes logistical sense',
                'Catch "You have 2 shows in different countries same day"',
                'Calculate actual driving time, not Google Maps fantasy'
            ],
            illustrationComponent: 'map'
        },
        {
            icon: DollarSign,
            title: 'Money that makes sense',
            shortDesc: 'Real-time profit, zero manual formulas',
            bullets: [
                'Per-show margin: "Madrid lost money, Berlin crushed it"',
                'Currency conversion that doesn\'t break at 3am',
                'Export Excel your accountant won\'t complain about'
            ],
            illustrationComponent: 'finance'
        },
        {
            icon: Zap,
            title: 'Tasks that prioritize themselves',
            shortDesc: 'Smart alerts for what matters right now',
            bullets: [
                '"Contract for Paris show expires in 2 days" → top of list',
                'Payment reminder before venue manager ghosts you',
                'Shows sorted by: Urgent / Important / Can Wait'
            ],
            illustrationComponent: 'actions'
        },
        {
            icon: Calendar,
            title: 'Show pipeline that shows reality',
            shortDesc: 'Offers, holds, confirmed - color-coded',
            bullets: [
                'Red dot = offer sent / Yellow = on hold / Green = confirmed',
                'No more "Wait, is that show confirmed?" in band group chat',
                'Drag shows between columns like Trello, but for tours'
            ],
            illustrationComponent: 'calendar'
        },
        {
            icon: FileSpreadsheet,
            title: 'Contracts you can actually find',
            shortDesc: 'Upload once, search forever',
            bullets: [
                'Link PDFs directly to shows: "Berlin show → Berlin contract"',
                'Search: "rider" → finds every contract with rider clause',
                'No more "I swear I saved it somewhere" at 11pm'
            ],
            illustrationComponent: 'contracts'
        },
        {
            icon: BarChart3,
            title: 'Analytics without the headache',
            shortDesc: 'Profit breakdown, instant export',
            bullets: [
                '"Festivals paid well, small venues broke even, UK tour lost money"',
                'Compare: What you thought you\'d make vs what actually happened',
                'Export for taxes: One click, accountant-friendly format'
            ],
            illustrationComponent: 'analytics'
        },
    ];

    return (
        <div className="hero-gradient min-h-screen">
            {/* Navigation */}
            <header className="navbar sticky top-0 z-50 backdrop-blur-sm bg-black/20 border-b border-white/10">
                <Link to="/" className="brand">
                    <span className="logo-bubble">OTA</span>
                    <span>On Tour App</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <a className="transition hover:opacity-100" style={{ opacity: .85 }} href="#features">Features</a>
                    <a className="transition hover:opacity-100" style={{ opacity: .85 }} href="#how-it-works">How it works</a>
                </nav>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="btn-ghost">Log in</Link>
                    <Link to="/register" className="btn-primary">Get started</Link>
                </div>
            </header>

            {/* Hero Section - Premium entrance */}
            <section className="relative px-6 pt-20 md:pt-32 pb-16 md:pb-24 overflow-hidden">
                {/* Animated ambient glow */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-transparent to-blue-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Hero Content with staggered reveals */}
                        <div className="relative">
                            <motion.h1
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="section-title mb-6 text-glow bg-gradient-to-r from-white via-accent-500 to-white bg-clip-text text-transparent"
                            >
                                Tour management<br />that doesn't suck
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl leading-relaxed mb-4 font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Excel is chaos. This is clarity.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-lg leading-relaxed mb-8"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Shows, money, contracts, and travel. One dashboard. No spreadsheet hell. Actually free.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 mb-6"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 20px 60px rgba(191, 255, 0, 0.4)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link to="/signup" className="btn-primary text-center inline-flex items-center gap-2">
                                        <span>Start Free Now</span>
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </Link>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link to="/demo" className="btn-ghost text-center">
                                        Watch 2-min Demo
                                    </Link>
                                </motion.div>
                            </motion.div>

                            {/* Trust indicators with stagger */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex flex-wrap gap-6 text-sm"
                            >
                                {[
                                    { icon: CheckCircle, text: t('landing.noCreditCard') },
                                    { icon: Clock, text: t('landing.minSetup') },
                                    { icon: Shield, text: t('landing.freeForever') }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 0.6, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                                        whileHover={{ opacity: 1, scale: 1.05 }}
                                        className="flex items-center gap-2 transition-all"
                                    >
                                        <item.icon className="w-4 h-4 text-accent-500" />
                                        <span>{item.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Quick Info with animated reveals */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.9 }}
                                className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10"
                            >
                                {[
                                    { value: t('landing.minValue'), label: t('landing.minToImport'), sublabel: t('landing.fromExcel') },
                                    { value: t('landing.freeValue'), label: t('landing.unlimitedShows'), sublabel: t('landing.noLimits') },
                                    { value: t('landing.webValue'), label: t('landing.worksOffline'), sublabel: t('landing.mobileReady') }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="text-3xl font-bold tracking-tight text-accent-500">{stat.value}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                                        <div className="text-xs opacity-50 mt-1">{stat.sublabel}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right: Live Dashboard Preview with REAL dynamic updates */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <LiveDashboardPreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* The Problem Section - Enhanced with better flow */}
            <section className="relative px-6 py-20 md:py-32 border-t border-white/10 overflow-hidden">
                {/* Animated gradient background */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-orange-950/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                />

                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-12"
                    >
                        <motion.h3
                            initial={{ scale: 0.95 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="section-title mb-4"
                        >
                            Why tour managers waste 10+ hours/week on spreadsheets
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            These problems aren't minor annoyances. They cost you real time and real money.
                        </motion.p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: XCircle, text: "Formulas break when you copy rows", color: "text-red-400", bg: "bg-red-500/5" },
                            { icon: MapPin, text: "Can't see your tour route visually", color: "text-orange-400", bg: "bg-orange-500/5" },
                            { icon: Search, text: "Payment tracking buried in 47 email threads", color: "text-amber-400", bg: "bg-amber-500/5" },
                            { icon: FileSpreadsheet, text: "Contracts lost somewhere in Google Drive", color: "text-yellow-400", bg: "bg-yellow-500/5" },
                            { icon: DollarSign, text: "Currency conversion errors cost real money", color: "text-red-400", bg: "bg-red-500/5" },
                            { icon: AlertTriangle, text: "No single source of truth = constant confusion", color: "text-orange-400", bg: "bg-orange-500/5" }
                        ].map((problem, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.08,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{
                                    scale: 1.02,
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                    transition: { duration: 0.2 }
                                }}
                                className={`flex items-start gap-4 p-5 rounded-xl ${problem.bg} border border-white/10 transition-all duration-300 cursor-default`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <problem.icon className={`w-6 h-6 flex-shrink-0 ${problem.color}`} />
                                </motion.div>
                                <p className="text-base leading-relaxed">{problem.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mt-12"
                    >
                        <motion.p
                            className="text-lg font-medium inline-flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="bg-gradient-to-r from-accent-500 to-blue-400 bg-clip-text text-transparent">
                                Sound familiar? Here's how it looks in OnTour
                            </span>
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="text-accent-500"
                            >
                                →
                            </motion.span>
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Excel to OnTour Transformation Section - Interactive Slider */}
            <section className="relative px-6 py-20 md:py-32">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="section-title mb-4 bg-gradient-to-r from-accent-500 via-blue-400 to-accent-500 bg-clip-text text-transparent">
                                The Transformation
                            </h3>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            From spreadsheet chaos to organized clarity
                        </motion.p>
                    </motion.div>

                    {/* Interactive Comparison Slider with scroll animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2
                        }}
                    >
                        <InteractiveComparisonSlider />
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Enhanced */}
            <section id="features" className="relative px-6 py-20 md:py-32 overflow-hidden">
                {/* Ambient background glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-16"
                    >
                        <motion.h3
                            initial={{ scale: 0.95 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="section-title mb-4"
                        >
                            Your Tour, Empowered
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Intelligence in action. Not just tools, but superpowers.
                        </motion.p>
                    </motion.div>

                    <div className="grid-auto-fit">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: i * 0.08,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                                }}
                                className="glass p-6 flex flex-col gap-4 cursor-pointer group relative"
                                style={{
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(191, 255, 0, 0.2), 0 0 40px rgba(59, 130, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(191, 255, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                {/* Styled Illustration - Matching app aesthetic */}
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 relative">
                                    {/* Render different illustration based on feature type */}
                                    {feature.illustrationComponent === 'map' && <MapAnimation />}
                                    {feature.illustrationComponent === 'finance' && <FinanceAnimation />}
                                    {feature.illustrationComponent === 'actions' && <ActionsAnimation />}
                                    {feature.illustrationComponent === 'calendar' && (
                                        <div className="h-full flex items-center justify-center gap-3 px-6">
                                            {[
                                                { color: 'bg-red-500', label: 'Offer' },
                                                { color: 'bg-amber-500', label: 'Hold' },
                                                { color: 'bg-green-500', label: 'Confirmed' }
                                            ].map((status, idx) => (
                                                <motion.div
                                                    key={status.label}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <motion.div
                                                        className={`w-3 h-3 rounded-full ${status.color}`}
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                                                    />
                                                    <span className="text-[10px] opacity-60">{status.label}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    {feature.illustrationComponent === 'contracts' && (
                                        <div className="h-full flex items-center justify-center gap-2 px-6">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="w-16 h-20 rounded bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center"
                                                >
                                                    <FileSpreadsheet className="w-6 h-6 text-accent-500/50" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    {feature.illustrationComponent === 'analytics' && (
                                        <div className="h-full flex items-end justify-center gap-2 px-6 pb-4">
                                            {[60, 85, 45, 75, 95].map((height, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${height}%` }}
                                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                    className="w-6 rounded-t bg-gradient-to-t from-accent-500 to-blue-400"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Icon + Title */}
                                <div className="flex items-start gap-3">
                                    <motion.div
                                        className="w-10 h-10 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center flex-shrink-0"
                                        whileHover={{
                                            backgroundColor: 'rgba(191,255,0,0.15)',
                                            borderColor: 'rgba(191,255,0,0.4)'
                                        }}
                                    >
                                        <feature.icon className="w-5 h-5 text-accent-500" />
                                    </motion.div>
                                    <div>
                                        <h4 className="font-semibold tracking-tight text-lg group-hover:text-accent-500 transition-colors mb-1">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {feature.shortDesc}
                                        </p>
                                    </div>
                                </div>

                                {/* Bullet Points */}
                                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {feature.bullets.map((bullet, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-accent-500 mt-0.5">•</span>
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Credibility Section - Premium polish with smooth reveals */}
            <section className="relative px-6 py-20 md:py-32 border-t border-white/10 overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent-500/5 via-accent-500/3 to-transparent" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="glass p-8 md:p-12 border-2 border-accent-500/20 rounded-2xl"
                        style={{
                            boxShadow: '0 0 60px rgba(191, 255, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <motion.h2
                                initial={{ scale: 0.95 }}
                                whileInView={{ scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-accent-500 to-white bg-clip-text text-transparent"
                            >
                                Built by tour managers,<br />for tour managers
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-lg"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Created by people who've managed 500+ shows. We've felt your pain.
                            </motion.p>
                        </motion.div>

                        <div className="space-y-4 mb-8">
                            {[
                                {
                                    icon: CheckCircle,
                                    title: "Real tour management experience",
                                    text: "Every feature born from actual frustration with Excel spreadsheets on the road. We've been there.",
                                    delay: 0.5
                                },
                                {
                                    icon: Users,
                                    title: "Currently in open beta",
                                    text: "Testing with 50+ touring professionals who are actively shaping the product. Real feedback, real improvements.",
                                    delay: 0.6
                                },
                                {
                                    icon: Building2,
                                    title: "Independent and focused",
                                    text: "Not owned by a ticketing giant. Not trying to be everything. Just tour management that actually works.",
                                    delay: 0.7
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        duration: 0.6,
                                        delay: item.delay,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    whileHover={{
                                        scale: 1.02,
                                        borderColor: 'rgba(191, 255, 0, 0.4)',
                                        backgroundColor: 'rgba(191, 255, 0, 0.05)',
                                        transition: { duration: 0.2 }
                                    }}
                                    className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 360 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        <item.icon className="w-6 h-6 text-accent-500 flex-shrink-0 mt-1" />
                                    </motion.div>
                                    <div>
                                        <h4 className="font-semibold mb-2 text-white">{item.title}</h4>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {item.text}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="text-center pt-6 border-t border-white/10"
                        >
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Questions? Ideas? Just want to chat about tour management?
                            </p>
                            <motion.a
                                href="mailto:hello@ontour.app"
                                initial={{ scale: 0.95 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.9 }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 10px 30px rgba(191, 255, 0, 0.3)',
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-500 text-black font-semibold hover:bg-accent-400 transition-colors"
                            >
                                <span>hello@ontour.app</span>
                                <motion.div
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            </motion.a>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.6 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 1 }}
                                className="text-xs mt-3"
                            >
                                We read every email. Usually reply within 24 hours.
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Real Talk - Enhanced step flow with progressive reveals */}
            <section id="how-it-works" className="relative px-6 py-20 md:py-32 border-t border-white/10 overflow-hidden">
                {/* Subtle gradient flow */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-transparent to-accent-950/5" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-16"
                    >
                        <motion.h2
                            initial={{ scale: 0.95 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="section-title mb-4 bg-gradient-to-r from-white via-accent-500 to-white bg-clip-text text-transparent"
                        >
                            Real talk
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Three steps. No bullshit. No credit card.
                        </motion.p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Import your Excel',
                                subtitle: 'Takes 5 minutes',
                                desc: 'We handle messy data. Seriously.',
                                details: [
                                    'Drag and drop your Excel file',
                                    "We'll figure out the columns",
                                    'Fix errors as you go, or later'
                                ]
                            },
                            {
                                step: '2',
                                title: 'Get organized automatically',
                                subtitle: 'Zero manual work',
                                desc: 'Shows on map. Finances calculated. Actions prioritized.',
                                details: [
                                    'Map plots your tour route instantly',
                                    'Revenue and costs auto-calculated',
                                    'Alerts for what needs attention'
                                ]
                            },
                            {
                                step: '3',
                                title: 'Actually use it',
                                subtitle: 'Offline, mobile-friendly',
                                desc: 'No learning curve. Just better tour management.',
                                details: [
                                    'Works without internet (really)',
                                    'Mobile-optimized for on the road',
                                    'Invite your team, everyone sees updates'
                                ]
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.7,
                                    delay: i * 0.12,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{
                                    scale: 1.03,
                                    y: -8,
                                    borderColor: 'rgba(191,255,0,0.4)',
                                    boxShadow: '0 0 40px rgba(191,255,0,0.2), 0 20px 40px -10px rgba(0,0,0,0.7)',
                                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                                }}
                                className="glass p-6 rounded-2xl transition-all duration-300 cursor-pointer group relative"
                            >
                                {/* Step connector line (hidden on mobile) */}
                                {i < 2 && (
                                    <motion.div
                                        className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent-500/50 to-transparent"
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: i * 0.12 + 0.4 }}
                                    />
                                )}

                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-blue-500 flex items-center justify-center shadow-glow flex-shrink-0"
                                        whileHover={{ scale: 1.15, rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <span className="text-2xl font-bold text-black">{item.step}</span>
                                    </motion.div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-semibold tracking-tight group-hover:text-accent-500 transition-colors duration-300">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-accent-500 font-medium">{item.subtitle}</p>
                                    </div>
                                </div>

                                <p className="text-sm font-medium mb-3">
                                    {item.desc}
                                </p>

                                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {item.details.map((detail, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.4,
                                                delay: i * 0.12 + idx * 0.1 + 0.3
                                            }}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="text-accent-500 mt-0.5 font-bold">•</span>
                                            <span>{detail}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Table */}
            <PricingTable />

            {/* Last Chance CTA - Premium urgency with magnetic appeal */}
            <section className="relative px-6 py-16 md:py-24 border-t border-white/10 overflow-hidden">
                {/* Radial glow effect */}
                <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="glass p-8 md:p-12 border-2 border-accent-500/20 text-center rounded-3xl"
                        style={{
                            boxShadow: '0 0 60px rgba(191, 255, 0, 0.15), 0 20px 50px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        <motion.h2
                            initial={{ scale: 0.95 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-accent-500 to-white bg-clip-text text-transparent"
                        >
                            Ready to stop fighting with Excel?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg mb-6"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Join 50+ tour managers who are shaping this tool in beta.
                        </motion.p>

                        {/* Enhanced beta badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-500/20 border border-accent-500/40 mb-8"
                            style={{
                                boxShadow: '0 0 20px rgba(191, 255, 0, 0.2)'
                            }}
                        >
                            <motion.div
                                className="w-2.5 h-2.5 rounded-full bg-accent-500"
                                animate={{
                                    opacity: [1, 0.3, 1],
                                    scale: [1, 1.2, 1],
                                    boxShadow: [
                                        '0 0 0 0 rgba(191, 255, 0, 0.4)',
                                        '0 0 0 4px rgba(191, 255, 0, 0)',
                                        '0 0 0 0 rgba(191, 255, 0, 0.4)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <span className="text-sm font-semibold text-accent-500">Beta users get early access perks</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 20px 60px rgba(191, 255, 0, 0.4), 0 0 80px rgba(191, 255, 0, 0.2)',
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="mb-8 inline-block"
                        >
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-accent-500 text-black text-lg font-bold hover:bg-accent-400 transition-colors shadow-glow"
                            >
                                <span>Start Free - 5 Minutes</span>
                                <motion.div
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </motion.div>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-wrap justify-center gap-8 text-sm mb-6"
                        >
                            {[
                                { icon: CheckCircle, text: t('landing.noCreditCard') },
                                { icon: Shield, text: t('landing.freeForever') },
                                { icon: Zap, text: t('landing.minSetup') }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                                    whileHover={{ scale: 1.1, color: '#bfff00' }}
                                    className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all"
                                >
                                    <item.icon className="w-4 h-4 text-accent-500" />
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            className="pt-6 border-t border-white/10"
                        >
                            <p className="text-sm mb-3 opacity-60">Questions? We reply in ~24 hours</p>
                            <motion.a
                                href="mailto:hello@ontour.app"
                                whileHover={{ scale: 1.05 }}
                                className="text-accent-500 hover:text-accent-400 transition-colors font-semibold inline-block"
                            >
                                hello@ontour.app
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer - Minimal and Real */}
            <footer className="relative z-10 px-6 py-8 border-t border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-3">
                            <span className="logo-bubble text-sm">OTA</span>
                            <div className="font-semibold tracking-tight">On Tour App</div>
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            © {new Date().getFullYear()} · Built for touring artists · <a href="mailto:hello@ontour.app" className="text-accent-500 hover:text-accent-400 transition-colors">hello@ontour.app</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
