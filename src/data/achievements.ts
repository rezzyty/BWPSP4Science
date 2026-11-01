export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
  condition: (state: { score: number; stars: number; coins: number; completedStages: Record<string, any>; totalCorrectAnswers: number }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: '冒險起航',
    description: '完成第一關科學挑戰，踏上認識地球之旅！',
    icon: '🚀',
    badgeColor: 'from-blue-400 to-indigo-600',
    condition: (state) => Object.keys(state.completedStages).length >= 1,
  },
  {
    id: 'star_collector',
    title: '閃耀之星',
    description: '累計獲得 10 顆星星榮譽！',
    icon: '⭐',
    badgeColor: 'from-yellow-400 to-amber-500',
    condition: (state) => state.stars >= 10,
  },
  {
    id: 'earth_expert',
    title: '地質小達人',
    description: '成功完成單元一第 1 課（地球結構與岩石土壤）所有關卡！',
    icon: '🌍',
    badgeColor: 'from-amber-600 to-orange-700',
    condition: (state) => {
      const ch1Keys = ['ch1_choice', 'ch1_fill_blank', 'ch1_word_bank', 'ch1_true_false', 'ch1_matching'];
      return ['choice', 'fill_blank', 'word_bank', 'true_false', 'matching'].every(
        (type) => !!state.completedStages[`ch1_${type}`]
      );
    },
  },
  {
    id: 'climate_guardian',
    title: '綠色碳足跡衛士',
    description: '完成天氣與氣候章節，掌握減碳與全球增溫知識！',
    icon: '🌱',
    badgeColor: 'from-emerald-400 to-teal-600',
    condition: (state) => {
      return ['choice', 'fill_blank', 'word_bank', 'true_false', 'matching'].some(
        (type) => !!state.completedStages[`ch3_${type}`]
      );
    },
  },
  {
    id: 'coin_master',
    title: '金幣大富翁',
    description: '背包累計擁有一百枚以上冒險金幣！',
    icon: '🪙',
    badgeColor: 'from-yellow-300 to-yellow-600',
    condition: (state) => state.coins >= 100,
  },
  {
    id: 'knowledge_hero',
    title: '科學答題英雄',
    description: '累計答對 25 道科學題目！',
    icon: '🏆',
    badgeColor: 'from-red-500 to-rose-700',
    condition: (state) => state.totalCorrectAnswers >= 25,
  },
  {
    id: 'ultimate_master',
    title: '小四科學大博士',
    description: '解鎖所有 15 個基礎關卡並獲得滿星榮譽！',
    icon: '👑',
    badgeColor: 'from-purple-500 via-pink-500 to-red-500',
    condition: (state) => Object.keys(state.completedStages).length >= 15,
  },
];
