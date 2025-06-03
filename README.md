# 概要
### 気になるグルメ、シェア＆ストック！
「シェアグル」は、気になる飲食店を家族や友人、恋人、同僚とシェア＆ストックできるアプリです。<br />
外食する際の「どこ行こう？」問題を、スムーズに楽しく解決します。

# 要件定義
* 現状分析
    * 複数人で飲食店を決める際、LINEで送り合うと情報が流れてしまう
    * 気になる飲食店をメモアプリなどに保存しても、URL管理が煩雑
* 課題
    * 複数人での飲食店の比較・検討がスムーズにできない
    * ストックした飲食店の情報を整理・活用しにくい
* 解決策
    * 飲食店情報をアプリ内でシェア＆ストックできる仕組みを提供
    * 写真一覧や地図上で視覚的に比較・検討が可能に
    * お店ごとのメモ機能により、気になる情報を整理

# 機能詳細
* 検索
    * 検索窓から飲食店を検索＆非検索時はおすすめの飲食店を表示<br />
* シェア
    * グループのメンバーに飲食店情報をシェアし、写真一覧で表示<br />
* マップ
     * シェアされた飲食店の位置情報をマーカーで表示<br />
* メモ
    * 飲食店ごとに気になるポイントを記載<br />
* 保存（ストック）
    * 個人で気になる飲食店を保存<br />
* 認証機能
* グループ管理（※招待機能は現時点でダミー）

# 使用技術
* フロントエンド
    * Next.js
    * React
    * TypeScript
    * Tailwind CSS

* バックエンド
    * Supabase（認証・データベース）

* 外部API
    * Google Maps API
    * HOT PEPPER API

# デモURL・アカウント
* URL<br />
https://share-gourmet.vercel.app/auth/login

* テストアカウント
    * メールアドレス<br />
　　 devtest.yoshino@gmail.com

    * パスワード<br />
　　 12345abcde

# 画面キャプチャ<br />
<img width="419" alt="スクリーンショット 2025-06-02 18 42 51" src="https://github.com/user-attachments/assets/ec5835ed-bf19-404a-aa55-76f8ef5eeaf6" />
<br />
<img width="420" alt="スクリーンショット 2025-06-02 18 43 20" src="https://github.com/user-attachments/assets/ca8a7fdb-ebed-46bd-a20b-b4065645b03b" />
<br />
<img width="424" alt="スクリーンショット 2025-06-02 18 44 20" src="https://github.com/user-attachments/assets/f5846a0f-0a88-4816-bbd9-1ea2e83dc3f2" />
<br />
<img width="423" alt="スクリーンショット 2025-06-02 18 45 49" src="https://github.com/user-attachments/assets/37e2b7a1-2fa5-432a-8a18-f4bcd14c8e55" />
<br />
<img width="423" alt="スクリーンショット 2025-06-02 18 48 21" src="https://github.com/user-attachments/assets/1c1038f7-8248-42d3-a7b3-5368726e1608" />
<br />
<img width="420" alt="スクリーンショット 2025-06-02 18 44 43" src="https://github.com/user-attachments/assets/e46dd166-ee06-4d20-badb-dcd6ba29c423" />
