// app/constants/intents.ts

export interface IntentGroup {
  id: string;
  label: string;
  icon: string;
  colorClass: string;
  hasInput?: boolean;
}

export const FRIEND_INTENTS: IntentGroup[] = [
  {
    id: 'mushroom_invite',
    label: '我想找人打菇',
    icon: '🍄',
    colorClass: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  },
  {
    id: 'mushroom_carry',
    label: '我有戰力打蘑菇',
    icon: '🔥',
    colorClass: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
  },
  {
    id: 'postcard',
    label: '我想要明信片',
    icon: '💌',
    colorClass: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    hasInput: true,
  },
  {
    id: 'gift',
    label: '日常送禮',
    icon: '🎁',
    colorClass: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
  },
  {
    id: 'walk',
    label: '一起散步',
    icon: '🚶',
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  },
  {
    id: 'overseas',
    label: '我是海外好友',
    icon: '🌍',
    colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
  }
];

// Flat list for easy validation
export const ALL_INTENT_OPTIONS = FRIEND_INTENTS.map(intent => intent.id);
