@AGENTS.md

# white-tee-ec プロジェクトルール

## セッション開始前の必須手順

作業を始める前に必ず以下を実行してください：

```bash
git fetch origin
git pull origin main
```

Cursor と Claude Code のどちらかが先に push している可能性があります。pull せずに編集すると競合が発生します。

## ブランチ

- 通常の作業ブランチ: `main`
- 大きな変更は feature ブランチを切り、PR 経由で main にマージする
- 同時に同じファイルを Cursor と Claude で編集しない

## コミット後

編集が終わったら：

```bash
git push origin main
```

feature ブランチで作業している場合：

```bash
git push origin <branch-name>
```
