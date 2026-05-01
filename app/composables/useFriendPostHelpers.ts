import { ALL_INTENT_OPTIONS, FRIEND_INTENTS } from "~/constants/intents";
import { ALL_REGION_OPTIONS, FRIEND_REGIONS } from "~/constants/regions";
import scrapedImages from "../../scraped_images.json";

const PIKMIN_AVATAR_URLS = Object.values(scrapedImages) as string[];
const LEGACY_INTENT_TAGS = ["mushroom", "postcard"];

const hashToIndex = (value: string, modulo: number) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
};

export const useFriendPostHelpers = () => {
  const getPikminAvatar = (username: string): string => {
    if (PIKMIN_AVATAR_URLS.length === 0) return "";
    return PIKMIN_AVATAR_URLS[hashToIndex(username, PIKMIN_AVATAR_URLS.length)] || "";
  };

  const formatFriendCodeValue = (code: string) => {
    const digits = code.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const getPostRegions = (tags: string[] | null) => {
    if (!tags) return [];
    return tags.filter((tag) => ALL_REGION_OPTIONS.includes(tag));
  };

  const getPostIntents = (tags: string[] | null) => {
    if (!tags) return [];
    const validTags = tags.filter(
      (tag) =>
        ALL_INTENT_OPTIONS.includes(tag) ||
        LEGACY_INTENT_TAGS.includes(tag) ||
        tag.startsWith("postcard:"),
    );

    const hasDynamicPostcard = validTags.some((tag) =>
      tag.startsWith("postcard:"),
    );
    return validTags.filter(
      (tag) => !(tag === "postcard" && hasDynamicPostcard),
    );
  };

  const getIntentObj = (id: string) => FRIEND_INTENTS.find((intent) => intent.id === id);

  const getIntentIcon = (id: string) => {
    if (id === "mushroom") return "🍄";
    if (id.startsWith("postcard")) return "💌";
    return getIntentObj(id)?.icon || "";
  };

  const getIntentLabel = (id: string) => {
    if (id === "mushroom") return "打蘑菇";
    if (id === "postcard") return "交換明信片";
    if (id.startsWith("postcard:")) {
      const value = id.split(":")[1];
      return `想要 ${value} 明信片`;
    }
    return getIntentObj(id)?.label || id;
  };

  const getIntentColor = (id: string) => {
    if (id === "mushroom") return "bg-red-50 text-red-600 border-red-200";
    if (id.startsWith("postcard:")) {
      return "bg-blue-50 text-blue-600 border-blue-200 bg-opacity-70 backdrop-blur-sm shadow-sm";
    }
    return getIntentObj(id)?.colorClass || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getOptionsForCategory = (label: string) =>
    FRIEND_REGIONS.find((group) => group.label === label)?.options || [];

  return {
    getPikminAvatar,
    formatFriendCodeValue,
    formatDisplayCode: formatFriendCodeValue,
    getPostRegions,
    getPostIntents,
    getIntentIcon,
    getIntentLabel,
    getIntentColor,
    getOptionsForCategory,
  };
};
