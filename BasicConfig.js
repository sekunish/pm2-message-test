const pm2 = require('pm2');
const util = require('util');

/**
 * 基本設定
 */
class BasicConfig {
    /**
     * コンストラクタ
     * @param {BasicConfig} param パラメータ
     */
    constructor(param = null) {
        /** @type {Date} 日時 */
        this.datetime = null;
        this.init(param);
    }

    /**
     * 初期化
     * @param {BasicConfig} param パラメータ
     */
    init(param) {
        if (param) {
            this.datetime = param.datetime || "";
        }
    }
}

// 保持用
const data = new BasicConfig({ datetime: Date.now() });

// 変更メッセージ受信
process.on('message', (message) => {
    /** @type {BasicConfig} */
    const conf = JSON.parse(message);
    data.setData(conf);
    console.log(`recieve. pid[${process.pid}]`)
});

module.exports = {
    /**
     * データを取得
     */
    getData: () => {
        return data;
    },

    /**
     * データを設定
     * @param {BasicConfig} param パラメータ
     */
    setData: (param) => {
        data.init(param);
     },
    /**
     * 子向けデータ送信
     */
    sendDataToChild: async () => {
        console.log('sendDataToChild start.');

        // 接続
        await util.promisify(pm2.connect())();
        // プロセスリストを取得
        const lst = await util.promisify(pm2.list)();
        // マスタ以外をループ
        const lstChild = lst.filter((v) => { return v.pid != v.pm_id && v.name !== 'srv';});
        lstChild.forEach((v) => {
            // 送信
            pm2.sendDataToProcessId(v.pid, JSON.stringify(data), (err, result) => {
                if (err) {
                    // 失敗した場合
                    console.log(`${v.pid}への送信失敗[${err}]`);
                }
            });
        });

        console.log('sendDataToChild end.');
    },

    /**
     * マスタ向けデータ送信
     */
    sendDataToMaster: async () => {
        console.log('sendDataToMaster start.');

        // 接続
        await pm2.connect();
        // プロセスリストを取得
        const lstSrv = await util.promisify(pm2.list)();

        // マスタのPIDを取得
        let pid = null;
        lstSrv.filter((v) => {v.name === 'srv'}).map((v) => {
            pid = v.pid;
        })
        pm2.sendDataToProcessId(pid, JSON.stringify(data), (err, result) => {
            throw new Error(`親プロセス[${pid}]への送信に失敗しました.`);
        });

        console.log('sendDataToMaster end.');
    }
}