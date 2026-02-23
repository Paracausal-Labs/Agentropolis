'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Activity } from 'lucide-react'

export function EconomicsSlide() {
    return (
        <MotionSlide id="slide-economics">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-12">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Economics
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 leading-none">
                        Yellow Transaction <span className="text-[#FCEE0A]">Economics</span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg text-gray-400 font-medium">
                        This product directly drives Yellow channel volume and TVL
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="overflow-x-auto border border-white/10 bg-black/60 backdrop-blur-md mb-8">
                    <table className="w-full text-left text-sm md:text-base">
                        <thead className="bg-white/5 font-mono uppercase tracking-wider text-[#FCEE0A] border-b border-white/10">
                            <tr>
                                <th className="p-4 font-normal text-gray-400">Scenario</th>
                                <th className="p-4 font-semibold">100 Users</th>
                                <th className="p-4 font-semibold">1,000 Users</th>
                                <th className="p-4 font-semibold">10,000 Users</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">Daily trading volume</td>
                                <td className="p-4">$5K</td>
                                <td className="p-4">$50K</td>
                                <td className="p-4">$500K</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">Monthly trading fee rev</td>
                                <td className="p-4">$450 to $2,250</td>
                                <td className="p-4">$4,500 to $22,500</td>
                                <td className="p-4">$45,000 to $225,000</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">Monthly marketplace rev</td>
                                <td className="p-4">$150</td>
                                <td className="p-4">$1,500</td>
                                <td className="p-4">$15,000</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">Monthly tournament rev</td>
                                <td className="p-4">$200</td>
                                <td className="p-4">$2,000</td>
                                <td className="p-4">$20,000</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors bg-white/5 font-bold">
                                <td className="p-4 text-white">Total monthly revenue</td>
                                <td className="p-4 text-[#00F0FF]">~$800 to $2,600</td>
                                <td className="p-4 text-[#00F0FF]">~$8,000 to $26,000</td>
                                <td className="p-4 text-[#00F0FF]">~$80,000 to $260,000</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors bg-[#FCEE0A]/10 border-t-2 border-[#FCEE0A]/30">
                                <td className="p-4 font-medium text-[#FCEE0A] flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Yellow channel txs/day
                                </td>
                                <td className="p-4 text-[#FCEE0A] font-bold">2,000 to 10,000</td>
                                <td className="p-4 text-[#FCEE0A] font-bold">20,000 to 100,000</td>
                                <td className="p-4 text-[#FCEE0A] font-bold">200,000 to 1,000,000</td>
                            </tr>
                        </tbody>
                    </table>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <motion.div variants={itemVariants} className="flex-1 border border-white/5 bg-black/40 p-4 text-xs font-mono text-gray-500 space-y-2">
                        <div className="text-gray-400 mb-2">ASSUMPTIONS</div>
                        <div className="flex gap-2"><span>•</span><span>Avg active user trades ~$50/day</span></div>
                        <div className="flex gap-2"><span>•</span><span>Marketplace and tournament activity scales with user base</span></div>
                        <div className="flex gap-2"><span>•</span><span>Active users generate 20 to 100 Yellow channel txs/day</span></div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex-1 border-l-4 border-[#FCEE0A] pl-6 text-xl md:text-2xl font-bold text-white">
                        Even modest adoption produces <span className="text-[#FCEE0A]">meaningful channel volume</span> for Yellow.
                    </motion.div>
                </div>
            </motion.div>
        </MotionSlide>
    )
}
