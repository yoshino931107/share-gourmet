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
・検索 - 検索窓から飲食店を検索＆非検索時はおすすめの飲食店を表示<br />
・シェア - グループのメンバーに飲食店情報をシェアし、写真一覧で表示<br />
・マップ - シェアされた飲食店の位置情報をマーカーで表示<br />
・メモ - 飲食店ごとに気になるポイントを記載<br />
・保存（ストック） - 個人で気になる飲食店を保存（※実装予定）<br />
・認証機能<br />
・グループ管理

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
・URL<br />
https://share-gourmet.vercel.app/auth/login

*テストアカウント
 - メールアドレス<br />
devtest.yoshino@gmail.com

 - パスワード<br />
12345abcde

# 画面キャプチャ<br />
<img width="423" alt="スクリーンショット 2025-05-28 22 46 37" src="https://github.com/user-attachments/assets/d4fb957f-1a7e-49ff-9118-ab8d7d2d6d9b" />
<br />
<img width="424" alt="スクリーンショット 2025-05-28 22 48 27" src="https://github.com/user-attachments/assets/f80a8861-dd25-4c41-9139-e86ba8974391" />
<br />
<img width="423" alt="スクリーンショット 2025-05-28 22 49 47" src="https://github.com/user-attachments/assets/ba924459-150b-4f1c-8f56-7851e999964e" />
<br />
<img width="422" alt="スクリーンショット 2025-05-28 22 51 01" src="https://github.com/user-attachments/assets/e1b7946b-ad69-4a5b-ba73-d55675da911f" />
