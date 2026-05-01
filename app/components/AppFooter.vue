<template>
  <footer class="glass-frosted-shell border-b-0 mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="text-center space-y-5">
        <!-- Page Views Counter -->
        <div class="flex items-center justify-center gap-3">
          <span class="text-2xl">👀</span>
          <div>
            <p class="text-sm text-gray-500">{{ $t('footer.total_views') }}</p>
            <p class="text-2xl font-bold text-gradient">
              {{ formattedViews }}
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        <!-- Primary Links (Larger) -->
        <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-base px-2">
          <a 
            href="https://www.pikminwiki.com/Decor_Pikmin" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-emerald-600 hover:text-emerald-700 transition-colors font-medium underline underline-offset-2 py-2 sm:py-0"
          >
            {{ $t('footer.source') }}
          </a>
          <span class="hidden sm:inline text-gray-300">•</span>
          <a 
            href="https://www.pikminwiki.com/Pikipedia:General_disclaimer" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 sm:py-0"
          >
            {{ $t('footer.disclaimer') }}
          </a>
          <span class="hidden sm:inline text-gray-300">•</span>
          <a 
            href="https://pik-tool.onrender.com/feedback"
            class="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 sm:py-0"
          >
            {{ $t('footer.feedback') }}
          </a>
        </div>

        <!-- Secondary Links (Smaller) -->
        <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <a 
            href="https://github.com/scott0127/pik_tool" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            <span>⭐</span>
            <span>GitHub</span>
          </a>
        </div>

        <!-- Contact Email -->
        <div class="text-sm text-gray-600 max-w-2xl mx-auto px-4">
          <p>
            {{ $t('footer.contact_me') }}
            <a 
              href="mailto:scott5497ify@gmail.com"
              class="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium"
            >
              scott5497ify@gmail.com
            </a>
          </p>
          <p class="text-xs text-gray-500 mt-1">{{ $t('footer.takedown_help') }}</p>
        </div>

        <!-- Detailed Copyright Disclaimer -->
        <div class="border-t border-gray-200 pt-5">
          <h3 class="text-base font-bold text-gray-700 mb-4 text-center">
            完整版權與授權免責聲明 (Full Copyright Disclaimer)
          </h3>
          
          <div class="text-left max-w-4xl mx-auto bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs sm:text-sm">
              <!-- Chinese Disclaimer -->
              <div>
                <h3 class="text-base font-bold text-gray-800 mb-3">中文聲明 (Chinese Disclaimer)</h3>
                
                <div class="space-y-4">
                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">文字內容授權</h4>
                    <p class="text-gray-700 leading-relaxed">
                      本網站部分文字內容翻譯或引用自 <a href="https://www.pikminwiki.com/" target="_blank" class="text-emerald-600 hover:text-emerald-700 underline">Pikipedia</a>。根據該網站之規範，相關文字內容採用 
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant" target="_blank" class="text-emerald-600 hover:text-emerald-700 underline font-medium">創用 CC 姓名標示-相同方式分享 4.0 國際授權條款 (CC BY-SA 4.0)</a> 
                      釋出。若您重製或引用本站基於 Wiki 修改之內容，亦須採用相同授權條款。
                    </p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">智慧財產權聲明（非官方性質）</h4>
                    <p class="text-gray-700 leading-relaxed">
                      本網站為《皮克敏》(Pikmin) 系列之<strong>非官方粉絲網站</strong>，與任天堂 (Nintendo) 無任何關聯、隸屬、贊助或背書關係。
                      網站內出現的所有遊戲截圖、官方美術圖、遊戲角色名稱與商標，其版權均歸 Nintendo 所有。本站僅依據著作權法之「合理使用」原則，基於評論、研究、教學與資訊分享之目的使用上述素材。
                    </p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">關於贊助與開源專案聲明</h4>
                    <p class="text-gray-700 leading-relaxed mb-2">
                      本網站提供的所有資訊內容皆為免費公開。本站所設之 "Buy Me a Coffee" 或贊助連結，其目的僅限於：
                    </p>
                    <ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li><strong>支持開源開發：</strong>鼓勵本站於 GitHub 上之開源程式碼維護、功能優化及技術除錯。</li>
                      <li><strong>開發勞力支持：</strong>對於開發者在架構網站、整理數據所付出之個人勞務與時間給予實質鼓勵。</li>
                      <li><strong>營運成本分擔：</strong>協助支付伺服器租賃、網域維持等非營利性之必要開銷。</li>
                    </ul>
                    <p class="text-gray-700 leading-relaxed mt-3">
                      <strong class="text-red-600">特別聲明：</strong>
                      任何贊助行為皆屬於使用者的自願性贈與，並非取得任天堂智慧財產權（包括圖片、商標、角色設計）之對價。本專案從未透過販售、授權或商業化任天堂之智慧財產權進行任何營利行為。
                    </p>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              <!-- English Disclaimer -->
              <div>
                <h3 class="text-base font-bold text-gray-800 mb-3">英文聲明 (English Disclaimer)</h3>
                
                <div class="space-y-4">
                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">Text Content License</h4>
                    <p class="text-gray-700 leading-relaxed">
                      Portions of the text content on this website are derived or translated from <a href="https://www.pikminwiki.com/" target="_blank" class="text-emerald-600 hover:text-emerald-700 underline">Pikipedia</a>. In accordance with their terms, this text is made available under the 
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" class="text-emerald-600 hover:text-emerald-700 underline font-medium">Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)</a>. 
                      Any redistribution or derivative works based on this content must also be released under the same license.
                    </p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">Intellectual Property (Unofficial Status)</h4>
                    <p class="text-gray-700 leading-relaxed">
                      This is an <strong>unofficial fan website</strong> dedicated to the Pikmin series and is not affiliated with, endorsed by, or sponsored by Nintendo. All game screenshots, official artwork, character names, and trademarks contained herein are the property of Nintendo. These assets are used for educational, informational, and review purposes under the doctrine of Fair Use.
                    </p>
                  </div>

                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">Statement Regarding Donations and Open Source</h4>
                    <p class="text-gray-700 leading-relaxed mb-2">
                      All content provided on this website is accessible to the public free of charge. The "Buy Me a Coffee" or donation links on this site are strictly intended for:
                    </p>
                    <ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li><strong>Supporting Open Source:</strong> Encouraging the maintenance, optimization, and debugging of the open-source code hosted on GitHub.</li>
                      <li><strong>Development Effort:</strong> Supporting the developer's personal labor and time invested in site architecture and data organization.</li>
                      <li><strong>Operational Costs:</strong> Assisting with essential non-profit expenses such as server hosting and domain registration.</li>
                    </ul>
                    <p class="text-gray-700 leading-relaxed mt-3">
                      <strong class="text-red-600">Specific Disclaimer:</strong>
                      Any donation is a voluntary contribution (gift) and does not constitute a payment or consideration for the acquisition of Nintendo's intellectual property (including images, trademarks, or character designs). This project has never engaged in any profit-making activities through the sale, licensing, or commercialization of Nintendo's intellectual property.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <!-- Copyright -->
        <div class="text-xs text-gray-400 space-y-1">
          <p>{{ $t('footer.copyright') }}</p>
          <p>{{ $t('footer.unofficial') }}</p>
          <p class="text-gray-400">{{ $t('footer.made_by') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { pageViews, incrementPageViews } = usePageViews();

// Format number with thousands separator
const formattedViews = computed(() => {
  if (pageViews.value === null) return '---';
  return pageViews.value.toLocaleString('zh-TW');
});

// Increment page views on mount
onMounted(async () => {
  await incrementPageViews();
});
</script>
