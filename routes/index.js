const express = require('express');
const router = express.Router();
const bc = require('../BasicConfig');
const pm2 = require('pm2');

/**
 * 参照
 * @param {import('express').Request} req リクエスト
 * @param {import('express').Response} res レスポンス
 * @param {import('express').NextFunction} next ハンドラ
 */
router.get('/', (req, res, next) => {
  // 出力
  res.json(bc.getData());
});

/**
 * 登録
 * @param {import('express').Request} req リクエスト
 * @param {import('express').Response} res レスポンス
 * @param {import('express').NextFunction} next ハンドラ
 */
router.post('/', (req, res, next) => {
  (async () => {
    // 対象データの保持
    bc.setData({datetime: Date.now()});
    // マスタへの送信
    await bc.sendDataToMaster();

    // 出力
    res.send('登録しました.');
  })().catch(next);
});

module.exports = router;
