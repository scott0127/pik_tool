<template>
  <footer class="app-footer mt-auto">
    <div class="footer-inner">
      <div class="footer-top">
        <section class="visitor-ledger" aria-labelledby="footer-views-title">
          <div class="ledger-heading">
            <span class="ledger-mark" aria-hidden="true"><img src="/images/brand/seedling.png" width="40" height="40" alt="" /></span>
            <h2 id="footer-views-title">{{ $t('footer.total_views') }}</h2>
          </div>
          <FooterFlipCounter :value="pageViews" />
          <p class="ledger-thanks">{{ $t('footer.thanks') }}</p>
        </section>

        <div class="footer-information">
          <nav class="footer-links" :aria-label="$t('footer.links_label')">
            <a href="https://www.pikminwiki.com/Decor_Pikmin" target="_blank" rel="noopener noreferrer" class="footer-source footer-link">
              <span>{{ $t('footer.source') }}</span><span class="footer-link-arrow" aria-hidden="true">↗</span>
            </a>
            <div class="footer-link-pair">
              <a href="https://www.pikminwiki.com/Pikipedia:General_disclaimer" target="_blank" rel="noopener noreferrer" class="footer-link">
                <span>{{ $t('footer.disclaimer') }}</span><span class="footer-link-arrow" aria-hidden="true">↗</span>
              </a>
              <a href="https://pik-tool.onrender.com/feedback" class="footer-link">
                <span>{{ $t('footer.feedback') }}</span><span class="footer-link-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
            <a href="https://github.com/scott0127/pik_tool" target="_blank" rel="noopener noreferrer" class="footer-github footer-link">
              <span><Icon name="ph:github-logo-fill" aria-hidden="true" /> GitHub</span><span class="footer-link-arrow" aria-hidden="true">↗</span>
            </a>
          </nav>

          <address class="footer-contact">
            <p>{{ $t('footer.contact_me') }}</p>
            <a href="mailto:scott5497ify@gmail.com">scott5497ify@gmail.com <span aria-hidden="true">↗</span></a>
            <small>{{ $t('footer.takedown_help') }}</small>
          </address>
        </div>
      </div>

        <!-- Detailed Copyright Disclaimer -->
        <details class="footer-legal">
          <summary><span>{{ $t('footer.full_disclaimer') }}</span><span class="legal-toggle" aria-hidden="true"></span></summary>
          
          <div class="text-left max-w-4xl mx-auto bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs sm:text-sm">
              <!-- Chinese Disclaimer -->
              <div>
                <h3 class="text-base font-bold text-gray-800 mb-3">中文聲明 (Chinese Disclaimer)</h3>
                
                <div class="space-y-4">
                  <div>
                    <h4 class="font-semibold text-emerald-700 mb-2">文字內容授權</h4>
                    <p class="text-gray-700 leading-relaxed">
                      本網站部分文字內容翻譯或引用自 <a href="https://www.pikminwiki.com/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline">Pikipedia</a>。根據該網站之規範，相關文字內容採用 
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline font-medium">創用 CC 姓名標示-相同方式分享 4.0 國際授權條款 (CC BY-SA 4.0)</a> 
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
                      Portions of the text content on this website are derived or translated from <a href="https://www.pikminwiki.com/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline">Pikipedia</a>. In accordance with their terms, this text is made available under the 
                      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline font-medium">Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)</a>. 
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
        </details>

        <!-- Copyright -->
        <div class="footer-copyright">
          <p>{{ $t('footer.copyright') }}</p>
          <p>{{ $t('footer.unofficial') }}</p>
          <p>{{ $t('footer.made_by') }}</p>
        </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { pageViews, incrementPageViews } = usePageViews();

// Increment page views on mount
onMounted(async () => {
  await incrementPageViews();
});
</script>

<style scoped>
.app-footer { position: relative; border-top: 3px solid #10b981; background: #f6faf5; color: #294b3f; }
.footer-inner { max-width: 1056px; margin: 0 auto; padding: 28px 18px 24px; }
.footer-top { display: grid; gap: 24px; }
.visitor-ledger { position: relative; padding: 22px 18px 18px; border: 1px solid #d5e5da; border-radius: 24px 24px 24px 10px; background: #fffdf7; box-shadow: 0 4px 0 #dfebe0, 0 12px 22px #2a654209, inset 0 1px 0 #fff; }
.ledger-heading { display: flex; align-items: center; gap: 11px; margin-bottom: 20px; }
.ledger-mark { display: grid; place-items: center; width: 42px; height: 42px; background: #e6f5e8; border-radius: 13px 13px 13px 5px; flex-shrink: 0; }
.ledger-mark img { width: 32px; height: 32px; object-fit: contain; }
.ledger-heading h2 { margin: 0; color: #294b3f; font-size: 16px; font-weight: 800; letter-spacing: .04em; }
.ledger-thanks { margin: 16px 0 0; color: #728379; font-size: 11px; letter-spacing: .05em; }
.footer-information { min-width: 0; }
.footer-links { display: grid; gap: 0; }
.footer-link { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 50px; padding: 10px 0; color: #39574a; font-size: 13px; font-weight: 650; text-decoration: none; border-bottom: 1px solid #dbe7de; -webkit-tap-highlight-color: transparent; }
.footer-source { color: #059669; font-size: 15px; font-weight: 750; }
.footer-link-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.footer-link-arrow { flex-shrink: 0; color: #82988b; font-size: 17px; transition: transform .2s, color .2s; }
.footer-github > span:first-child { display: flex; align-items: center; gap: 8px; }
.footer-github :deep(.iconify) { width: 19px; height: 19px; }
.footer-link:active { color: #059669; }
.footer-link:active .footer-link-arrow { transform: translate(2px, -2px); }
.footer-contact { margin-top: 20px; font-style: normal; }
.footer-contact p { margin: 0 0 5px; color: #728379; font-size: 11px; }
.footer-contact a { display: inline-flex; align-items: center; gap: 10px; min-height: 32px; color: #047857; font-size: 14px; font-weight: 700; text-decoration-thickness: 1px; text-underline-offset: 4px; }
.footer-contact a span { color: #82988b; }
.footer-contact small { display: block; margin-top: 4px; color: #728379; font-size: 11px; line-height: 1.7; }
.footer-legal { margin-top: 24px; border-top: 1px solid #dbe7de; border-bottom: 1px solid #dbe7de; }
.footer-legal summary { display: flex; justify-content: space-between; align-items: center; gap: 14px; min-height: 54px; padding: 12px 0; list-style: none; cursor: pointer; color: #546d5f; font-size: 12px; font-weight: 650; }
.footer-legal summary::-webkit-details-marker { display: none; }
.legal-toggle { position: relative; width: 22px; height: 22px; border: 1px solid #cdded2; border-radius: 50%; flex-shrink: 0; }
.legal-toggle::before, .legal-toggle::after { content: ''; position: absolute; inset: 9px 5px auto; height: 1px; background: #5f7d6a; }
.legal-toggle::after { transform: rotate(90deg); transition: transform .2s; }
.footer-legal[open] .legal-toggle::after { transform: rotate(0); }
.footer-legal > div { margin: 0 0 18px; background: #edf4ed; color: #456151; }
.footer-copyright { display: grid; gap: 6px; padding-top: 20px; color: #798b80; font-size: 10px; line-height: 1.7; }
.footer-copyright p { margin: 0; }
.app-footer a:focus-visible, .footer-legal summary:focus-visible { outline: 2px solid #10b981; outline-offset: 4px; border-radius: 3px; }
@media (hover: hover) { .footer-link:hover { color: #059669; } .footer-link:hover .footer-link-arrow { color: #059669; transform: translate(2px, -2px); } }
@media (min-width: 640px) { .footer-inner { padding: 40px 28px 28px; } .footer-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: center; } .visitor-ledger { padding: 26px 26px 22px; } .ledger-heading { margin-bottom: 26px; } .ledger-thanks { margin-top: 22px; } .footer-copyright { grid-template-columns: 1fr auto; } .footer-copyright p:nth-child(2) { grid-column: 1; } .footer-copyright p:last-child { grid-column: 2; grid-row: 1 / span 2; align-self: end; } }
@media (prefers-reduced-motion: reduce) { .footer-link-arrow, .legal-toggle::after { transition: none; } }
</style>
