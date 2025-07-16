export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">プライバシーポリシー</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. 個人情報の収集について</h2>
              <p>
                Modern Task Manager（以下、「当サイト」）では、ユーザーの個人情報を以下の目的で収集いたします：
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため</li>
                <li>サービスの改善・分析のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Google AdSenseについて</h2>
              <p>
                当サイトでは、広告配信サービス「Google AdSense」を利用しています。Googleは、当サイトを訪問したユーザーに対して個人に基づく広告を表示するために、Cookie（クッキー）を使用することがあります。
              </p>
              <p className="mt-2">
                Cookie を無効にする場合は、<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google広告設定</a>でパーソナライズド広告を無効にできます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. アクセス解析ツールについて</h2>
              <p>
                当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を利用しています。Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. 個人情報の第三者への開示</h2>
              <p>
                当サイトでは、個人情報を適切に管理し、以下に該当する場合を除いて第三者に開示することはありません：
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>法令等への協力のため、開示が必要となる場合</li>
                <li>個人情報の取り扱いを外部に委託する場合</li>
                <li>合併、会社分割等により個人情報の承継が行われる場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. 免責事項</h2>
              <p>
                当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。
              </p>
              <p className="mt-2">
                当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. プライバシーポリシーの変更について</h2>
              <p>
                当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。修正された最新のプライバシーポリシーは常に本ページにて開示されます。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
            <p>制定日: 2025年7月16日</p>
            <p>最終更新日: 2025年7月16日</p>
          </div>
        </div>
      </div>
    </div>
  )
}
